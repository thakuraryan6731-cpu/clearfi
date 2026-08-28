const { createClient } = require("@supabase/supabase-js");
const calculateLoan = require("../services/loanCalculator");
const detectDarkPatterns = require("../services/darkPatternDetector");
const calculateTransparencyScore = require("../services/transparencyScore");


const createAuthenticatedSupabaseClient = (token) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};

const createLoanAnalysis = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const supabase = createAuthenticatedSupabaseClient(token);
    const {
      lender_name,
      loan_amount,
      interest_rate,
      tenure_months,
      processing_fee = 0,
      insurance_cost = 0,
      documentation_fee = 0,
      other_charges = 0,
      prepayment_charge = 0,
    } = req.body;

    // Basic validation
    if (
      !lender_name ||
      !loan_amount ||
      interest_rate === undefined ||
      !tenure_months
    ) {
      return res.status(400).json({
        success: false,
        message:
          "lender_name, loan_amount, interest_rate and tenure_months are required",
      });
    }

    // Calculate loan details
    const calculation = calculateLoan({
      loan_amount,
      interest_rate,
      tenure_months,
      processing_fee,
      insurance_cost,
      documentation_fee,
      other_charges,
    });

    const findings = detectDarkPatterns(req.body, calculation);
    const transparencyScore = calculateTransparencyScore(findings);

    // Save loan analysis
    const { data: loanAnalysis, error: loanError } = await supabase
      .from("loan_analyses")
      .insert({
        user_id: req.user.id,
        lender_name,
        loan_amount,
        interest_rate,
        tenure_months,
        processing_fee,
        insurance_cost,
        documentation_fee,
        other_charges,
        prepayment_charge,
      })
      .select()
      .single();

    if (loanError) {
      throw loanError;
    }

    // Save calculation results
    const { data: analysisResult, error: resultError } = await supabase
      .from("analysis_results")
      .insert({
        analysis_id: loanAnalysis.id,
        emi: calculation.emi,
        total_interest: calculation.totalInterest,
        total_repayment: calculation.totalRepayment,
        actual_amount_received: calculation.actualAmountReceived,
        total_upfront_charges: calculation.totalUpfrontCharges,
        transparency_score: transparencyScore,
      })
      .select()
      .single();

    if (resultError) {
      throw resultError;
    }
    if (findings.length > 0) {
      const findingsToInsert = findings.map((finding) => ({
        analysis_id: loanAnalysis.id,
        type: finding.type,
        severity: finding.severity,
        title: finding.title,
        description: finding.description,
      }));

      const { error: findingsError } = await supabase
        .from("findings")
        .insert(findingsToInsert);

      if (findingsError) {
        throw findingsError;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Loan analysis created successfully",
      data: {
        loanAnalysis,
        analysisResult,
        findings,
      },
    });
  } catch (error) {
    console.error("Create loan analysis error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create loan analysis",
      error: error.message,
    });
  }
};

const getLoanAnalyses = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const supabase = createAuthenticatedSupabaseClient(token);

    const { data, error } = await supabase
      .from("loan_analyses")
      .select(`
        *,
        analysis_results (*),
        findings (*)
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get loan analyses error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch loan analyses",
      error: error.message,
    });
  }
};



module.exports = {
  createLoanAnalysis,
  getLoanAnalyses,
};

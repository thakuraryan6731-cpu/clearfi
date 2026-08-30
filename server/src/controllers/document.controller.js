const { createClient } = require("@supabase/supabase-js");

const { extractTextFromPdf } = require("../services/documentExtractor");
const { analyzeDocument } = require("../services/documentAnalyzer");
const { convertDocumentToLoan } = require("../services/documentToLoan");
const calculateLoan = require("../services/loanCalculator");
const detectDarkPatterns = require("../services/darkPatternDetector");
const calculateTransparencyScore = require("../services/transparencyScore");

const createUserSupabase = (token) => {
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

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document uploaded",
      });
    }

    const userId = req.user.id;
    const file = req.file;
    const token = req.headers.authorization.split(" ")[1];

    const supabase = createUserSupabase(token);

    const filePath = `${userId}/${Date.now()}-${file.originalname}`;

    // STEP 1: Upload file
    console.log("STEP 1: Uploading file to Storage");

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log("STEP 1 SUCCESS: File uploaded to Storage");

    // STEP 2: Save document
    console.log("STEP 2: Inserting document into database");

    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        file_name: file.originalname,
        file_path: filePath,
        document_type: "unknown",
        status: "uploaded",
      })
      .select()
      .single();

    if (dbError) {
      await supabase.storage
        .from("documents")
        .remove([filePath]);

      throw dbError;
    }

    console.log("STEP 2 SUCCESS: Document inserted into database");

    // STEP 3: Extract PDF text
    console.log("STEP 3: Extracting PDF text");

    const extracted = await extractTextFromPdf(file.buffer);

    console.log("STEP 3 SUCCESS: PDF text extracted");
    console.log("Pages:", extracted.pages);
    console.log("Characters:", extracted.text.length);

    // STEP 4: Analyze with Gemini
    console.log("STEP 4: Analyzing document with Gemini");

    const analysis = await analyzeDocument(extracted.text);

    console.log("STEP 4 SUCCESS: Gemini analysis completed");

    // STEP 5: Convert AI data to loan format
    console.log("STEP 5: Converting AI data to loan format");

    const loanData = convertDocumentToLoan(analysis);

    console.log("STEP 5 SUCCESS: Loan data converted");
    console.log(loanData);

    // STEP 6: Save AI analysis
    console.log("STEP 6: Saving AI analysis");

    const { data: documentAnalysis, error: analysisError } =
      await supabase
        .from("document_analyses")
        .insert({
          document_id: document.id,
          document_type: analysis.documentType,
          extracted_data: analysis,
        })
        .select()
        .single();

    if (analysisError) {
      throw analysisError;
    }

    console.log("STEP 6 SUCCESS: AI analysis saved");

    // STEP 7: Calculate loan
    console.log("STEP 7: Running loan calculation");

    const calculation = calculateLoan(loanData);

    console.log("STEP 7 SUCCESS: Loan calculation completed");
    console.log(calculation);

    // STEP 8: Detect risks
    console.log("STEP 8: Detecting dark patterns");

    const findings = detectDarkPatterns(
      loanData,
      calculation
    );

    console.log("STEP 8 SUCCESS: Dark pattern detection completed");
    console.log(findings);

    // STEP 9: Calculate transparency score
    console.log("STEP 9: Calculating transparency score");

    const transparencyScore =
      calculateTransparencyScore(findings);

    console.log(
      "STEP 9 SUCCESS: Transparency score:",
      transparencyScore
    );

    // STEP 10: Save loan analysis
    console.log("STEP 10: Saving loan analysis");

    const { data: loanAnalysis, error: loanError } =
      await supabase
        .from("loan_analyses")
        .insert({
          user_id: userId,
          lender_name: loanData.lender_name,
          loan_amount: loanData.loan_amount,
          interest_rate: loanData.interest_rate,
          tenure_months: loanData.tenure_months,
          processing_fee: loanData.processing_fee,
          insurance_cost: loanData.insurance_cost,
          documentation_fee: loanData.documentation_fee,
          other_charges: loanData.other_charges,
          prepayment_charge: loanData.prepayment_charge,
        })
        .select()
        .single();

    if (loanError) {
      throw loanError;
    }

    console.log("STEP 10 SUCCESS: Loan analysis saved");

    // STEP 11: Save calculation results
    console.log("STEP 11: Saving calculation results");

    const { data: analysisResult, error: resultError } =
      await supabase
        .from("analysis_results")
        .insert({
          analysis_id: loanAnalysis.id,
          emi: calculation.emi,
          total_interest: calculation.totalInterest,
          total_repayment: calculation.totalRepayment,
          actual_amount_received:
            calculation.actualAmountReceived,
          total_upfront_charges:
            calculation.totalUpfrontCharges,
          transparency_score: transparencyScore,
        })
        .select()
        .single();

    if (resultError) {
      throw resultError;
    }

    console.log(
      "STEP 11 SUCCESS: Calculation results saved"
    );

    // STEP 12: Save findings
    console.log("STEP 12: Saving findings");

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

    console.log("STEP 12 SUCCESS: Findings saved");

    // STEP 13: Update document
    console.log("STEP 13: Updating document status");

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        status: "completed",
        document_type: analysis.documentType,
      })
      .eq("id", document.id);

    if (updateError) {
      throw updateError;
    }

    console.log("STEP 13 SUCCESS: Document updated");

    // Final response
    return res.status(201).json({
      success: true,
      message:
        "Document uploaded, analyzed and loan analysis created successfully",

      data: {
        document: {
          ...document,
          status: "completed",
          document_type: analysis.documentType,
        },

        documentAnalysis,

        loanAnalysis,

        analysisResult,

        loanData,

        calculation,

        findings,

        transparencyScore,

        pages: extracted.pages,
      },
    });
  } catch (error) {
    console.error(
      "Upload document error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
};

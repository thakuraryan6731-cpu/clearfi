import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLoanAnalysis } from "../services/loanAnalysis";

const NewAnalysis = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    lender_name: "",
    loan_amount: "",
    interest_rate: "",
    tenure_months: "",
    processing_fee: "",
    insurance_cost: "",
    documentation_fee: "",
    other_charges: "",
    prepayment_charge: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await createLoanAnalysis({
        lender_name: form.lender_name,
        loan_amount: Number(form.loan_amount),
        interest_rate: Number(form.interest_rate),
        tenure_months: Number(form.tenure_months),
        processing_fee: Number(form.processing_fee || 0),
        insurance_cost: Number(form.insurance_cost || 0),
        documentation_fee: Number(form.documentation_fee || 0),
        other_charges: Number(form.other_charges || 0),
        prepayment_charge: Number(form.prepayment_charge || 0),
      });

      navigate(`/analysis/${response.data.loanAnalysis.id}`);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to analyze the loan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Analyze a New Loan</h1>

      <p>
        Enter the details from your loan offer.
        ClearFi will calculate the real cost and
        identify potential hidden charges.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          name="lender_name"
          placeholder="Lender name"
          value={form.lender_name}
          onChange={handleChange}
          required
        />

        <input
          name="loan_amount"
          type="number"
          placeholder="Loan amount"
          value={form.loan_amount}
          onChange={handleChange}
          required
        />

        <input
          name="interest_rate"
          type="number"
          step="0.01"
          placeholder="Interest rate (%)"
          value={form.interest_rate}
          onChange={handleChange}
          required
        />

        <input
          name="tenure_months"
          type="number"
          placeholder="Tenure (months)"
          value={form.tenure_months}
          onChange={handleChange}
          required
        />

        <h3>Additional Charges</h3>

        <input
          name="processing_fee"
          type="number"
          placeholder="Processing fee"
          value={form.processing_fee}
          onChange={handleChange}
        />

        <input
          name="insurance_cost"
          type="number"
          placeholder="Insurance cost"
          value={form.insurance_cost}
          onChange={handleChange}
        />

        <input
          name="documentation_fee"
          type="number"
          placeholder="Documentation fee"
          value={form.documentation_fee}
          onChange={handleChange}
        />

        <input
          name="other_charges"
          type="number"
          placeholder="Other charges"
          value={form.other_charges}
          onChange={handleChange}
        />

        <input
          name="prepayment_charge"
          type="number"
          placeholder="Prepayment charge"
          value={form.prepayment_charge}
          onChange={handleChange}
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Loan"}
        </button>
      </form>
    </main>
  );
};

export default NewAnalysis;

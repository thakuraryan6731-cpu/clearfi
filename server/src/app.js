const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');
const loanAnalysisRoutes = require("./routes/loanAnalysis.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'ClearFi API is running'
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: "Successfully connected to Supabase ",
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to connect to Supabase",
      error: error.message,
    });
  }
});

app.get("/api/test-loan", (req, res) => {
  const calculateLoan = require("./services/loanCalculator");

  const result = calculateLoan({
    loan_amount: 500000,
    interest_rate: 10.5,
    tenure_months: 60,
    processing_fee: 8500,
    insurance_cost: 12000,
    documentation_fee: 2000,
    other_charges: 1500,
  });

  res.json({
    success: true,
    data: result,
  });
});

app.use("/api/loan-analyses", loanAnalysisRoutes);


app.post("/api/test-login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.json({
    success: true,
    access_token: data.session.access_token,
    user: data.user,
  });
});

module.exports = app

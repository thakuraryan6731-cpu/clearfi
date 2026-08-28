const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');

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

module.exports = app

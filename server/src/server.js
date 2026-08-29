require("dotenv").config();

const app = require('./app');
const supabase = require("./config/supabase");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Successfully connected to Supabase database");
});


const express = require("express");
const { createLoanAnalysis } = require("../controllers/loanAnalysis.controller");
const authenticateUser = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticateUser, createLoanAnalysis);

module.exports = router;

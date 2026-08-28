const express = require("express");
const { createLoanAnalysis, getLoanAnalyses, getLoanAnalysisById } = require("../controllers/loanAnalysis.controller");
const authenticateUser = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticateUser, createLoanAnalysis);

router.get("/", authenticateUser, getLoanAnalyses);

router.get("/:id", authenticateUser, getLoanAnalysisById);

module.exports = router;

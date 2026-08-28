const express = require("express");
const { createLoanAnalysis, getLoanAnalyses, getLoanAnalysisById, deleteLoanAnalysis } = require("../controllers/loanAnalysis.controller");
const authenticateUser = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticateUser, createLoanAnalysis);

router.get("/", authenticateUser, getLoanAnalyses);

router.get("/:id", authenticateUser, getLoanAnalysisById);

router.delete("/:id", authenticateUser, deleteLoanAnalysis);

module.exports = router;

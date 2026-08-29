import api from "./api";

export const createLoanAnalysis = async (loanData) => {
  const response = await api.post("/loan-analyses", loanData);

  return response.data;
};

export const getLoanAnalyses = async () => {
  const response = await api.get("/loan-analyses");

  return response.data;
};

export const getLoanAnalysisById = async (id) => {
  const response = await api.get(`/loan-analyses/${id}`);

  return response.data;
};

export const deleteLoanAnalysis = async (id) => {
  const response = await api.delete(`/loan-analyses/${id}`);

  return response.data;
};

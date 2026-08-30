import api from "./api";

export const uploadDocument = async (file) => {
  const formData = new FormData();

  formData.append("document", file, file.name);

  const response = await api.post("/documents", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return response.data;
};

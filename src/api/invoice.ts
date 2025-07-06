import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://asianeco-backend.vercel.app";

export const createInvoiceApi = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/invoices/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateInvoiceApi = async (data: any) => {
  try {
    const response = await axios.patch(`${BASE_URL}/v1/invoices/update`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllInvoicesApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/invoices/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteInvoiceApi = async (id: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/invoices/delete`,{id});
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const sendInvoiceMailApi = async (email: string, data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/invoices/sendMail/${email}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

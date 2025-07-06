import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://asianeco-backend.vercel.app";


export const getSettingsApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/settings/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateSettingsApi = async (data: any) => {
  try {
    const response = await axios.patch(`${BASE_URL}/v1/settings/update`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const getExpenseIdApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/settings/expenseId`);
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const getQuotationIdApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/settings/quotationId`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getInvoiceIdApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/settings/invoiceId`);
    return response;
  } catch (error) {
    console.log(error);
  }
};
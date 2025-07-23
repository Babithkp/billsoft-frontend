import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://asianeco-backend.vercel.app";


export const createPaymentApi = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/payments/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updatePaymentApi = async (data: any) => {
  try {
    const response = await axios.patch(`${BASE_URL}/v1/payments/update/${data.id}`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deletePaymentApi = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/v1/payments/delete/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getPaymentsApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/payments`);
    return response;
  } catch (error) {
    console.log(error);
  }
};
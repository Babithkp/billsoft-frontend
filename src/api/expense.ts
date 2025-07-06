import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://asianeco-backend.vercel.app";

export const createExpenseApi = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/expenses/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateExpenseApi = async (data: any) => {
  try {
    const response = await axios.patch(`${BASE_URL}/v1/expenses/update/${data.id}`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllExpensesApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/expenses/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteExpenseApi = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/v1/expenses/delete/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};


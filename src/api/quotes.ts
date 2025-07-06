import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://asianeco-backend.vercel.app";

export const createQuoteApi = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/quotes/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateQuoteApi = async (data: any) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/v1/quotes/update/${data.id}`,
      data,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllQuotesApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/quotes/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteQuoteApi = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/v1/quotes/delete/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const sendQuoteMailApi = async (email: string, data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/quotes/sendMail/${email}`,
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

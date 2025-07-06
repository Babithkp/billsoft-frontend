import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://asianeco-backend.vercel.app";


export const createClientApi = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/client/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const getAllClientsApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/client/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteClientApi = async (id: any) => {
  try {
    const response = await axios.delete(`${BASE_URL}/v1/client/delete/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateClientApi = async (data: any) => {
  try {
    const response = await axios.patch(`${BASE_URL}/v1/client/update/${data.id}`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};
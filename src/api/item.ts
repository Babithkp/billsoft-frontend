import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://asianeco-backend.vercel.app";


export const createItemApi = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/item/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const getAllItemsApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/item/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteItemApi = async (id: any) => {
  try {
    const response = await axios.delete(`${BASE_URL}/v1/item/delete/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateItemApi = async (data: any) => {
  try {
    const response = await axios.patch(`${BASE_URL}/v1/item/update/${data.id}`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const createPurchaseApi = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/item/purchase`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasesApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/item/purchases`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updatePurchaseApi = async (data: any) => {
  try {
    const response = await axios.patch(`${BASE_URL}/v1/item/purchase/update/${data.id}`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const deletePurchaseApi = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/v1/item/purchase/delete/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};
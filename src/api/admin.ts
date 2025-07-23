import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://asianeco-backend.vercel.app";

export const loginApi = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/admin/login`, {
      username,
      password,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const getAllNotificationApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/admin/notifications`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateNotificationStatusApi = async (id: string) => {
  try {
    const response = await axios.patch(`${BASE_URL}/v1/admin/notifications/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const deleteNotificationApi = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/v1/admin/notifications/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};
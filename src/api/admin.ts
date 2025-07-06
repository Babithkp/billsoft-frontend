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

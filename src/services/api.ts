import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:9104";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.warn("Request timeout");
    }
    return Promise.reject(error);
  }
);

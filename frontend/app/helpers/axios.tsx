import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

const axoisInstance = axios.create({
    baseURL: `${BACKEND_URL}/api/v1/`,
    withCredentials: true
});

axoisInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default axoisInstance
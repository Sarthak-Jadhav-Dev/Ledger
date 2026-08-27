import axios from "axios";

const axoisInstance = axios.create({
    baseURL : "http://localhost:8000/api/v1/",
    withCredentials: true
})

axoisInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default axoisInstance
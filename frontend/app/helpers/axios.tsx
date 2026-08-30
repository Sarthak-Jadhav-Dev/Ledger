import axios from "axios";

const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return `http://${window.location.hostname}:8000/api/v1/`;
    }
    return "http://localhost:8000/api/v1/";
};

const axoisInstance = axios.create({
    baseURL : getBaseUrl(),
    withCredentials: true
})

axoisInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default axoisInstance
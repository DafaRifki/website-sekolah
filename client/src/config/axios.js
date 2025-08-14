import axios from "axios";

const apiClient = axios.create({
    baseURL: '${import.meta.env.VITE_URL_API}/api',
    headers: {
        "Content-Type" : "application/json",
    },
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }  
);

export default apiClient;
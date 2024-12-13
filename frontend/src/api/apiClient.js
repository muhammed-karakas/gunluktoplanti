import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
    baseURL: BACKEND_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;

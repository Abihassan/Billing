import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data.message || 'An error occurred';
      console.error('API Error:', message);
    } else if (error.request) {
      console.error('Network Error: No response received');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

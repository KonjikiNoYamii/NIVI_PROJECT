import axios from 'axios';

// Base URL API - sesuaikan dengan backend Anda
const API_URL = 'http://192.168.1.3:5000/api'; // atau URL API Anda

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    // Tambahkan token jika ada
    const token = ''; // Ambil dari AsyncStorage atau context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error global
    if (error.response?.status === 401) {
      // Token expired, redirect ke login
    }
    return Promise.reject(error);
  }
);

export default api;
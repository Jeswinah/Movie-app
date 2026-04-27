import axios from 'axios';
import API_BASE_URL from './api';

const authApi = axios.create({
  baseURL: API_BASE_URL
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default authApi;

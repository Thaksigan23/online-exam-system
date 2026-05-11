// utils/axiosInstance.js
import axios from 'axios';
import { API_ORIGIN } from '../config/api';

const instance = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;

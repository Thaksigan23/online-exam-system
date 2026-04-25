// src/utils/axiosConfig.js
import axios from 'axios';

const token = localStorage.getItem('token');

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',  // your backend base URL
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
  },
});

export default instance;

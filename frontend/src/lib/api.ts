import axios from 'axios';

const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  if (url.includes('localhost')) return url;
  // Si es en Render, asegurar que tenga https y termine en /api
  const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
  return formattedUrl.endsWith('/api') ? formattedUrl : `${formattedUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

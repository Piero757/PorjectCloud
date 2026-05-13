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

console.log('API BaseURL:', getBaseURL());


api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    // NO enviar token en rutas de autenticación (login/register)
    const isAuthRoute = config.url?.includes('/auth/login/') || config.url?.includes('/auth/register/');
    
    if (token && config.headers && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para manejar errores 401 (token expirado o inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          localStorage.removeItem('token');
          // Si no estamos en la página de inicio, redirigir al login
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;


import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => { // // Se der erro na requisição
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 422)) {
      const { isAuthenticated, logout } = useAuthStore.getState();
      if (isAuthenticated) {
        console.error("Token inválido ou expirado, fazendo logout forçado.");
        logout();
        // window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);


export default apiClient; 

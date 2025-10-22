import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; // Importa seu store Zustand

// Cria uma instância do axios com a URL base da sua API
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Lê a URL do .env.local
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona um "interceptor" (magia do axios)
// Isso vai rodar ANTES de CADA requisição
apiClient.interceptors.request.use(
  (config) => {
    // Pega o token de dentro do seu Zustand
    const token = useAuthStore.getState().token;
    if (token) {
      // Se o token existir, adiciona o cabeçalho 'Authorization'
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
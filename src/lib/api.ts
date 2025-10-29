// src/lib/api.ts
import axios from 'axios'; // Importa o axios
import { useAuthStore } from '@/store/authStore'; // Importa o store Zustand

const apiClient = axios.create({ // Cria instância do axios
  baseURL: import.meta.env.VITE_API_URL, // Define a URL base
  headers: { // Define cabeçalhos padrão
    'Content-Type': 'application/json', // Tipo de conteúdo JSON
  }, // Fim dos cabeçalhos
}); // Fim da criação da instância

// Interceptor de Requisição (Adiciona Token)
apiClient.interceptors.request.use( // Adiciona interceptor de requisição
  (config) => { // Função para configuração bem-sucedida
    const token = useAuthStore.getState().token; // Pega o token do store
    if (token) { // Se houver token
      config.headers.Authorization = `Bearer ${token}`; // Adiciona cabeçalho Authorization
    } // Fim do if
    return config; // Retorna a configuração modificada
  }, // Fim da função
  (error) => { // Função para erro na requisição
    return Promise.reject(error); // Rejeita a promise com o erro
  } // Fim da função
); // Fim do interceptor de requisição

// Interceptor de Resposta (Lida com Erros de Auth 401/422)
apiClient.interceptors.response.use( // Adiciona interceptor de resposta
  (response) => response, // Se sucesso, retorna a resposta
  (error) => { // Se erro
    // Verifica se é erro 401 ou 422 E se não é a própria rota /auth/guest falhando
    if (error.response && (error.response.status === 401 || error.response.status === 422) && error.config.url !== '/auth/guest') { // Condição de erro 401 ou 422, exceto na rota guest
      const { isAuthenticated, logout } = useAuthStore.getState(); // Pega estado e logout do store

      // Se o store ACHAVA que estava logado...
      if (isAuthenticated) { // Verifica se estava autenticado
        console.error("Token inválido ou expirado no interceptor, fazendo logout e recarregando."); // Loga o erro
        logout(); // Chama logout para limpar o estado inválido
        // Força o recarregamento da página. Isso acionará o ProtectedRoute para tentar criar um novo guest.
        window.location.reload(); // Força recarga da página
      } // Fim do if isAuthenticated
    } // Fim do if erro status e URL
    // Para outros erros, ou erro no /auth/guest, apenas rejeita
    return Promise.reject(error); // Rejeita a promise com o erro original
  } // Fim da função de erro
); // Fim do interceptor de resposta

export default apiClient; // Exporta o cliente configurado

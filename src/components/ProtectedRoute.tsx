import { useEffect } from 'react'; // Importa o useEffect
import { Outlet, useNavigate } from 'react-router-dom'; // Importa Outlet e useNavigate
import { useAuthStore } from '@/store/authStore'; // Importa o store de autenticação
import apiClient from '@/lib/api'; // Importa o cliente da API
import { Loader2 } from 'lucide-react'; // Importa o ícone de loader

export function ProtectedRoute() { // Define o componente ProtectedRoute
  const { isAuthenticated, token, setGuestUser, logout } = useAuthStore(); // Pega estado e ações do store
  const navigate = useNavigate(); // Hook para navegação programática

  useEffect(() => { // Efeito para rodar na montagem e quando dependências mudam
    const createGuestIfNeeded = async () => { // Função assíncrona para criar guest
      // Se NÃO estiver autenticado E NÃO houver token no store...
      if (!isAuthenticated && !token) { // Verifica se não está autenticado e não há token
        console.log("Tentando criar sessão de convidado..."); // Loga a tentativa
        try { // Tenta criar o guest
          // Chama o backend para criar um guest
          const response = await apiClient.post('/auth/guest'); // Faz a requisição POST
          // Salva o token e user no store
          setGuestUser(response.data.access_token, response.data.user); // Atualiza o store com os dados do guest
          console.log("Sessão de convidado criada com sucesso."); // Loga o sucesso
        } catch (error) { // Captura erros
          console.error('Falha ao criar sessão de convidado:', error); // Loga o erro
          // Se falhar (ex: backend offline), talvez redirecionar para uma página de erro?
          // Por agora, apenas logamos. O componente pode retornar null ou um erro.
        } // Fim do catch
      } else { // Se já estiver autenticado ou tiver token
           console.log("Usuário já autenticado ou token existe."); // Log para indicar que não precisa criar guest
      } // Fim do else
    }; // Fim da função createGuestIfNeeded

    createGuestIfNeeded(); // Chama a função ao montar ou quando as dependências mudarem
    
  }, [isAuthenticated, token, setGuestUser, logout, navigate]); // Dependências do useEffect

  // Lógica de Renderização Simplificada:
  
  // Se AINDA não estiver autenticado após o useEffect tentar, mostra um loader.
  // Isso cobre o tempo da chamada API e a atualização do estado.
  if (!isAuthenticated) { // Se não estiver autenticado
      return ( // Retorna o loader
          <div className="flex h-screen w-full items-center justify-center"> {/* Container flexível */}
              <Loader2 className="h-8 w-8 animate-spin" /> {/* Ícone de loader */}
          </div> // Fim do container
      ); // Fim do retorno do loader
  } // Fim do if

  // Se estiver autenticado (após o useEffect), renderiza a rota filha.
  return <Outlet />; // Renderiza o componente da rota filha (ex: Dashboard)
} // Fim do componente ProtectedRoute

import { useEffect, useState } from 'react'; // Adicionado useState
import { Outlet } from 'react-router-dom'; // Apenas Outlet é necessário aqui
import { useAuthStore } from '@/store/authStore'; // Importa o store de autenticação
import apiClient from '@/lib/api'; // Importa o cliente da API
import { Loader2 } from 'lucide-react'; // Importa o ícone de loader

export function ProtectedRoute() { // Define o componente ProtectedRoute
  // Pega o estado e ações do store. Usamos a função de seleção para evitar re-renders desnecessários
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Pega isAuthenticated
  const token = useAuthStore((state) => state.token); // Pega token
  const setGuestUser = useAuthStore((state) => state.setGuestUser); // Pega setGuestUser

  const [isLoadingGuest, setIsLoadingGuest] = useState(false); // Estado para controlar o processo de criação do guest
  const [guestCreationFailed, setGuestCreationFailed] = useState(false); // Estado para indicar falha na criação do guest

  useEffect(() => { // Efeito para criar o guest se necessário
    const createGuestIfNeeded = async () => { // Função assíncrona para criar guest
      // Condição: Só tenta criar se NÃO houver token E NÃO estivermos já a carregar E o store ainda não estiver autenticado
      if (!token && !isLoadingGuest && !isAuthenticated) { // Verifica as condições
        console.log("ProtectedRoute: Sem token/auth, a tentar criar guest..."); // Loga a tentativa
        setIsLoadingGuest(true); // Inicia o estado de carregamento
        setGuestCreationFailed(false); // Reseta o estado de falha
        try { // Tenta criar o guest
          const response = await apiClient.post('/auth/guest'); // Faz a requisição POST para /auth/guest
          // Verifica se a resposta contém os dados esperados
          if (response.data && response.data.access_token && response.data.user) { // Verifica os dados da resposta
             setGuestUser(response.data.access_token, response.data.user); // Atualiza o store com os dados do guest
             console.log("ProtectedRoute: Sessão de convidado criada com sucesso via API."); // Loga o sucesso
             // Não paramos o loading aqui; esperamos que 'isAuthenticated' vire true
          } else { // Se a resposta não for válida
             console.error("ProtectedRoute: Resposta da API /auth/guest inválida:", response.data); // Loga a resposta inválida
             setGuestCreationFailed(true); // Marca a criação como falhada
             setIsLoadingGuest(false); // Para o estado de carregamento
          } // Fim do else da resposta inválida
        } catch (error) { // Captura erros na chamada API
          console.error('ProtectedRoute: Falha CRÍTICA ao criar sessão de convidado:', error); // Loga o erro crítico
          setGuestCreationFailed(true); // Marca a criação como falhada
          setIsLoadingGuest(false); // Para o estado de carregamento
        } // Fim do catch
      } else { // Se a condição inicial não for cumprida
         // Loga por que não tentou criar (ou já está autenticado/a carregar)
         console.log(`ProtectedRoute: A saltar criação de guest: token=${!!token}, isLoadingGuest=${isLoadingGuest}, isAuthenticated=${isAuthenticated}`); // Loga o motivo de saltar a criação
      } // Fim do else da condição inicial
    }; // Fim da função createGuestIfNeeded

    createGuestIfNeeded(); // Chama a função

  // Dependências: Reage apenas a mudanças no token e isAuthenticated (evita loops com isLoadingGuest)
  }, [token, isAuthenticated, setGuestUser]); // Dependências do useEffect

  // --- Lógica de Renderização ---

  // 1. Se a criação do guest falhou explicitamente
  if (guestCreationFailed) { // Verifica se a criação falhou
    console.log("ProtectedRoute: A renderizar estado de falha na criação do guest."); // Loga o estado de falha
    return ( // Retorna a mensagem de erro
      <div className="flex h-screen w-full flex-col items-center justify-center text-destructive"> {/* Container flexível com texto vermelho */}
        <p className="font-bold">Erro Crítico!</p> {/* Mensagem de erro */}
        <p>Não foi possível iniciar a sessão de convidado.</p> {/* Detalhe do erro */}
        <p>Verifique a consola (F12) e a ligação ao backend.</p> {/* Instrução */}
      </div> // Fim do container
    ); // Fim do retorno da mensagem de erro
  } // Fim do if guestCreationFailed

  // 2. Se não temos token E (estamos a carregar OU ainda não estamos autenticados)
  // Mostra o loader enquanto a chamada API está a decorrer ou o store ainda não atualizou
  if (!token && (isLoadingGuest || !isAuthenticated)) { // Verifica se deve mostrar o loader
     console.log(`ProtectedRoute: A renderizar Loader: isLoadingGuest=${isLoadingGuest}, isAuthenticated=${isAuthenticated}, token=${!!token}`); // Loga o estado do loader
    return ( // Retorna o loader
      <div className="flex h-screen w-full items-center justify-center"> {/* Container flexível */}
        <Loader2 className="h-8 w-8 animate-spin text-primary" /> {/* Ícone de loader */}
         <p className="ml-2 text-muted-foreground">A iniciar sessão de convidado...</p> {/* Texto informativo */}
      </div> // Fim do container
    ); // Fim do retorno do loader
  } // Fim do if do loader

  // 3. Se finalmente estamos autenticados (seja como guest recém-criado ou de uma sessão anterior)
  if (isAuthenticated) { // Verifica se está autenticado
    console.log("ProtectedRoute: Autenticado! A renderizar Outlet."); // Loga o sucesso da autenticação
    return <Outlet />; // Renderiza o conteúdo da rota protegida (Dashboard, etc.)
  } // Fim do if isAuthenticated

  // 4. Fallback: Se nenhuma das condições acima for cumprida (estado inesperado)
  // Isso pode acontecer brevemente ou se houver um bug lógico.
  console.warn("ProtectedRoute: Estado inesperado alcançado. A renderizar loader como fallback."); // Loga o aviso
  return ( // Retorna um loader como fallback
      <div className="flex h-screen w-full items-center justify-center"> {/* Container flexível */}
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> {/* Ícone de loader */}
      </div> // Fim do container
  ); // Fim do retorno do fallback
} // Fim do componente ProtectedRoute

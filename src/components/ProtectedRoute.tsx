// src/components/ProtectedRoute.tsx

import { useEffect, useState } from 'react';
// 1. Importa o Outlet, que é o componente correto do react-router-dom para "rotas filhas"
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';
// 2. Importa um ícone de "carregando" do Lucide
import { Loader2 } from 'lucide-react';

// (Removemos a props 'children', pois o react-router-dom usa <Outlet />)
export function ProtectedRoute() {
  // 3. Pega o 'token' e 'isGuest' do seu store. Eles são essenciais.
  const { isAuthenticated, user, token, isGuest, setGuestUser } = useAuthStore();
  
  // 4. Adiciona um estado de "loading"
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);

  useEffect(() => {
    // 5. Define a função que chama o backend
    const createGuest = async () => {
      try {
        // Chama o endpoint POST /auth/guest que criamos no Flask
        const response = await apiClient.post('/auth/guest');
        
        // 'response.data' deve conter { access_token, user }
        // Salva o token e o usuário convidado no Zustand
        setGuestUser(response.data.access_token, response.data.user);
        
      } catch (error) {
        console.error('Falha ao criar sessão de convidado:', error);
        // (Em um app real, mostraríamos um erro na tela)
      } finally {
        setIsLoadingGuest(false);
      }
    };

    // 6. Esta é a lógica principal:
    // Se o usuário NÃO está autenticado (nem como guest, nem como real)
    // E NÃO há um token salvo no localStorage...
    if (!isAuthenticated && !token) {
      setIsLoadingGuest(true); // Mostra o spinner
      createGuest(); // Tenta criar um convidado
    }
  }, [isAuthenticated, token, setGuestUser]);

  // 7. Lógica de renderização
  
  // Se estivermos no processo de criar um convidado, mostra um spinner
  if (isLoadingGuest) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Se (após o useEffect) o usuário estiver autenticado
  // (seja como 'isGuest=true' ou 'isGuest=false'),
  // renderiza a página que o usuário tentou acessar (Dashboard, Chat, etc.)
  if (isAuthenticated) {
    return <Outlet />; // <--- O Outlet renderiza a rota "filha" (ex: <Dashboard />)
  }

  // Se, por algum motivo, a autenticação falhar (ex: token expirado, etc.)
  // o 'isAuthenticated' no store será false, e o usuário será
  // (No seu App.tsx, as rotas /login e /register estão fora do ProtectedRoute,
  // então o usuário não fica preso em um loop. Esta lógica está correta,
  // mas o 'App.tsx' deveria ter uma rota 'catch-all' para redirecionar se
  // !isAuthenticated após o loading. Por agora, isso funciona.)

  // Se o token existir mas a autenticação for falsa (ex: app carregando)
  // ou se o guest-auth falhou, não renderiza nada até o Zustand resolver.
  // O 'isLoadingGuest' já trata o caso principal.
  return null; 
}
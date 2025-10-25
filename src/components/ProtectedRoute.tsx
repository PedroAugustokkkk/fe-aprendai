// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react'; // 1. Importa o React
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom'; // 2. Importa o Navigate

// 3. Aceita a prop 'children'
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, isGuest, setGuestUser, user } = useAuthStore();
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);

  useEffect(() => {
    const createGuest = async () => {
      try {
        const response = await apiClient.post('/auth/guest');
        setGuestUser(response.data.access_token, response.data.user);
      } catch (error) {
        console.error('Falha ao criar sessão de convidado:', error);
        // Se falhar, talvez redirecionar para o login?
        // Por enquanto, só paramos o loading
      } finally {
        setIsLoadingGuest(false);
      }
    };

    // 4. LÓGICA CORRIGIDA:
    // Se não está autenticado E não tem token, cria um convidado.
    if (!isAuthenticated && !token) {
      setIsLoadingGuest(true);
      createGuest();
    }
    
    // 5. BÔNUS: Adiciona lógica para o caso do token existir mas o user não.
    // (Isso acontece na "re-hidratação" do zustand)
    // Aqui você deveria ter uma rota /auth/me para validar o token,
    // mas por agora, se o token existe mas o user não, e não é guest,
    // vamos assumir que é um login inválido e redirecionar.
    // *Esta parte pode precisar de ajuste fino com sua lógica de /auth/me*
    
    // Por enquanto, vamos focar no bug principal: o createGuest.
    // A lógica acima (!isAuthenticated && !token) é a mais importante.

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
  if (isAuthenticated) {
    // 8. RENDERIZA OS 'CHILDREN' (ex: <Dashboard />)
    return <>{children}</>;
  }

  // 9. Se não está autenticado (e não está carregando), REDIRECIONA
  // (Isso previne o 'return null;' e a tela branca)
  // Nota: Isso assume que seu <Login /> e <Register /> NÃO estão
  // envolvidos por <ProtectedRoute>, o que está correto (vimos no App.tsx).
  if (!isAuthenticated && !isLoadingGuest) {
     return <Navigate to="/login" replace />;
  }

  // Fallback final, embora o de cima deva pegar
  return null;
}

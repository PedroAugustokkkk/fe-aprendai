// src/App.tsx (Versão Original - para teste)
import { Toaster } from "@/components/ui/toaster"; // Importa o Toaster
import { Toaster as Sonner } from "@/components/ui/sonner"; // Importa o Sonner como Toaster
import { TooltipProvider } from "@/components/ui/tooltip"; // Importa o TooltipProvider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Importa o QueryClient e QueryClientProvider
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Importa BrowserRouter, Routes, Route, Navigate
import { ProtectedRoute } from "./components/ProtectedRoute"; // Importa o ProtectedRoute
import Login from "./pages/Login"; // Descomentado - Importa a página de Login
import Register from "./pages/Register"; // Descomentado - Importa a página de Registro
import Dashboard from "./pages/Dashboard"; // Importa o Dashboard
import Chat from "./pages/Chat"; // Importa o Chat
import Documents from "./pages/Documents"; // Importa o Documents
import Settings from "./pages/Settings"; // Importa o Settings
import NotFound from "./pages/NotFound"; // Importa o NotFound

const queryClient = new QueryClient(); // Cria uma nova instância do QueryClient

const App = () => ( // Define o componente App
  <QueryClientProvider client={queryClient}> {/* // Fornece o QueryClient para a aplicação */}
    <TooltipProvider> {/* // Fornece o TooltipProvider para a aplicação */}
      <Toaster /> {/* // Renderiza o Toaster */}
      <Sonner /> {/* // Renderiza o Sonner */}
      <BrowserRouter> {/* // Fornece o roteamento para a aplicação */}
        <Routes> {/* // Define as rotas da aplicação */}
          {/* Rotas de Login e Registro DESCOMENTADAS */}
          <Route path="/login" element={<Login />} /> {/* // Define a rota para a página de Login */}
          <Route path="/register" element={<Register />} /> {/* // Define a rota para a página de Registro */}
          <Route // Define a rota para a página inicial
            path="/" // Define o caminho da rota
            element={ // Define o elemento a ser renderizado
              <ProtectedRoute> {/* // Protege a rota */}
                <Dashboard /> {/* // Redireciona para a página de Dashboard */}
              </ProtectedRoute> // Fim do ProtectedRoute
            } // Fim do elemento
          /> // Fim da rota
          <Route // Define a rota para a página de Dashboard
            path="/dashboard" // Define o caminho da rota
            element={ // Define o elemento a ser renderizado
              <ProtectedRoute> {/* // Protege a rota */}
                <Dashboard /> {/* // Renderiza o componente Dashboard */}
              </ProtectedRoute> // Fim do ProtectedRoute
            } // Fim do elemento
          /> // Fim da rota
          <Route // Define a rota para a página de Chat
            path="/chat" // Define o caminho da rota
            element={ // Define o elemento a ser renderizado
              <ProtectedRoute> {/* // Protege a rota */}
                <Chat /> {/* // Renderiza o componente Chat */}
              </ProtectedRoute> // Fim do ProtectedRoute
            } // Fim do elemento
          /> // Fim da rota
          <Route // Define a rota para a página de Documents
            path="/documents" // Define o caminho da rota
            element={ // Define o elemento a ser renderizado
              <ProtectedRoute> {/* // Protege a rota */}
                <Documents /> {/* // Renderiza o componente Documents */}
              </ProtectedRoute> // Fim do ProtectedRoute
            } // Fim do elemento
          /> // Fim da rota
          <Route // Define a rota para a página de Settings
            path="/settings" // Define o caminho da rota
            element={ // Define o elemento a ser renderizado
              <ProtectedRoute> {/* // Protege a rota */}
                <Settings /> {/* // Renderiza o componente Settings */}
              </ProtectedRoute> // Fim do ProtectedRoute
            } // Fim do elemento
          /> // Fim da rota
          <Route path="*" element={<NotFound />} /> {/* // Define a rota para a página NotFound */}
        </Routes> // Fim das rotas
      </BrowserRouter> // Fim do BrowserRouter
    </TooltipProvider> // Fim do TooltipProvider
  </QueryClientProvider> // Fim do QueryClientProvider
); // Fim do componente App

export default App; // Exporta o componente App

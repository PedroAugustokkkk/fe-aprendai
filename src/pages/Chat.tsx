// src/pages/Chat.tsx

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/store/authStore';
// 1. Remova as importações do mock e a definição de 'Message' se estava lá
// import { saveChatMessage, getChatMessages } from '@/lib/db';
import apiClient from '@/lib/api'; // <--- 2. Importe o apiClient real
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 3. Defina o tipo ChatMessage (ou importe de types.ts)
//    Adapte para corresponder ao ChatHistorySchema do backend
type ChatMessage = {
  // O ID pode ser string (uuid local) ou number (id do backend)
  id: string | number; 
  role: 'user' | 'model';
  message: string; // Corresponde a 'message' no backend
  timestamp: string; // O backend retorna string ISO
  session_id: string; // Adicionado para consistência
  user_id: number; // Adicionado para consistência
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  // Gera um ID de sessão único QUANDO O COMPONENTE MONTA
  const [sessionId] = useState(() => uuidv4()); 
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore(); // Pega o usuário (pode ser guest)
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 4. Remova/Comente o useEffect para buscar histórico ---
  // O backend ainda não tem o GET /chat/<session_id>
  // useEffect(() => {
  //   const fetchHistory = async () => {
  //     if (user) { // Usa o user.id real
  //       try {
  //         // const response = await apiClient.get(`/chat/${sessionId}`);
  //         // setMessages(response.data); // Ajustar tipos se necessário
  //       } catch (error) {
  //         console.error("Erro ao buscar histórico:", error);
  //       }
  //     }
  //   };
  //   fetchHistory();
  // }, [user, sessionId]); // Depende do user e sessionId

  // Scrolla para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    // Garante que temos um ID de usuário (mesmo que seja guest)
    const currentUserId = useAuthStore.getState().user?.id;
    if (!input.trim() || !currentUserId) return;

    // Cria a mensagem do usuário (com tipos ajustados)
    const userMessage: ChatMessage = {
      id: uuidv4(), // ID local provisório
      role: 'user',
      message: input.trim(),
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      user_id: currentUserId,
    };

    // Adiciona a mensagem do usuário à tela imediatamente
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim(); // Guarda o input antes de limpar
    setInput('');
    setIsLoading(true); // Mostra "digitando..."

    try {
      // --- 5. Substitua o mock pela chamada real da API ---
      // (Remova o saveChatMessage(userMessage))
      // (Remova o setTimeout e a lógica interna dele)

      // Chama o endpoint POST /chat/send do backend
      const response = await apiClient.post('/chat/send', {
        prompt: currentInput, // Usa o input guardado
        session_id: sessionId,
        // O user_id é pego pelo backend através do token JWT
      });

      // 'response.data' é o objeto ChatHistory do backend
      // Converte para o tipo ChatMessage do front-end
      const modelMessage: ChatMessage = {
        id: response.data.id, // ID numérico do backend
        role: 'model',
        message: response.data.message,
        timestamp: response.data.timestamp, // String ISO
        session_id: response.data.session_id,
        user_id: response.data.user_id,
      };

      // Adiciona a resposta da IA à lista de mensagens
      setMessages((prev) => [...prev, modelMessage]);
      // (Remova o saveChatMessage(modelMessage))

    } catch (error: any) {
      // 6. Tratamento de erro real
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.response?.data?.error || 'Tente novamente.',
        variant: 'destructive',
      });
      // (Opcional: Remover a mensagem do usuário que falhou?)
      // setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false); // Esconde "digitando..."
    }
  };

  // Handler para Enter (sem mudanças lógicas)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      {/* Container principal com altura definida */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Cabeçalho da página */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Chat com Gênio Guiado</h1>
          <p className="text-muted-foreground mt-1">
            Tire suas dúvidas sobre os documentos enviados
          </p>
        </div>

        {/* Card do Chat */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Área de mensagens com scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Mensagem inicial se não houver histórico */}
            {messages.length === 0 && !isLoading ? ( // Só mostra se não estiver carregando
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">👋 Olá! Como posso ajudar?</p>
                  <p className="text-sm">
                    Faça uma pergunta sobre seus documentos de estudo
                  </p>
                </div>
              </div>
            ) : (
              // Mapeia e exibe as mensagens
              messages.map((message) => (
                <div
                  key={message.id.toString()} // Usa toString() para garantir chave única
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground'
                      }
                    >
                      {message.role === 'user' ? '👤' : '🤖'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg break-words ${ // Adiciona break-words
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                     {/* 7. Muda 'content' para 'message' */}
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              ))
            )}
            {/* Indicador "digitando..." */}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    🤖
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Gênio Guiado está digitando...</span>
                </div>
              </div>
            )}
            {/* Div invisível para scroll automático */}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Pergunte ao Gênio Guiado..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] max-h-[120px] resize-none flex-1" // Adiciona flex-1
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px] self-end" // Alinha o botão com o final do textarea
              >
                {isLoading ? ( // Mostra spinner no botão se estiver carregando
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
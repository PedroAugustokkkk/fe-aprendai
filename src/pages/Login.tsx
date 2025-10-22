// src/pages/Login.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
// 1. Remova a importação do 'mockLogin'
// import { mockLogin } from '@/lib/storage'; 
import apiClient from '@/lib/api'; // <--- 2. Importe o apiClient real
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast'; // O seu arquivo usa o hook customizado, mantido.

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 3. Substitua a lógica do mock pela chamada real da API
      //    O endpoint /auth/login do Flask retorna: { access_token: "..." }
      const response = await apiClient.post('/auth/login', { email, password });

      // 4. Salve o token no Zustand.
      //    Como o backend não retorna o objeto 'user' no login (apenas o token),
      //    passamos 'null' para o 'user'. O token será usado
      //    para buscar os dados do usuário em outras páginas.
      login(response.data.access_token, null);
      
      navigate('/dashboard'); // Redireciona para o dashboard
    
    } catch (error: any) { // 5. Trata os erros vindos do backend
      toast({
        title: 'Erro ao fazer login',
        // Mostra a mensagem de erro específica do backend
        description: error.response?.data?.error || 'Email ou senha inválidos. Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Gênio Guiado</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link to="/register" className="text-primary hover:underline">
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
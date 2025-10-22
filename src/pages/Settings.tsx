import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';

export default function Settings() {
  const { user } = useAuthStore();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas preferências e informações
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>
              Seus dados de usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{user?.email}</p>
            </div>
            {user?.username && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nome de usuário
                </p>
                <p className="text-base">{user.username}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de conta
              </p>
              <p className="text-base">
                {user?.is_guest ? 'Conta de Visitante' : 'Conta Registrada'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o Gênio Guiado</CardTitle>
            <CardDescription>
              Seu assistente de estudos com IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O Gênio Guiado ajuda você a organizar tarefas, enviar documentos de
              estudo e fazer perguntas sobre o conteúdo usando inteligência artificial.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// src/pages/Dashboard.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
// 1. Remova as importações do mock e a definição de 'Task' se ela estava lá
// import { getTasks, createTask, updateTask, deleteTask, Task } from '@/lib/storage';
import apiClient from '@/lib/api'; // <--- 2. Importe o apiClient real
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Loader2 } from 'lucide-react'; // Importa o ícone de loading
import { useToast } from '@/hooks/use-toast';

// 3. Defina o tipo Task (ou importe de um arquivo types.ts central)
//    Certifique-se que os tipos correspondem ao que o backend retorna
type Task = {
  id: number; // O backend usa Integer, então é number
  content: string;
  is_completed: boolean;
  created_at: string; // O backend retorna string ISO
  user_id: number;
};

export default function Dashboard() {
  const [newTask, setNewTask] = useState('');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 4. Modifique o useQuery para chamar a API real
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    // A queryKey agora só precisa de 'tasks', pois o token já garante o user
    queryKey: ['tasks'],
    // queryFn agora usa o apiClient para chamar GET /tasks
    queryFn: async () => {
      const response = await apiClient.get('/tasks/');
      return response.data; // O backend retorna a lista de tarefas
    },
    // Mantém a lógica de só rodar se houver um usuário (ou convidado)
    enabled: !!user || !!useAuthStore.getState().token,
  });

  // 5. Modifique a mutation de criar tarefa
  const createMutation = useMutation({
    // mutationFn agora usa apiClient para chamar POST /tasks
    mutationFn: async (content: string) => {
      const response = await apiClient.post('/tasks', { content });
      return response.data; // Retorna a nova tarefa criada pelo backend
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalida o cache
      setNewTask(''); // Limpa o input
      toast({ title: 'Tarefa adicionada!' });
    },
    onError: (error: any) => { // Adiciona tratamento de erro
      toast({
        title: 'Erro ao criar tarefa',
        description: error.response?.data?.error || 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // 6. Modifique a mutation de atualizar tarefa
  const updateMutation = useMutation({
    // mutationFn agora usa apiClient para chamar PUT /tasks/<id>
    mutationFn: async ({ id, is_completed }: { id: number; is_completed: boolean }) => {
       // O ID agora é number
      const response = await apiClient.put(`/tasks/${id}`, { is_completed });
      return response.data;
    },
    // Otimização: Atualiza o cache localmente antes de invalidar (opcional, mas bom UX)
    onMutate: async (updatedTask) => {
        await queryClient.cancelQueries({ queryKey: ['tasks'] });
        const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
        queryClient.setQueryData<Task[]>(['tasks'], (old) =>
          old?.map((task) =>
            task.id === updatedTask.id ? { ...task, is_completed: updatedTask.is_completed } : task
          )
        );
        return { previousTasks };
    },
    onError: (err, updatedTask, context) => {
        queryClient.setQueryData(['tasks'], context?.previousTasks); // Reverte em caso de erro
        toast({ title: 'Erro ao atualizar tarefa', variant: 'destructive'});
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Garante a consistência
    },
  });

  // 7. Modifique a mutation de deletar tarefa
  const deleteMutation = useMutation({
    // mutationFn agora usa apiClient para chamar DELETE /tasks/<id>
    mutationFn: async (id: number) => { // O ID agora é number
      await apiClient.delete(`/tasks/${id}`);
    },
     // Otimização similar ao update
     onMutate: async (deletedTaskId) => {
        await queryClient.cancelQueries({ queryKey: ['tasks'] });
        const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
        queryClient.setQueryData<Task[]>(['tasks'], (old) =>
          old?.filter((task) => task.id !== deletedTaskId)
        );
        return { previousTasks };
    },
    onError: (err, deletedTaskId, context) => {
        queryClient.setQueryData(['tasks'], context?.previousTasks);
        toast({ title: 'Erro ao deletar tarefa', variant: 'destructive'});
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
     onSuccess: () => { // Mantém o toast de sucesso original
       toast({ title: 'Tarefa removida!' });
     },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      createMutation.mutate(newTask.trim());
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meu Plano de Estudos</h1>
          <p className="text-muted-foreground mt-1">
            Organize suas tarefas de estudo
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Tarefa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTask} className="flex gap-2">
              <Input
                placeholder="Adicionar uma nova tarefa..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1"
                disabled={createMutation.isPending} // Desabilita enquanto cria
              />
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? ( // Mostra spinner no botão
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTasks ? ( // 8. Adiciona estado de loading para a lista
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma tarefa ainda. Adicione sua primeira tarefa acima!
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => ( // Removido o tipo explícito 'Task', TS infere
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={(checked) =>
                        updateMutation.mutate({
                          id: task.id, // ID é number
                          is_completed: checked as boolean,
                        })
                      }
                      // Desabilita enquanto atualiza
                      disabled={updateMutation.isPending && updateMutation.variables?.id === task.id}
                    />
                    <span
                      className={`flex-1 ${
                        task.is_completed
                          ? 'line-through text-muted-foreground'
                          : ''
                      }`}
                    >
                      {task.content}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(task.id)} // ID é number
                       // Desabilita enquanto deleta
                      disabled={deleteMutation.isPending && deleteMutation.variables === task.id}
                    >
                      {/* Mostra spinner no botão se estiver deletando ESTA tarefa */}
                      {deleteMutation.isPending && deleteMutation.variables === task.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

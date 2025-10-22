import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getTasks, createTask, updateTask, deleteTask, Task } from '@/lib/storage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [newTask, setNewTask] = useState('');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => getTasks(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => {
      const task = createTask(content, user!.id);
      return Promise.resolve(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      setNewTask('');
      toast({ title: 'Tarefa adicionada!' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const task = updateTask(id, { is_completed });
      return Promise.resolve(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const success = deleteTask(id);
      return Promise.resolve(success);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
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
              />
              <Button type="submit" disabled={createMutation.isPending}>
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
            {tasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma tarefa ainda. Adicione sua primeira tarefa acima!
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={(checked) =>
                        updateMutation.mutate({
                          id: task.id,
                          is_completed: checked as boolean,
                        })
                      }
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
                      onClick={() => deleteMutation.mutate(task.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
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

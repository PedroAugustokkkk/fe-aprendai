import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  content: string;
  is_completed: boolean;
  created_at: string;
  user_id: string;
}

const TASKS_KEY = 'genie-tasks';

export function getTasks(userId: string): Task[] {
  const tasks = localStorage.getItem(TASKS_KEY);
  if (!tasks) return [];
  const allTasks: Task[] = JSON.parse(tasks);
  return allTasks.filter(t => t.user_id === userId);
}

export function createTask(content: string, userId: string): Task {
  const tasks = localStorage.getItem(TASKS_KEY);
  const allTasks: Task[] = tasks ? JSON.parse(tasks) : [];
  
  const newTask: Task = {
    id: uuidv4(),
    content,
    is_completed: false,
    created_at: new Date().toISOString(),
    user_id: userId,
  };
  
  allTasks.push(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = localStorage.getItem(TASKS_KEY);
  if (!tasks) return null;
  
  const allTasks: Task[] = JSON.parse(tasks);
  const index = allTasks.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  allTasks[index] = { ...allTasks[index], ...updates };
  localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
  return allTasks[index];
}

export function deleteTask(id: string): boolean {
  const tasks = localStorage.getItem(TASKS_KEY);
  if (!tasks) return false;
  
  const allTasks: Task[] = JSON.parse(tasks);
  const filtered = allTasks.filter(t => t.id !== id);
  
  if (filtered.length === allTasks.length) return false;
  
  localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  return true;
}

// Mock API for authentication
export function mockGuestAuth() {
  const userId = `guest-${uuidv4()}`;
  return {
    access_token: `mock-token-${userId}`,
    user: {
      id: userId,
      email: `${userId}@guest.com`,
      is_guest: true,
    },
  };
}

export function mockRegister(username: string, email: string, password: string) {
  const users = localStorage.getItem('genie-users');
  const allUsers = users ? JSON.parse(users) : [];
  
  // Check if email exists
  if (allUsers.find((u: any) => u.email === email)) {
    throw new Error('Email já cadastrado');
  }
  
  const newUser = {
    id: uuidv4(),
    username,
    email,
    password, // In a real app, this would be hashed
    is_guest: false,
  };
  
  allUsers.push(newUser);
  localStorage.setItem('genie-users', JSON.stringify(allUsers));
  
  return newUser;
}

export function mockLogin(email: string, password: string) {
  const users = localStorage.getItem('genie-users');
  if (!users) throw new Error('Credenciais inválidas');
  
  const allUsers = JSON.parse(users);
  const user = allUsers.find((u: any) => u.email === email && u.password === password);
  
  if (!user) throw new Error('Credenciais inválidas');
  
  return {
    access_token: `mock-token-${user.id}`,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      is_guest: false,
    },
  };
}

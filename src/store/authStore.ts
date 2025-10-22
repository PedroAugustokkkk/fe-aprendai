import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username?: string;
  is_guest: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setGuestUser: (token: string, user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) => 
        set({ token, user, isAuthenticated: true }),
      logout: () => {
        localStorage.clear();
        set({ token: null, user: null, isAuthenticated: false });
      },
      setGuestUser: (token, user) =>
        set({ token, user, isAuthenticated: true }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// src/store/authStore.ts
import { create } from 'zustand'; // Linha de código
// 1. Importa createJSONStorage e StateStorage para criar um storage seguro
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'; // Linha de código

export interface User { // Linha de código
  id: string; // Linha de código
  email: string; // Linha de código
  username?: string; // Linha de código
  is_guest: boolean; // Linha de código
} // Linha de código

interface AuthState { // Linha de código
  user: User | null; // Linha de código
  token: string | null; // Linha de código
  isAuthenticated: boolean; // Linha de código
  login: (token: string, user: User) => void; // Linha de código
  logout: () => void; // Linha de código
  setGuestUser: (token: string, user: User) => void; // Linha de código
} // Linha de código

// 2. Cria um "storage falso" que não faz nada.
// Isso é usado em ambientes onde o 'localStorage' não existe (ex: build da Vercel).
const dummyStorage: StateStorage = { // Linha de código
  getItem: () => null, // Linha de código
  setItem: () => undefined, // Linha de código
  removeItem: () => undefined, // Linha de código
}; // Linha de código

export const useAuthStore = create<AuthState>()( // Linha de código
  persist( // Linha de código
    (set) => ({ // Linha de código
      user: null, // Linha de código
      token: null, // Linha de código
      isAuthenticated: false, // Linha de código
      login: (token, user) => // Linha de código
        set({ token, user, isAuthenticated: true }), // Linha de código
      logout: () => { // Linha de código
        // 3. Removemos o 'localStorage.clear()'. 
        // O 'persist' já gerencia o storage. Chamar set() é o correto.
        set({ token: null, user: null, isAuthenticated: false }); // Linha de código
      }, // Linha de código
      setGuestUser: (token, user) => // Linha de código
        set({ token, user, isAuthenticated: true }), // Linha de código
    }), // Linha de código
    { // Linha de código
      name: 'auth-storage', // Linha de código
      // 4. Diz ao 'persist' para usar nosso storage customizado e seguro
      storage: createJSONStorage(() => // Linha de código
        // 5. Se 'window' existir, usa o localStorage. Se não, usa o "storage falso".
        typeof window !== 'undefined' ? window.localStorage : dummyStorage 
      ), // Linha de código
    } // Linha de código
  ) // Linha de código
); // Linha de código

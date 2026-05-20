import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken });
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/api/auth/login', { email, password });
          get().setTokens(data.accessToken, data.refreshToken);
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          await api.post('/api/auth/register', { name, email, password });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          await api.post('/api/auth/logout', { refreshToken });
        } catch {
          // Logout regardless of API response
        } finally {
          get().clearAuth();
        }
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get('/api/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'paython-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { api } from '../api/client';
import { tokenStore } from './tokenStore';
import { notify } from '../lib/notify';
import type { User, TokenResponse } from './types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(() => ({
    token: tokenStore.getToken(),
    user: tokenStore.getUser(),
  }));
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => tokenStore.subscribe(setAuthState), []);

  // restaura sessão via cookie de refresh ao carregar o app
  useEffect(() => {
    axios
      .post<TokenResponse>(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        tokenStore.setAuth(data.token, data.user);
        setUser(data.user);
      })
      .catch(() => {
        tokenStore.setAuth(null, null)
        setUser(null);
      })
      .finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    function handleExpired() {
      notify.warning('Sua sessão expirou. Faça login novamente.');
    }
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
      tokenStore.setAuth(data.token, data.user);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStore.setAuth(null, null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user: authState.user, isAuthenticated: !!authState.token, isInitializing, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
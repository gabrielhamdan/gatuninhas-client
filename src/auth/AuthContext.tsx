import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { api } from '../api/client';
import { tokenStore } from './tokenStore';
import { notify } from '../lib/notify';

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(tokenStore.getToken());
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => tokenStore.subscribe(setAccessTokenState), []);

  // restaura sessão via cookie de refresh ao carregar o app
  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => tokenStore.setToken(data.token))
      .catch(() => tokenStore.setToken(null))
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
      const { data } = await api.post('/auth/login', { email, password });
      tokenStore.setToken(data.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStore.setToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!accessToken, isInitializing, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
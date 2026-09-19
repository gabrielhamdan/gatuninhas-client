import type { User } from './types';

interface AuthState {
  token: string | null;
  user: User | null;
}

type Listener = (state: AuthState) => void;

let state: AuthState = { token: null, user: null };
const listeners = new Set<Listener>();

export const tokenStore = {
  getToken: () => state.token,
  getUser: () => state.user,
  setAuth(token: string | null, user: User | null) {
    state = { token, user };
    listeners.forEach((l) => l(state));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
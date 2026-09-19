type Listener = (token: string | null) => void;
let accessToken: string | null = null;
const listeners = new Set<Listener>();

export const tokenStore = {
  getToken: () => accessToken,
  setToken(token: string | null) {
    accessToken = token;
    listeners.forEach((l) => l(token));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
const STORAGE_KEY = 'remembereLogin';

export const rememberedLogin = {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  },
  set(login: string) {
    localStorage.setItem(STORAGE_KEY, login);
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
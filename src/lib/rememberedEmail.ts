const STORAGE_KEY = 'rememberedEmail';

export const rememberedEmail = {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  },
  set(email: string) {
    localStorage.setItem(STORAGE_KEY, email);
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
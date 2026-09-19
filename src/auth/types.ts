export interface User {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  createdAt: string;
}

export interface TokenResponse {
  token: string;
  expiresInMs: number;
  user: User;
}
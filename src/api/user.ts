import { api } from './client';

export function recoverPassword(email: string) {
  return api.post('/user/recover-password', { email }).then((res) => res.data);
}

export function resetPassword(token: string, password: string) {
  return api.post('/user/reset-password', { token, password }).then((res) => res.data);
}

import type { PagedResponse } from '../types/kitty';
import type { User } from '../auth/types';

export interface AdminUser {
  id: string;
  name: string;
  enabled: boolean;
}

export async function listUsers(page: number, size: number) {
  const { data } = await api.get<PagedResponse<AdminUser>>('/user', { params: { page, size } });
  return data;
}

export async function setUserEnabled(id: string, enabled: boolean) {
  const { data } = await api.put('/user/toggle-enabled', { id, enabled });
  return data;
}

export async function inviteUser(payload: { name: string; email: string; role: string }) {
  const { data } = await api.post('/user', payload);
  return data;
}

export async function registerUser(payload: { token: string; login: string; password: string; name: string }) {
  const { data } = await api.post('/user/register', payload);
  return data;
}

export interface UserInvitation {
  name: string;
  email: string;
}

export async function getInvitation(token: string) {
  const { data } = await api.post<UserInvitation>(`/user/register/${token}`);
  return data;
}

export async function updateProfile(payload: { name: string; email: string }) {
  const { data } = await api.put<User>('/user', payload);
  return data;
}

export async function changePassword(payload: { password: string; newPassword: string }) {
  const { data } = await api.post('/user/change-password', payload);
  return data;
}
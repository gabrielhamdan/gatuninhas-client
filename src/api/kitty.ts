import { api } from './client';
import type { Kitty, KittyListItem, PagedResponse } from '../types/kitty';

export function listKitties(page: number, size: number, sort = 'id,asc') {
  return api
    .get<PagedResponse<KittyListItem>>('/kitty', { params: { page, size, sort } })
    .then((res) => res.data);
}

export function getKitty(id: string) {
  return api.get<Kitty>(`/kitty/${id}`).then((res) => res.data);
}

export interface CreateKittyPayload {
  name: string;
  sex: string;
  intakeNotes: string;
  temperament: string;
  profileImage?: File;
}

export function createKitty(payload: CreateKittyPayload) {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('sex', payload.sex);
  formData.append('intakeNotes', payload.intakeNotes);
  formData.append('temperament', payload.temperament);
  if (payload.profileImage) formData.append('profileImage', payload.profileImage);

  return api
    .post<Kitty>('/kitty', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
}

export interface UpdateKittyPayload {
  id: string;
  name: string;
  sex: string;
    dob: {
    date: string | null;
    precision: string;
  };
  intakeNotes: string;
  temperament: string;
  observations: string;
}

export function updateKitty(payload: UpdateKittyPayload) {
  return api.put<Kitty>('/kitty', payload).then((res) => res.data);
}

export function deleteKitty(id: string) {
  return api.delete(`/kitty/${id}`).then((res) => res.data);
}
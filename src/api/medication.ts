import { api } from './client';
import type { PagedResponse } from '../types/kitty';

export interface Medication {
  id: string;
  name: string;
  laboratory: string;
  type: { id: string; name: string };
}

export async function listMedications() {
  const { data } = await api.get<PagedResponse<Medication>>('/medication', { params: { size: 100, sort: 'name,asc' } });
  return data.content;
}
import { api } from './client';
import type { PagedResponse } from '../types/kitty';

export interface TestType {
  id: string;
  name: string;
}

export async function listTestTypes() {
  const { data } = await api.get<PagedResponse<TestType>>('/test-type', { params: { size: 100, sort: 'name,asc' } });
  return data.content;
}
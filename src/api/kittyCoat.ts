import { api } from './client';
import type { PagedResponse } from '../types/kitty';

export interface KittyCoatOption {
  id: number | null;
  type: string;
}

export function searchKittyCoats(type: string) {
  return api
    .get<PagedResponse<KittyCoatOption>>('/kitty-coat', { params: { type, size: 10 } })
    .then((res) => res.data.content);
}
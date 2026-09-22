export type KittySex = 'MALE' | 'FEMALE' | 'INTERSEX' | 'UNKNOWN';

export interface KittyListItem {
  id: string;
  name: string;
}

export interface Kitty {
  id: string;
  name: string;
  sex: KittySex;
  profileImage: string | null;
  images: string[];
  intakeNotes: string;
  temperament: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
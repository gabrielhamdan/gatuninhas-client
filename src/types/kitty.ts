export type KittySex = 'MALE' | 'FEMALE' | 'INTERSEX' | 'UNKNOWN';

export interface KittyListItem {
  id: string;
  name: string;
}

export type KittyDobPrecision = 'EXACT' | 'APPROXIMATE' | 'UNKNOWN';

export interface KittyDob {
  date: string | null;
  precision: KittyDobPrecision;
}

export interface Kitty {
  id: string;
  name: string;
  sex: KittySex;
  dob: KittyDob;
  profileImage: string | null;
  images: string[];
  intakeNotes: string;
  temperament: string;
  observations: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
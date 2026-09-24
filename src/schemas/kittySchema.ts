import { z } from 'zod';

export const kittySexOptions = ['MALE', 'FEMALE', 'INTERSEX', 'UNKNOWN'] as const;

export const kittySexLabels: Record<(typeof kittySexOptions)[number], string> = {
  MALE: 'macho',
  FEMALE: 'fêmea',
  INTERSEX: 'intersexo',
  UNKNOWN: 'desconhecido',
};

export const DEFAULT_KITTY_SEX: keyof typeof kittySexLabels = 'MALE';

export const kittySchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  sex: z.enum(kittySexOptions, { message: 'Selecione o sexo' }),
  dob: z.string().optional(),
  coat: z.string().optional(),
  intakeNotes: z.string(),
  temperament: z.string(),
  notes: z.string().optional(),
  profileImage: z
    .custom<FileList>()
    .optional()
    .transform((files) => (files && files.length > 0 ? files[0] : undefined)),
});

export type KittyFormInput = z.input<typeof kittySchema>;
export type KittyFormData = z.output<typeof kittySchema>;
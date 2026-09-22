import { z } from 'zod';

export const kittySexOptions = ['MALE', 'FEMALE', 'INTERSEX', 'UNKNOWN'] as const;

export const kittySchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  sex: z.enum(kittySexOptions, { message: 'Selecione o sexo' }),
  intakeNotes: z.string().min(1, 'Informe as notas de admissão'),
  temperament: z.string().min(1, 'Informe o temperamento'),
  profileImage: z
    .custom<FileList>()
    .optional()
    .transform((files) => (files && files.length > 0 ? files[0] : undefined)),
});

export const kittySexLabels: Record<(typeof kittySexOptions)[number], string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  INTERSEX: 'Intersexo',
  UNKNOWN: 'Desconhecido',
};

export type KittyFormInput = z.input<typeof kittySchema>;
export type KittyFormData = z.output<typeof kittySchema>;
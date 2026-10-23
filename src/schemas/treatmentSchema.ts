import { z } from 'zod';

export const treatmentSchema = z.object({
  description: z.string().min(1, 'Informe a descrição'),
  startDate: z.string().min(1, 'Informe a data de início'),
  endDate: z.string(),
});

export type TreatmentFormData = z.infer<typeof treatmentSchema>;
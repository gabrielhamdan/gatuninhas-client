import { z } from 'zod';

export const testSchema = z.object({
  testTypeId: z.string().min(1, 'Selecione o tipo de exame'),
  testDate: z.string().min(1, 'Informe a data do exame'),
});

export type TestFormData = z.infer<typeof testSchema>;
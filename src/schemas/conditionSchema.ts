import { z } from 'zod';

export const conditionTypeOptions = ['DISEASE', 'SPECIAL_CONDITION'] as const;

export const conditionTypeLabels: Record<(typeof conditionTypeOptions)[number], string> = {
  DISEASE: 'Doença crônica',
  SPECIAL_CONDITION: 'Condição especial',
};

export const conditionSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  description: z.string(),
  type: z.enum(conditionTypeOptions),
});

export type ConditionFormData = z.infer<typeof conditionSchema>;
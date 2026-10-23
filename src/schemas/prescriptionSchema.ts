import { z } from 'zod';

export const regimenOptions = ['SINGLE_DOSE', 'CONTINUOUS', 'PERIOD'] as const;

export const regimenLabels: Record<(typeof regimenOptions)[number], string> = {
  SINGLE_DOSE: 'Dose única',
  CONTINUOUS: 'Uso contínuo',
  PERIOD: 'Uso periódico',
};

export const prescriptionSchema = z
  .object({
    medicationId: z.string().min(1, 'Selecione a medicação'),
    regimen: z.enum(regimenOptions),
    startDate: z.string().min(1, 'Informe a data de início'),
    endDate: z.string(),
    dose: z.string(),
    frequency: z.string(),
    batch: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.regimen !== 'PERIOD') return;
    if (!data.endDate) {
      ctx.addIssue({ code: 'custom', message: 'Informe a data de término', path: ['endDate'] });
    } else if (data.endDate < data.startDate) {
      ctx.addIssue({ code: 'custom', message: 'O término não pode ser anterior ao início', path: ['endDate'] });
    }
  });

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
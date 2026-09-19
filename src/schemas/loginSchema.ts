import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
  password: z.string(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
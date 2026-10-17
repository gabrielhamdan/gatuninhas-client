import { z } from 'zod';

export const strongPassword = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .regex(/[A-Z]/, 'Precisa de uma letra maiúscula')
  .regex(/[a-z]/, 'Precisa de uma letra minúscula')
  .regex(/[0-9]/, 'Precisa de um número')
  .regex(/[^A-Za-z0-9]/, 'Precisa de um caractere especial');

export const recoverPasswordSchema = z.object({
  email: z.email('E-mail inválido'),
});

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
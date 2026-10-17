import { z } from 'zod';
import { strongPassword } from './passwordSchema';

export const userRoleOptions = ['USER', 'ADMIN'] as const;

export const userRoleLabels: Record<(typeof userRoleOptions)[number], string> = {
  USER: 'Usuário',
  ADMIN: 'Administrador',
};

export const inviteUserSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  role: z.enum(userRoleOptions),
});

export const registerUserSchema = z
  .object({
    name: z.string().min(1, 'Informe o nome'),
    login: z
      .string()
      .min(3, 'Mínimo de 3 caracteres')
      .max(30, 'Máximo de 30 caracteres')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, números, ponto, hífen e sublinhado'),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export type InviteUserFormData = z.infer<typeof inviteUserSchema>;
export type RegisterUserFormData = z.infer<typeof registerUserSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  email: z.email('E-mail inválido'),
});

export const changePasswordSchema = z
  .object({
    password: z.string().min(1, 'Informe a senha atual'),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { resetPassword } from '../api/user';
import { getErrorMessage } from '../lib/errors';
import { notify } from '../lib/notify';
import { resetPasswordSchema } from '../schemas/passwordSchema';
import type { ResetPasswordFormData } from '../schemas/passwordSchema';

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    try {
      await resetPassword(token, data.password);
      notify.success('Senha redefinida com sucesso. Faça login.');
      navigate('/login', { replace: true });
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', px: 2 }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
          Redefinir senha
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate
             sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nova senha"
            type="password"
            fullWidth
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label="Confirmar nova senha"
            type="password"
            fullWidth
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Checkbox, FormControlLabel, Paper, TextField, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../lib/errors';
import { notify } from '../lib/notify';
import { rememberedEmail } from '../lib/rememberedEmail';
import { loginSchema } from '../schemas/loginSchema';
import type { LoginFormData } from '../schemas/loginSchema';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(!!rememberedEmail.get());

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail.get() ?? '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);

      if (rememberMe) {
        rememberedEmail.set(data.email);
      } else {
        rememberedEmail.clear();
      }

      navigate('/dashboard');
    } catch (error) {
      notify.error(getErrorMessage(error, { 401: 'E-mail ou senha inválidos' }));
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', px: 2 }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
          Entrar
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate
             sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="E-mail"
            type="email"
            fullWidth
            autoComplete="off"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Senha"
            type="password"
            fullWidth
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <FormControlLabel
            control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
            label="Lembrar e-mail"
          />

          <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
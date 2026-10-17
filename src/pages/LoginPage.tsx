import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Checkbox, FormControlLabel, Paper, TextField, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../lib/errors';
import { notify } from '../lib/notify';
import { rememberedLogin } from '../lib/rememberedLogin';
import { loginSchema } from '../schemas/loginSchema';
import type { LoginFormData } from '../schemas/loginSchema';
import { RecoverPasswordDialog } from '../components/RecoverPasswordDialog';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(!!rememberedLogin.get());
  const [recoverOpen, setRecoverOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: rememberedLogin.get() ?? '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.login, data.password);

      if (rememberMe) {
        rememberedLogin.set(data.login);
      } else {
        rememberedLogin.clear();
      }

      navigate('/');
    } catch (error) {
      notify.error(getErrorMessage(error, { 401: 'Login ou senha inválidos' }));
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
            label="Login"
            fullWidth
            autoComplete="off"
            {...register('login')}
            error={!!errors.login}
            helperText={errors.login?.message}
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
            label="Confiar neste dispositivo"
          />

          <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          <Button variant="text" size="small" onClick={() => setRecoverOpen(true)}>
            Esqueci minha senha
          </Button>
        </Box>
      </Paper>

      <RecoverPasswordDialog open={recoverOpen} onClose={() => setRecoverOpen(false)} />
    </Box>
  );
}
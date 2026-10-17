import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { getInvitation, registerUser } from '../api/user';
import { getErrorMessage } from '../lib/errors';
import { notify } from '../lib/notify';
import { registerUserSchema } from '../schemas/userSchema';
import type { RegisterUserFormData } from '../schemas/userSchema';

export function RegisterUserPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [welcomeName, setWelcomeName] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RegisterUserFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: { name: '', login: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadInvitation() {
      if (!token) {
        navigate('/404', { replace: true });
        return;
      }
      try {
        const invitation = await getInvitation(token);
        if (cancelled) return;
        setEmail(invitation.email);
        setWelcomeName(invitation.name);
        reset({ name: invitation.name, login: '', password: '', confirmPassword: '' });
        setLoading(false);
      } catch {
        if (!cancelled) navigate('/404', { replace: true });
      }
    }

    loadInvitation();
    return () => {
      cancelled = true;
    };
  }, [token, navigate, reset]);

  const onSubmit = async (data: RegisterUserFormData) => {
    if (!token) return;
    try {
      await registerUser({ token, name: data.name, login: data.login, password: data.password });
      notify.success('Cadastro concluído. Faça login.');
      navigate('/login', { replace: true });
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', px: 2 }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="h1">Boas-vindas, {welcomeName}!</Typography>
          <Typography variant="body2" color="text.secondary">Conclua seu cadastro para acessar o sistema.</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="E-mail" fullWidth value={email} disabled />
          <TextField label="Nome" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Login" fullWidth autoComplete="off" {...register('login')} error={!!errors.login} helperText={errors.login?.message} />
          <TextField label="Senha" type="password" fullWidth {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
          <TextField label="Confirmar senha" type="password" fullWidth {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />

          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Concluir cadastro'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
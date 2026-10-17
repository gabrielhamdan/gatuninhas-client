import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import { changePassword, updateProfile } from '../../api/user';
import { useAuth } from '../../auth/AuthContext';
import { tokenStore } from '../../auth/tokenStore';
import { getErrorMessage } from '../../lib/errors';
import { notify } from '../../lib/notify';
import { changePasswordSchema, updateProfileSchema } from '../../schemas/userSchema';
import type { ChangePasswordFormData, UpdateProfileFormData } from '../../schemas/userSchema';

function ProfileForm() {
  const { user } = useAuth();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      const updated = await updateProfile(data);
      tokenStore.setAuth(tokenStore.getToken(), updated);
      reset({ name: updated.name, email: updated.email });
      notify.success('Perfil atualizado.');
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Dados pessoais</Typography>
      <TextField label="Nome" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
      <TextField label="E-mail" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
      <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-end' }} disabled={!isDirty || isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </Box>
  );
}

function PasswordForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({ password: data.password, newPassword: data.newPassword });
      reset();
      notify.success('Senha alterada com sucesso.');
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Alterar senha</Typography>
      <TextField label="Senha atual" type="password" fullWidth autoComplete="current-password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
      <TextField label="Nova senha" type="password" fullWidth autoComplete="new-password" {...register('newPassword')} error={!!errors.newPassword} helperText={errors.newPassword?.message} />
      <TextField label="Confirmar nova senha" type="password" fullWidth autoComplete="new-password" {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
      <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-end' }} disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Alterar senha'}
      </Button>
    </Box>
  );
}

export function ProfileTab() {
  return (
    <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Box sx={{ flex: 1 }}>
        <ProfileForm />
      </Box>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
      <Divider sx={{ display: { xs: 'block', md: 'none' } }} />

      <Box sx={{ flex: 1 }}>
        <PasswordForm />
      </Box>
    </Paper>
  );
}
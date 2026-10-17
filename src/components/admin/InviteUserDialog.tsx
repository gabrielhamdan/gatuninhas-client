import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { inviteUser } from '../../api/user';
import { getErrorMessage } from '../../lib/errors';
import { notify } from '../../lib/notify';
import { inviteUserSchema, userRoleLabels, userRoleOptions } from '../../schemas/userSchema';
import type { InviteUserFormData } from '../../schemas/userSchema';

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InviteUserDialog({ open, onClose }: InviteUserDialogProps) {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { name: '', email: '', role: 'USER' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: InviteUserFormData) => {
    try {
      await inviteUser(data);
      notify.success('Convite enviado por e-mail.');
      handleClose();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Novo usuário</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Nome" fullWidth autoComplete="false" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="E-mail" autoComplete="false" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Perfil" fullWidth>
                {userRoleOptions.map((option) => (
                  <MenuItem key={option} value={option}>{userRoleLabels[option]}</MenuItem>
                ))}
              </TextField>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar convite'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
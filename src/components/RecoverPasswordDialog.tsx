import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { recoverPassword } from '../api/user';
import { getErrorMessage } from '../lib/errors';
import { notify } from '../lib/notify';
import { recoverPasswordSchema } from '../schemas/passwordSchema';
import type { RecoverPasswordFormData } from '../schemas/passwordSchema';

interface RecoverPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RecoverPasswordDialog({ open, onClose }: RecoverPasswordDialogProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: RecoverPasswordFormData) => {
    try {
      await recoverPassword(data.email);
      notify.success('Se o e-mail estiver cadastrado, você receberá o link de redefinição.');
      handleClose();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Recuperar senha</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Informe o e-mail cadastrado e enviaremos um link para redefinir a senha.
          </Typography>
          <TextField
            label="E-mail"
            type="email"
            autoComplete="off"
            fullWidth
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
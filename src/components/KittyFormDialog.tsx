import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Box,
} from '@mui/material';
import { kittySchema, kittySexOptions, kittySexLabels } from '../schemas/kittySchema';
import type { KittyFormInput, KittyFormData } from '../schemas/kittySchema';
import type { Kitty } from '../types/kitty';

interface KittyFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: KittyFormData) => Promise<void>;
  kitty?: Kitty | null;
  isSubmitting: boolean;
}

export function KittyFormDialog({ open, onClose, onSubmit, kitty, isSubmitting }: KittyFormDialogProps) {
  const isEditing = !!kitty;

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<KittyFormInput, unknown, KittyFormData>({
    resolver: zodResolver(kittySchema),
    defaultValues: { name: '', sex: 'UNKNOWN', intakeNotes: '', temperament: '' },
  });

  useEffect(() => {
    if (open) {
      reset(kitty
        ? { name: kitty.name, sex: kitty.sex, intakeNotes: kitty.intakeNotes, temperament: kitty.temperament }
        : { name: '', sex: 'UNKNOWN', intakeNotes: '', temperament: '' });
    }
  }, [open, kitty, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar gatinho' : 'Cadastrar gatinho'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nome" fullWidth
            {...register('name')} error={!!errors.name} helperText={errors.name?.message}
          />

          <Controller
            name="sex"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Sexo" fullWidth error={!!errors.sex} helperText={errors.sex?.message}>
                {kittySexOptions.map((option) => (
                  <MenuItem key={option} value={option}>{kittySexLabels[option]}</MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label="Notas de admissão" fullWidth multiline rows={3}
            {...register('intakeNotes')} error={!!errors.intakeNotes} helperText={errors.intakeNotes?.message}
          />

          <TextField
            label="Temperamento" fullWidth multiline rows={2}
            {...register('temperament')} error={!!errors.temperament} helperText={errors.temperament?.message}
          />

          {!isEditing && (
            <Button component="label" variant="outlined">
              Selecionar foto
              <input type="file" accept="image/*" hidden {...register('profileImage')} />
            </Button>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
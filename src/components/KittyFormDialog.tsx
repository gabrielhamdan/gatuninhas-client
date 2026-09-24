import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Box, Avatar,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { kittySchema, kittySexOptions, kittySexLabels, DEFAULT_KITTY_SEX } from '../schemas/kittySchema';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } =
    useForm<KittyFormInput, unknown, KittyFormData>({
      resolver: zodResolver(kittySchema),
      defaultValues: { name: '', sex: DEFAULT_KITTY_SEX, dob: '', coat: '', intakeNotes: '', temperament: '', notes: '' },
    });

  const profileImageFiles = watch('profileImage');

  useEffect(() => {
    if (isEditing) return;
    const file = profileImageFiles?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImageFiles, isEditing]);

  useEffect(() => {
    if (!open) return;
    setPreviewUrl(null);
    reset(kitty
      ? { name: kitty.name, sex: kitty.sex, dob: '', coat: '', intakeNotes: kitty.intakeNotes, temperament: kitty.temperament, notes: '' }
      : { name: '', sex: DEFAULT_KITTY_SEX, dob: '', coat: '', intakeNotes: '', temperament: '', notes: '' });
  }, [open, kitty, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar gatinho' : 'Cadastrar gatinho'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isEditing && (
            <Box
              component="label"
              sx={{
                position: 'relative',
                width: 160,
                height: 160,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'block',
                alignSelf: 'center',
                bgcolor: 'action.hover',
                '&:hover .photo-overlay': { opacity: 1 },
              }}
            >
              <Avatar src={previewUrl ?? undefined} variant="rounded" sx={{ width: '100%', height: '100%' }} />
              <Box
                className="photo-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: previewUrl ? 0 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <CameraAltIcon sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <input type="file" accept="image/*" hidden {...register('profileImage')} />
            </Box>
          )}

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
            label="Data de nascimento" type="date" fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('dob')}
            helperText="Em breve"
          />

          <TextField
            label="Pelagem" fullWidth
            {...register('coat')}
            helperText="Em breve"
          />

          <TextField
            label="Notas de entrada" fullWidth multiline rows={3}
            {...register('intakeNotes')} error={!!errors.intakeNotes} helperText={errors.intakeNotes?.message}
          />

          <TextField
            label="Temperamento" fullWidth multiline rows={2}
            {...register('temperament')} error={!!errors.temperament} helperText={errors.temperament?.message}
          />

          <TextField
            label="Observação" fullWidth multiline rows={2}
            {...register('notes')}
            helperText="Em breve"
          />
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
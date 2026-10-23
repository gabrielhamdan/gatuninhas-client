import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { conditionSchema, conditionTypeLabels, conditionTypeOptions } from '../../schemas/conditionSchema';
import type { ConditionFormData } from '../../schemas/conditionSchema';
import type { MedicalCondition } from '../../types/clinicalHistory';

interface ConditionFormDialogProps {
  open: boolean;
  condition: MedicalCondition | null;
  onClose: () => void;
  onSubmit: (data: ConditionFormData) => Promise<void>;
}

export function ConditionFormDialog({ open, condition, onClose, onSubmit }: ConditionFormDialogProps) {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ConditionFormData>({
    resolver: zodResolver(conditionSchema),
    defaultValues: { name: '', description: '', type: 'DISEASE' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      condition
        ? {
            name: condition.name,
            description: condition.description ?? '',
            type: condition.type as ConditionFormData['type'],
          }
        : { name: '', description: '', type: 'DISEASE' },
    );
  }, [open, condition, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{condition ? 'Editar condição' : 'Nova condição'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Nome" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Tipo" fullWidth>
                {conditionTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>{conditionTypeLabels[option]}</MenuItem>
                ))}
              </TextField>
            )}
          />
          <TextField label="Descrição" fullWidth multiline rows={3} {...register('description')} />
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
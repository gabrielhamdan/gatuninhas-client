import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { treatmentSchema } from '../../schemas/treatmentSchema';
import type { TreatmentFormData } from '../../schemas/treatmentSchema';
import type { MedicalTreatment } from '../../types/clinicalHistory';

interface TreatmentFormDialogProps {
  open: boolean;
  treatment: MedicalTreatment | null;
  onClose: () => void;
  onSubmit: (data: TreatmentFormData) => Promise<void>;
}

export function TreatmentFormDialog({ open, treatment, onClose, onSubmit }: TreatmentFormDialogProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: { description: '', startDate: '', endDate: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      treatment
        ? { description: treatment.description, startDate: treatment.startDate, endDate: treatment.endDate ?? '' }
        : { description: '', startDate: '', endDate: '' },
    );
  }, [open, treatment, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{treatment ? 'Editar tratamento' : 'Novo tratamento'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Descrição" fullWidth multiline rows={2}
            {...register('description')} error={!!errors.description} helperText={errors.description?.message}
          />
          <TextField
            label="Início" type="date" fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('startDate')} error={!!errors.startDate} helperText={errors.startDate?.message}
          />
          <TextField
            label="Término" type="date" fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('endDate')}
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
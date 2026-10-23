import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import type { Medication } from '../../api/medication';
import { prescriptionSchema, regimenLabels, regimenOptions } from '../../schemas/prescriptionSchema';
import type { PrescriptionFormData } from '../../schemas/prescriptionSchema';
import type { MedicalPrescription } from '../../types/clinicalHistory';

const EMPTY: PrescriptionFormData = {
  medicationId: '', regimen: 'SINGLE_DOSE', startDate: '', endDate: '', dose: '', frequency: '', batch: '',
};

interface PrescriptionFormDialogProps {
  open: boolean;
  prescription: MedicalPrescription | null;
  medications: Medication[];
  onClose: () => void;
  onSubmit: (data: PrescriptionFormData) => Promise<void>;
}

export function PrescriptionFormDialog({ open, prescription, medications, onClose, onSubmit }: PrescriptionFormDialogProps) {
  const { register, handleSubmit, control, reset, watch, formState: { errors, isSubmitting } } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      prescription
        ? {
            medicationId: prescription.medication.id,
            regimen: prescription.regimen as PrescriptionFormData['regimen'],
            startDate: prescription.startDate,
            endDate: prescription.endDate ?? '',
            dose: prescription.dose ?? '',
            frequency: prescription.frequency ?? '',
            batch: prescription.batch ?? '',
          }
        : EMPTY,
    );
  }, [open, prescription, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{prescription ? 'Editar medicação' : 'Nova medicação'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="medicationId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={medications}
                getOptionLabel={(option) => `${option.name} · ${option.laboratory}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={medications.find((m) => m.id === field.value) ?? null}
                onChange={(_, value) => field.onChange(value?.id ?? '')}
                renderInput={(params) => (
                  <TextField {...params} label="Medicação" error={!!errors.medicationId} helperText={errors.medicationId?.message} />
                )}
              />
            )}
          />

          <Controller
            name="regimen"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Regime" fullWidth>
                {regimenOptions.map((option) => (
                  <MenuItem key={option} value={option}>{regimenLabels[option]}</MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label="Início" type="date" fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('startDate')} error={!!errors.startDate} helperText={errors.startDate?.message}
          />

          {watch('regimen') === 'PERIOD' && (
            <TextField
              label="Término" type="date" fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              {...register('endDate')} error={!!errors.endDate} helperText={errors.endDate?.message}
            />
          )}

          <TextField label="Dose" fullWidth {...register('dose')} />
          <TextField label="Frequência" fullWidth {...register('frequency')} />
          <TextField label="Lote" fullWidth {...register('batch')} />
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
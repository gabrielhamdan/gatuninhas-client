import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import type { TestType } from '../../api/testType';
import { testSchema } from '../../schemas/testSchema';
import type { TestFormData } from '../../schemas/testSchema';
import type { MedicalTest } from '../../types/clinicalHistory';

interface TestFormDialogProps {
  open: boolean;
  test: MedicalTest | null;
  testTypes: TestType[];
  onClose: () => void;
  onSubmit: (data: TestFormData, file: File | null) => Promise<void>;
}

export function TestFormDialog({ open, test, testTypes, onClose, onSubmit }: TestFormDialogProps) {
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: { testTypeId: '', testDate: '' },
  });

  useEffect(() => {
    if (!open) return;
    setFile(null);
    reset(test ? { testTypeId: test.testTypeId, testDate: test.testDate } : { testTypeId: '', testDate: '' });
  }, [open, test, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{test ? 'Editar exame' : 'Novo exame'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data, file))} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="testTypeId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={testTypes}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={testTypes.find((t) => t.id === field.value) ?? null}
                onChange={(_, value) => field.onChange(value?.id ?? '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo de exame"
                    error={!!errors.testTypeId}
                    helperText={errors.testTypeId?.message}
                  />
                )}
              />
            )}
          />

          <TextField
            label="Data do exame" type="date" fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('testDate')} error={!!errors.testDate} helperText={errors.testDate?.message}
          />

          {!test && (
            <Button component="label" variant="outlined" startIcon={<AttachFileIcon />}>
              {file ? file.name : 'Anexar arquivo (opcional)'}
              <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
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
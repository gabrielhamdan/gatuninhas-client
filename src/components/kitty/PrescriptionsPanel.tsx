import { useEffect, useState } from 'react';
import { Box, Button, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { createPrescription, deletePrescription, updatePrescription } from '../../api/clinicalHistory';
import { listMedications } from '../../api/medication';
import type { Medication } from '../../api/medication';
import { formatDate, formatPeriod } from '../../lib/dates';
import { getErrorMessage } from '../../lib/errors';
import { notify } from '../../lib/notify';
import { regimenLabels } from '../../schemas/prescriptionSchema';
import type { PrescriptionFormData } from '../../schemas/prescriptionSchema';
import type { MedicalPrescription } from '../../types/clinicalHistory';
import { ConfirmDialog } from '../ConfirmDialog';
import { PrescriptionFormDialog } from './PrescriptionFormDialog';

interface PrescriptionsPanelProps {
  historyId: string;
  prescriptions: MedicalPrescription[];
  onChange: (prescriptions: MedicalPrescription[]) => void;
}

function periodText(p: MedicalPrescription) {
  if (p.regimen === 'PERIOD') return formatPeriod(p.startDate, p.endDate);
  if (p.regimen === 'CONTINUOUS') return `Desde ${formatDate(p.startDate)}`;
  return formatDate(p.startDate);
}

export function PrescriptionsPanel({ historyId, prescriptions, onChange }: PrescriptionsPanelProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalPrescription | null>(null);
  const [deleting, setDeleting] = useState<MedicalPrescription | null>(null);

  useEffect(() => {
    async function loadMedications() {
      try {
        setMedications(await listMedications());
      } catch (error) {
        notify.error(getErrorMessage(error));
      }
    }

    loadMedications();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (prescription: MedicalPrescription) => {
    setEditing(prescription);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: PrescriptionFormData) => {
    const payload = {
      medicationId: data.medicationId,
      regimen: data.regimen,
      startDate: data.startDate,
      endDate: data.regimen === 'PERIOD' ? data.endDate : null,
      dose: data.dose || null,
      frequency: data.frequency || null,
      batch: data.batch || null,
    };
    try {
      if (editing) {
        const updated = await updatePrescription(editing.id, payload);
        onChange(prescriptions.map((p) => (p.id === updated.id ? updated : p)));
        notify.success('Medicação alterada.');
      } else {
        const created = await createPrescription(historyId, payload);
        onChange([...prescriptions, created]);
        notify.success('Medicação incluída.');
      }
      setDialogOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deletePrescription(deleting.id);
      onChange(prescriptions.filter((p) => p.id !== deleting.id));
      notify.success('Medicação excluída.');
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova medicação
        </Button>
      </Box>

      {prescriptions.length === 0 ? (
        <Typography color="text.secondary">Nenhuma medicação registrada.</Typography>
      ) : (
        <List disablePadding>
          {prescriptions.map((p) => (
            <ListItem
              key={p.id}
              disableGutters
              secondaryAction={
                <>
                  <IconButton size="small" onClick={() => openEdit(p)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleting(p)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={
                  <>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>{p.medication.name}</Typography>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {' · '}
                      {p.medication.type.name}
                    </Typography>
                  </>
                }
                secondary={
                  <>
                    {p.batch && (
                      <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                        Lote: {p.batch}
                      </Typography>
                    )}
                    <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                      {[
                        regimenLabels[p.regimen as keyof typeof regimenLabels] ?? p.regimen,
                        periodText(p),
                        p.dose && `Dose: ${p.dose}`,
                        p.frequency && `Frequência: ${p.frequency}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <PrescriptionFormDialog
        open={dialogOpen}
        prescription={editing}
        medications={medications}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir medicação"
        message={`Deseja excluir "${deleting?.medication.name}" do histórico?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </Box>
  );
}
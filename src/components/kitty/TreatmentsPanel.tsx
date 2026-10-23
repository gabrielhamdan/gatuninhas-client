import { useState } from 'react';
import { Box, Button, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { createTreatment, deleteTreatment, updateTreatment } from '../../api/clinicalHistory';
import { formatPeriod } from '../../lib/dates';
import { getErrorMessage } from '../../lib/errors';
import { notify } from '../../lib/notify';
import type { TreatmentFormData } from '../../schemas/treatmentSchema';
import type { MedicalTreatment } from '../../types/clinicalHistory';
import { ConfirmDialog } from '../ConfirmDialog';
import { TreatmentFormDialog } from './TreatmentFormDialog';

interface TreatmentsPanelProps {
    historyId: string;
    treatments: MedicalTreatment[];
    onChange: (treatments: MedicalTreatment[]) => void;
}

export function TreatmentsPanel({ historyId, treatments, onChange }: TreatmentsPanelProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<MedicalTreatment | null>(null);
    const [deleting, setDeleting] = useState<MedicalTreatment | null>(null);

    const openCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (treatment: MedicalTreatment) => {
        setEditing(treatment);
        setDialogOpen(true);
    };

    const handleSubmit = async (data: TreatmentFormData) => {
        const payload = {
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate || null,
        };
        try {
            if (editing) {
                const updated = await updateTreatment(editing.id, payload);
                onChange(treatments.map((t) => (t.id === updated.id ? updated : t)));
                notify.success('Tratamento alterado.');
            } else {
                const created = await createTreatment(historyId, payload);
                onChange([...treatments, created]);
                notify.success('Tratamento incluído.');
            }
            setDialogOpen(false);
        } catch (error) {
            notify.error(getErrorMessage(error));
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await deleteTreatment(deleting.id);
            onChange(treatments.filter((t) => t.id !== deleting.id));
            notify.success('Tratamento excluído.');
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
                    Novo tratamento
                </Button>
            </Box>

            {treatments.length === 0 ? (
                <Typography color="text.secondary">Nenhum tratamento registrado.</Typography>
            ) : (
                <List disablePadding>
                    {treatments.map((t) => (
                        <ListItem
                            key={t.id}
                            disableGutters
                            secondaryAction={
                                <>
                                    <IconButton size="small" onClick={() => openEdit(t)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => setDeleting(t)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </>
                            }
                        >
                            <ListItemText primary={t.description} secondary={formatPeriod(t.startDate, t.endDate)} />
                        </ListItem>
                    ))}
                </List>
            )}

            <TreatmentFormDialog
                open={dialogOpen}
                treatment={editing}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                open={!!deleting}
                title="Excluir tratamento"
                message="Deseja excluir este tratamento do histórico?"
                confirmLabel="Excluir"
                onConfirm={handleDelete}
                onCancel={() => setDeleting(null)}
            />
        </Box>
    );
}
import { useState } from 'react';
import { Box, Button, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { createCondition, deleteCondition, updateCondition } from '../../api/clinicalHistory';
import { getErrorMessage } from '../../lib/errors';
import { notify } from '../../lib/notify';
import { conditionTypeLabels } from '../../schemas/conditionSchema';
import type { ConditionFormData } from '../../schemas/conditionSchema';
import type { MedicalCondition } from '../../types/clinicalHistory';
import { ConfirmDialog } from '../ConfirmDialog';
import { ConditionFormDialog } from './ConditionFormDialog';

interface ConditionsPanelProps {
  historyId: string;
  conditions: MedicalCondition[];
  onChange: (conditions: MedicalCondition[]) => void;
}

export function ConditionsPanel({ historyId, conditions, onChange }: ConditionsPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalCondition | null>(null);
  const [deleting, setDeleting] = useState<MedicalCondition | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (condition: MedicalCondition) => {
    setEditing(condition);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: ConditionFormData) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      type: data.type,
    };
    try {
      if (editing) {
        const updated = await updateCondition(editing.id, payload);
        onChange(conditions.map((c) => (c.id === updated.id ? updated : c)));
        notify.success('Condição alterada.');
      } else {
        const created = await createCondition(historyId, payload);
        onChange([...conditions, created]);
        notify.success('Condição incluída.');
      }
      setDialogOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCondition(deleting.id);
      onChange(conditions.filter((c) => c.id !== deleting.id));
      notify.success('Condição excluída.');
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
          Nova condição
        </Button>
      </Box>

      {conditions.length === 0 ? (
        <Typography color="text.secondary">Nenhuma condição registrada.</Typography>
      ) : (
        <List disablePadding>
          {conditions.map((c) => (
            <ListItem
              key={c.id}
              disableGutters
              secondaryAction={
                <>
                  <IconButton size="small" onClick={() => openEdit(c)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleting(c)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={
                  <>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>
                      {c.name}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {' · '}
                      {conditionTypeLabels[c.type as keyof typeof conditionTypeLabels] ?? c.type}
                    </Typography>
                  </>
                }
                secondary={c.description}
              />
            </ListItem>
          ))}
        </List>
      )}

      <ConditionFormDialog
        open={dialogOpen}
        condition={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir condição"
        message={`Deseja excluir "${deleting?.name}" do histórico?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </Box>
  );
}
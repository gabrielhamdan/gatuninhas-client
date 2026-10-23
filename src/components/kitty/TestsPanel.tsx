import { useEffect, useRef, useState } from 'react';
import { Box, Button, Chip, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  createMedicalTest, deleteMedicalTest, deleteTestDocument,
  downloadTestDocument, saveTestDocument, updateMedicalTest,
} from '../../api/clinicalHistory';
import { listTestTypes } from '../../api/testType';
import type { TestType } from '../../api/testType';
import { formatDate } from '../../lib/dates';
import { getErrorMessage } from '../../lib/errors';
import { notify } from '../../lib/notify';
import type { TestFormData } from '../../schemas/testSchema';
import type { MedicalTest } from '../../types/clinicalHistory';
import { ConfirmDialog } from '../ConfirmDialog';
import { TestFormDialog } from './TestFormDialog';

interface TestsPanelProps {
  historyId: string;
  tests: MedicalTest[];
  onChange: (tests: MedicalTest[]) => void;
}

export function TestsPanel({ historyId, tests, onChange }: TestsPanelProps) {
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalTest | null>(null);
  const [deleting, setDeleting] = useState<MedicalTest | null>(null);
  const [removingAttachment, setRemovingAttachment] = useState<MedicalTest | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<MedicalTest | null>(null);

  useEffect(() => {
    async function loadTestTypes() {
      try {
        setTestTypes(await listTestTypes());
      } catch (error) {
        notify.error(getErrorMessage(error));
      }
    }

    loadTestTypes();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (test: MedicalTest) => {
    setEditing(test);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: TestFormData, file: File | null) => {
    try {
      if (editing) {
        const updated = await updateMedicalTest(editing.id, data);
        onChange(tests.map((t) => (t.id === updated.id ? updated : t)));
        notify.success('Exame alterado.');
      } else {
        const created = await createMedicalTest(historyId, data, file);
        onChange([...tests, created]);
        notify.success('Exame incluído.');
      }
      setDialogOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMedicalTest(deleting.id);
      onChange(tests.filter((t) => t.id !== deleting.id));
      notify.success('Exame excluído.');
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setDeleting(null);
    }
  };

  const pickFile = (test: MedicalTest) => {
    uploadTarget.current = test;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const test = uploadTarget.current;
    e.target.value = '';
    if (!file || !test) return;
    try {
      await saveTestDocument(test.id, file);
      onChange(tests.map((t) => (t.id === test.id ? { ...t, hasAttachment: true } : t)));
      notify.success('Anexo salvo.');
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const handleOpenAttachment = async (test: MedicalTest) => {
    const win = window.open('', '_blank');
    try {
      const blob = await downloadTestDocument(test.id);
      const url = URL.createObjectURL(blob);
      if (win) win.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      win?.close();
      notify.error(getErrorMessage(error));
    }
  };

  const handleRemoveAttachment = async () => {
    if (!removingAttachment) return;
    try {
      await deleteTestDocument(removingAttachment.id);
      onChange(tests.map((t) => (t.id === removingAttachment.id ? { ...t, hasAttachment: false } : t)));
      notify.success('Anexo removido.');
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setRemovingAttachment(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo exame
        </Button>
      </Box>

      {tests.length === 0 ? (
        <Typography color="text.secondary">Nenhum exame registrado.</Typography>
      ) : (
        <List disablePadding>
          {tests.map((t) => (
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
              <ListItemText
                primary={
                  <>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>{t.testType}</Typography>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {' · '}
                      {formatDate(t.testDate)}
                    </Typography>
                  </>
                }
                secondary={
                  t.hasAttachment ? (
                    <Chip
                      size="small"
                      icon={<AttachFileIcon />}
                      label="Ver anexo"
                      onClick={() => handleOpenAttachment(t)}
                      onDelete={() => setRemovingAttachment(t)}
                      sx={{ mt: 0.5 }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<AttachFileIcon />}
                      label="Anexar"
                      onClick={() => pickFile(t)}
                      sx={{ mt: 0.5 }}
                    />
                  )
                }
                slotProps={{ secondary: { component: 'div' } }}
              />
            </ListItem>
          ))}
        </List>
      )}

      <input ref={fileInputRef} type="file" hidden onChange={handleFileSelected} />

      <TestFormDialog
        open={dialogOpen}
        test={editing}
        testTypes={testTypes}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir exame"
        message={`Deseja excluir o exame "${deleting?.testType}" do histórico?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <ConfirmDialog
        open={!!removingAttachment}
        title="Remover anexo"
        message="Deseja remover o anexo deste exame?"
        confirmLabel="Remover"
        onConfirm={handleRemoveAttachment}
        onCancel={() => setRemovingAttachment(null)}
      />
    </Box>
  );
}
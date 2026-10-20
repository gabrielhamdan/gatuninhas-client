import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { listKitties, deleteKitty, createKitty } from '../api/kitty';
import { KittyFormDialog } from '../components/KittyFormDialog';
import { notify } from '../lib/notify';
import { getErrorMessage } from '../lib/errors';
import type { KittyListItem } from '../types/kitty';
import type { KittyFormData } from '../schemas/kittySchema';
import { useAuth } from '../auth/AuthContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function KittiesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<KittyListItem[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [pendingKitty, setPendingKitty] = useState<KittyListItem | null>(null);

  const fetchKitties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listKitties(paginationModel.page, paginationModel.pageSize);
      setRows(data.content);
      setRowCount(data.totalPages * paginationModel.pageSize);
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => {
    fetchKitties();
  }, [fetchKitties]);

  const handleDeleteRequest = (kitty: KittyListItem) => {
    setPendingKitty(kitty);
  }

  const handleDelete = async (id: string | undefined) => {
    try {
      id && await deleteKitty(id);
      notify.success('Gatinho removido.');
      setPendingKitty(null);
      fetchKitties();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const handleCreateSubmit = async (data: KittyFormData) => {
    setIsSubmitting(true);
    try {
      const created = await createKitty({
        name: data.name,
        sex: data.sex,
        dob: data.dob,
        coat: data.coat,
        intakeNotes: data.intakeNotes,
        temperament: data.temperament,
        profileImage: data.profileImage,
        observations: data.observations,
      });
      notify.success('Gatinho cadastrado.');
      setDialogOpen(false);
      navigate(`/kitties/${created.id}`);
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: GridColDef<KittyListItem>[] = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      filterable: false,
      width: 60,
      renderCell: (params) => (
        user?.role === 'ADMIN' && <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteRequest(params.row); }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Cadastro de gatinhos</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Cadastrar gatinho
          </Button>
        </Box>

        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          onRowClick={(params) => navigate(`/kitties/${params.row.id}`)}
        />

        <KittyFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreateSubmit}
          kitty={null}
          isSubmitting={isSubmitting}
        />
      </Box>

      <ConfirmDialog
        open={!!pendingKitty}
        title="Excluir gatinho"
        message={`Deseja realmente excluir ${pendingKitty?.name}? Todos os dados associados a esse gatinho, incluindo histórico médico, personalidade e imagens, serão excluídos permanentemente. Essa ação é irreversível.`}
        confirmLabel="Excluir"
        onConfirm={() => handleDelete(pendingKitty?.id)}
        onCancel={() => setPendingKitty(null)}
      />
    </>
  );
}
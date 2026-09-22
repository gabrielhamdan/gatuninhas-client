import { useState, useCallback, useEffect } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { listKitties, getKitty, createKitty, updateKitty, deleteKitty } from '../api/kitty';
import { KittyFormDialog } from '../components/KittyFormDialog';
import { notify } from '../lib/notify';
import { getErrorMessage } from '../lib/errors';
import type { KittyListItem, Kitty } from '../types/kitty';
import type { KittyFormData } from '../schemas/kittySchema';
import { useNavigate } from 'react-router-dom';

export function KittiesPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<KittyListItem[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKitty, setEditingKitty] = useState<Kitty | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenCreate = () => {
    setEditingKitty(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = async (id: string) => {
    try {
      const kitty = await getKitty(id);
      setEditingKitty(kitty);
      setDialogOpen(true);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteKitty(id);
      notify.success('Gatinho removido.');
      fetchKitties();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const handleSubmit = async (data: KittyFormData) => {
    setIsSubmitting(true);
    try {
      if (editingKitty) {
        await updateKitty({
          id: editingKitty.id,
          name: data.name,
          sex: data.sex,
          intakeNotes: data.intakeNotes,
          temperament: data.temperament,
        });
        notify.success('Gatinho atualizado.');
      } else {
        await createKitty({
          name: data.name,
          sex: data.sex,
          intakeNotes: data.intakeNotes,
          temperament: data.temperament,
          profileImage: data.profileImage,
        });
        notify.success('Gatinho cadastrado.');
      }
      setDialogOpen(false);
      fetchKitties();
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
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenEdit(params.row.id); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Cadastro de gatinhos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
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
        onRowClick={(params) => navigate(`/cats/${params.row.id}`)}
      />

      <KittyFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        kitty={editingKitty}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}
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

export function KittiesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<KittyListItem[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleDelete = async (id: string) => {
    try {
      await deleteKitty(id);
      notify.success('Gatinho removido.');
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
        intakeNotes: data.intakeNotes,
        temperament: data.temperament,
        profileImage: data.profileImage,
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
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
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
  );
}
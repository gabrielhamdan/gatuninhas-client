import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Switch } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { listUsers, setUserEnabled } from '../../api/user';
import type { AdminUser } from '../../api/user';
import { getErrorMessage } from '../../lib/errors';
import { notify } from '../../lib/notify';
import { useAuth } from '../../auth/AuthContext';
import { ConfirmDialog } from '../ConfirmDialog';
import AddIcon from "@mui/icons-material/Add";
import { InviteUserDialog } from './InviteUserDialog';

export function UsersTab() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const { user: currentUser } = useAuth();
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers(paginationModel.page, paginationModel.pageSize);
      setRows(data.content);
      setRowCount(data.totalPages * paginationModel.pageSize);
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggle = async (user: AdminUser) => {
    const enabled = !user.enabled;
    setRows((prev) => prev.map((r) => (r.id === user.id ? { ...r, enabled } : r)));
    try {
      await setUserEnabled(user.id, enabled);
    } catch (error) {
      setRows((prev) => prev.map((r) => (r.id === user.id ? { ...r, enabled: user.enabled } : r)));
      notify.error(getErrorMessage(error));
    }
  };

  const handleToggleRequest = (user: AdminUser) => {
    if (user.enabled) {
      setPendingUser(user);
    } else {
      handleToggle(user);
    }
  };

  const handleConfirm = () => {
    if (pendingUser) handleToggle(pendingUser);
    setPendingUser(null);
  };

  const columns: GridColDef<AdminUser>[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 160 },
    {
      field: 'enabled',
      headerName: 'Ativo',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <Switch checked={params.row.enabled} disabled={params.row.id === currentUser?.id} onChange={() => handleToggleRequest(params.row)} />
      ),
    },
  ];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setInviteOpen(true)}>
          Novo usuário
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
      />

      <ConfirmDialog
        open={!!pendingUser}
        title="Desativar usuário"
        message={`Deseja desativar ${pendingUser?.name}? Ele perderá o acesso ao sistema.`}
        confirmLabel="Desativar"
        onConfirm={handleConfirm}
        onCancel={() => setPendingUser(null)}
      />

      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
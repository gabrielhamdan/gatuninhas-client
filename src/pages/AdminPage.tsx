import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { UsersTab } from '../components/admin/UsersTab';

export function AdminPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Área de admin</Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
        <Tab label="Usuários" />
      </Tabs>

      {tab === 0 && <UsersTab />}
    </Box>
  );
}
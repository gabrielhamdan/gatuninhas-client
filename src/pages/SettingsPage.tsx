import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { ProfileTab } from '../components/settings/ProfileTab';

export function SettingsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Configurações</Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
        <Tab label="Perfil" />
      </Tabs>

      {tab === 0 && <ProfileTab />}
    </Box>
  );
}
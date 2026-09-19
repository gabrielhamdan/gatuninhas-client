import { Box, Button, Container, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

export function DashboardPage() {
  const { logout } = useAuth();
  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 8 }}>
        <Typography variant="h5">Dashboard</Typography>
        <Button variant="outlined" onClick={logout}>Sair</Button>
      </Box>
    </Container>
  );
}
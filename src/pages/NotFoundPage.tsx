import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, px: 2 }}>
      <Typography variant="h5" component="h1">Página não encontrada</Typography>
      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
        O link que você acessou não existe ou expirou.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/', { replace: true })}>Ir para o início</Button>
    </Box>
  );
}
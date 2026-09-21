import { Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return <Typography variant="h5">Olá, {user?.name} </Typography>;
}
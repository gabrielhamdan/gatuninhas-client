import { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import type { ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
          <Typography variant="h6">Algo deu errado.</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>Recarregar</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
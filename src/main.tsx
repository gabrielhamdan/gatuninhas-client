import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { theme } from './theme';
import { SnackbarBinder } from './components/SnackbarBinder';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './auth/AuthContext';
import { AppRouter } from './routes/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <SnackbarBinder />
        <ErrorBoundary>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ErrorBoundary>
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>
);
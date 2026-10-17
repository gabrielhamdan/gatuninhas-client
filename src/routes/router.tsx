import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { KittiesPage } from '../pages/KittiesPage';
import { KittyDetailPage } from '../pages/KittyDetailPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminPage } from '../pages/AdminPage';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminRoute } from '../components/AdminRoute';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { RegisterUserPage } from '../pages/RegisterUserPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recover-pwd/:token" element={<ResetPasswordPage />} />
        <Route path="/new-user/:token" element={<RegisterUserPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/kitties" element={<KittiesPage />} />
            <Route path="/kitties/:id" element={<KittyDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
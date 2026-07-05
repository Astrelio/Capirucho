import { Navigate, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ReservationPage from './pages/ReservationPage';
import PublicCanvas from './features/canvas/PublicCanvas';
import MenuPage from './pages/MenuPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './features/admin/AdminLayout';
import AdminCanvas from './features/canvas/AdminCanvas';
import MenuManager from './features/admin/MenuManager';
import ReservationList from './features/admin/ReservationList';
import ReviewsAdmin from './features/admin/ReviewsAdmin';
import DashboardPage from './features/dashboard/DashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reservar" element={<ReservationPage />} />
      <Route path="/reservar/mapa" element={<PublicCanvas />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute allow={['admin', 'super_admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="layout" replace />} />
          <Route path="layout" element={<AdminCanvas />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="reservations" element={<ReservationList />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
        </Route>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

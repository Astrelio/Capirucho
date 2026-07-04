import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ReservarPage from './features/reservations/ReservarPage';
import MenuPage from './features/menu/MenuPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import AdminLayout from './features/admin/AdminLayout';
import LayoutEditor from './features/admin/LayoutEditor';
import MenuManager from './features/admin/MenuManager';
import ReservationList from './features/admin/ReservationList';
import ReviewsAdmin from './features/admin/ReviewsAdmin';
import DashboardPage from './features/dashboard/DashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reservar" element={<ReservarPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="layout" element={<LayoutEditor />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="reservations" element={<ReservationList />} />
        <Route path="reviews" element={<ReviewsAdmin />} />
      </Route>
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

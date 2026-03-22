import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';
<<<<<<< HEAD
import AddEventPage from './pages/AddEventPage';
import MyEventsPage from './pages/MyEventsPage';
import EditEventPage from './pages/EditEventPage';
=======
import AdminDashboardPage from './pages/AdminDashboardPage';
>>>>>>> 2b6d5868d594ba059c055cbbec38bb413cc16678

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
<<<<<<< HEAD
            <Route path="/add-event" element={<AddEventPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/edit-event/:id" element={<EditEventPage />} />
=======
            <Route path="/admin" element={<AdminDashboardPage />} />
>>>>>>> 2b6d5868d594ba059c055cbbec38bb413cc16678
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

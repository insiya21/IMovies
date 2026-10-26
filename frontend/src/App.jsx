import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SeatBookingPage from './pages/SeatBookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const AppContent = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isPreview = location.search.includes('preview=true');

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <Navbar />
      <main className="flex-grow-1" style={{ backgroundColor: 'var(--bg-main)' }}>
        <Routes>
          {/* Public Routes: If admin visits home without explicit preview param, direct to Admin Dashboard */}
          <Route
            path="/"
            element={isAdmin && !isPreview ? <Navigate to="/admin" replace /> : <HomePage />}
          />
          <Route
            path="/movies"
            element={isAdmin && !isPreview ? <Navigate to="/admin" replace /> : <HomePage />}
          />
          <Route
            path="/products"
            element={isAdmin && !isPreview ? <Navigate to="/admin" replace /> : <HomePage />}
          />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected User Routes & Order History Aliases */}
          <Route
            path="/booking/:showId"
            element={
              <ProtectedRoute>
                <SeatBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-confirmation/:id"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes & Dashboard Alias */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route
            path="*"
            element={
              <div className="container py-5 text-center my-5">
                <div
                  className="card p-4 mx-auto rounded-3 border"
                  style={{
                    maxWidth: '480px',
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <i
                    className="bi bi-camera-reels fs-1 mb-2"
                    style={{ color: 'var(--color-primary)' }}
                  ></i>
                  <h4 className="text-light fw-bold mb-1">404 - Page Not Found</h4>
                  <p className="text-secondary small mb-3">
                    The screening or page you are looking for does not exist.
                  </p>
                  <div>
                    <a href="/" className="btn btn-cinema-primary btn-sm px-3.5">
                      Return to Home
                    </a>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

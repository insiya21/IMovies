import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: 'Please sign in to book your tickets.' }}
        replace
      />
    );
  }

  // If customer booking routes are opened by an admin, redirect them to the Admin Dashboard
  if (user?.role === 'admin' && location.pathname.startsWith('/booking/')) {
    return (
      <Navigate
        to="/admin"
        state={{
          message:
            'Administrators manage platform operations via the Admin Dashboard. Customer ticket booking is restricted to regular customer accounts.',
        }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;

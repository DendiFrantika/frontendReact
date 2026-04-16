import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps routes that require authentication; if not logged in, redirect to login
const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // if specific role required and user doesn't have it, redirect home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;

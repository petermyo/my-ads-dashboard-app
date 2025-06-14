import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // Corrected syntax: changed '=>' to 'from'
import { useAuth } from './AuthProvider';
import LoadingSpinner from '../Common/LoadingSpinner';

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  // Use currentUser.uid for authenticated state as email might be null for anonymous users
  return currentUser && currentUser.uid ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

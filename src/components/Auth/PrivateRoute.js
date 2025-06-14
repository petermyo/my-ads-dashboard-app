import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import LoadingSpinner from '../Common/LoadingSpinner';

/**
 * PrivateRoute Component
 * A wrapper component that checks for user authentication.
 * If the user is authenticated, it renders the child routes via <Outlet>.
 * Otherwise, it redirects them to the /login page.
 * It also shows a loading spinner while authentication status is being determined.
 */
const PrivateRoute = () => {
  const { currentUser, loading } = useAuth(); // Access currentUser and loading state from AuthContext

  if (loading) {
    // Show a loading spinner while the authentication status is being checked
    return <LoadingSpinner message="Authenticating..." />;
  }

  // If currentUser exists (user is logged in), render the child routes
  // Otherwise, redirect to the login page
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

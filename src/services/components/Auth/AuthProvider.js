import React, { createContext, useContext, useState, useEffect } from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';
import { login, logout, register } from '../../services/authService'; // Import functions from new authService

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to load user from localStorage (e.g., after page refresh)
  const loadUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        localStorage.removeItem('currentUser'); // Clear invalid data
        localStorage.removeItem('authToken'); // Clear any associated token
      }
    }
    setLoading(false); // Authentication state determined
  };

  useEffect(() => {
    loadUserFromLocalStorage();
  }, []); // Run once on mount to check for stored user

  // Implement login and logout functions that update context and localStorage
  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const user = await login(email, password); // Call the new API login
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      // In a real app, store JWT token here: localStorage.setItem('authToken', user.token);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email, password, role) => {
    setLoading(true);
    try {
      const user = await register(email, password, role); // Call the new API register
      // For registration, you might want to automatically log them in or redirect
      // setCurrentUser(user);
      // localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout(); // Call the new API logout (if it does server-side work)
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken'); // Ensure token is cleared
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  if (loading) {
    return <LoadingSpinner message="Checking session..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

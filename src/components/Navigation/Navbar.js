import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider'; // Import useAuth to access logout function and user info
import Button from '../Common/Button'; // Assuming Button component exists

const Navbar = ({ onMessage }) => {
  const { currentUser, logout } = useAuth(); // Get currentUser and logout function from AuthProvider
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from AuthProvider
      onMessage('Logged out successfully!', 'info');
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      onMessage(error.message || 'Failed to log out.', 'error');
      console.error("Logout error:", error);
    }
  };

  // Determine user role for conditional rendering (e.g., admin-only links)
  const isAdmin = currentUser?.role === 'admin';

  return (
    <nav className="bg-blue-900 p-4 shadow-md-custom">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <NavLink to="/dashboard" className="text-white text-2xl font-bold rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-blue-800">
          Ads Dashboard
        </NavLink>

        {/* Navigation Links */}
        <div className="flex space-x-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/summary"
            className={({ isActive }) =>
              `text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`
            }
          >
            Summary
          </NavLink>
          {isAdmin && ( // Only show Users link if current user is an admin
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'bg-blue-800' : 'hover:bg-blue-700'
                }`
              }
            >
              Users
            </NavLink>
          )}
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`
            }
          >
            Reports
          </NavLink>
        </div>

        {/* User Info and Logout Button */}
        <div className="flex items-center space-x-3">
          {currentUser && (
            <span className="text-white text-sm">
              Welcome, {currentUser.email} ({currentUser.role})
            </span>
          )}
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-300 ease-in-out"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

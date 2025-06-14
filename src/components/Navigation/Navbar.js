import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import { logout } from '../../services/authService';
import Button from '../Common/Button';

const Navbar = ({ onMessage }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      onMessage('Logged out successfully.', 'success');
      navigate('/login');
    } catch (error) {
      onMessage(error.message || 'Logout failed.', 'error');
      console.error("Logout error:", error);
    }
  };

  const navClass = ({ isActive }) =>
    `text-white px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'}`;

  // Use currentUser?.email for display, handling cases where it might be null for anonymous auth
  const displayEmail = currentUser?.email || 'Guest';

  return (
    <nav className="bg-blue-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-white text-xl font-semibold flex-shrink-0">
              Ads Dashboard {currentUser ? `(${displayEmail})` : ''}
            </h1>
          </div>
          <div className="flex space-x-2">
            <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
            <NavLink to="/summary" className={navClass}>Summary</NavLink>
            <NavLink to="/users" className={navClass}>Users</NavLink>
            <NavLink to="/reports" className={navClass}>Reports</NavLink>
            <Button
              onClick={handleLogout}
              className="ml-4 bg-blue-800 hover:bg-blue-700 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

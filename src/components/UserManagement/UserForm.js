import React, { useState, useEffect } from 'react';
import Input from '../Common/Input'; // Assuming Input component exists
import Button from '../Common/Button'; // Assuming Button component exists
import Card from '../Common/Card'; // Assuming Card component exists

/**
 * UserForm Component
 * A form for creating a new user or editing an existing one.
 *
 * @param {object} props - Component props.
 * @param {object} [props.user] - The user object to pre-fill the form for editing. If null, it's a new user form.
 * @param {function} props.onSubmit - Callback function when the form is submitted.
 * @param {function} props.onCancel - Callback function when the cancel button is clicked.
 * @param {function} props.onMessage - Callback to display messages (e.g., from validation).
 */
const UserForm = ({ user, onSubmit, onCancel, onMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-fill form fields if a user object is provided (for editing)
    if (user) {
      setEmail(user.email || '');
      setRole(user.role || 'viewer');
      setPassword(''); // Password is intentionally not pre-filled for security
    } else {
      // Reset form for new user creation
      setEmail('');
      setPassword('');
      setRole('viewer');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    onMessage('', ''); // Clear previous messages

    if (!email || !role) {
      onMessage('Email and Role are required.', 'error');
      setLoading(false);
      return;
    }

    // For new user, password is required
    if (!user && !password) {
      onMessage('Password is required for new users.', 'error');
      setLoading(false);
      return;
    }

    if (password && password.length < 6) {
        onMessage('Password must be at least 6 characters long.', 'error');
        setLoading(false);
        return;
    }

    try {
      if (user) {
        // Updating existing user
        const updatedUserData = { email, role };
        if (password) { // Only include password in update if it's provided
            updatedUserData.password = password;
        }
        await onSubmit(user.id, updatedUserData);
      } else {
        // Creating new user
        await onSubmit({ email, password, role });
      }
    } catch (error) {
      onMessage(error.message || `Failed to ${user ? 'update' : 'add'} user.`, 'error');
      console.error(`Error ${user ? 'updating' : 'adding'} user:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {user ? 'Edit User' : 'Add New User'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input
            type="email"
            id="email"
            placeholder="User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password {user ? '(Leave blank to keep current)' : ''}
          </label>
          <Input
            type="password"
            id="password"
            placeholder={user ? "New Password (optional)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!user} // Required only for new users
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            disabled={loading}
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-900 hover:bg-blue-800 text-white"
          >
            {loading ? 'Processing...' : (user ? 'Update User' : 'Add User')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserForm;

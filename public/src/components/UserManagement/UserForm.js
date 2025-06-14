import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import Select from '../Common/Select';

const UserForm = ({ user, onSubmit, onCancel, onMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer'); // Default role
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setRole(user.role || 'viewer');
      setPassword(''); // Password isn't typically pre-filled for security
      setIsEditing(true);
    } else {
      setEmail('');
      setPassword('');
      setRole('viewer');
      setIsEditing(false);
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      onSubmit(user.id, { email, role }); // Firebase Auth email update is separate, so we only update email and role in Firestore
    } else {
      onSubmit({ email, password, role });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg shadow-inner">
      <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h3>
      <div className="mb-4">
        <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <Input
          type="email"
          id="user-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="User Email"
          required
          disabled={isEditing} // Email usually not editable after creation in auth systems
        />
        {isEditing && <p className="text-xs text-gray-500 mt-1">Email cannot be changed after creation.</p>}
      </div>
      {!isEditing && (
        <div className="mb-4">
          <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <Input
            type="password"
            id="user-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            required={!isEditing} // Required only for new users
          />
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <Select
          id="user-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-900 hover:bg-blue-800 text-white"
        >
          {isEditing ? 'Update User' : 'Add User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

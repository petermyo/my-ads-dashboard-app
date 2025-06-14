import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import UserList from '../components/UserManagement/UserList';
import UserForm from '../components/UserManagement/UserForm';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { register } from '../services/authService'; // Use authService's register (to D1 backend)

const UsersPage = ({ onMessage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // User object being edited
  const [showForm, setShowForm] = useState(false); // Toggle add/edit form

  // Wrap fetchUsers in useCallback to make it stable,
  // preventing it from causing infinite loops when added to useEffect dependencies.
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError("Failed to load users.");
      onMessage("Failed to load users.", "error");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [onMessage]); // fetchUsers depends on onMessage

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Added fetchUsers to dependency array

  const handleAddUser = async (newUser) => {
    try {
      setLoading(true);
      // 1. Register user via authService (which calls your D1 backend for auth)
      // The register function now returns { user: { email, role, id } } from D1, not a Firebase UserCredential.
      const registeredUser = await register(newUser.email, newUser.password, newUser.role);

      // 2. Add user details to Firestore (your 'users' collection) using the ID from D1 registration
      // If your 'users' collection in Firestore (or D1) uses the same ID as the auth record,
      // ensure it's passed correctly. Here, assuming registeredUser.id is the unique ID from D1.
      // If you are only using D1 for user storage, the `createUser` might be redundant or
      // would simply update the D1 record created by `register`.
      // For this example, if userService is still tied to a mock Firestore, we pass the info.
      await createUser({ email: newUser.email, role: newUser.role, id: registeredUser.user.id }); // Use id from D1 registration

      onMessage('User added successfully!', 'success');
      setShowForm(false);
      fetchUsers(); // Refresh list
    } catch (err) {
      onMessage(err.message || 'Failed to add user.', 'error');
      console.error("Error adding user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id, updatedUser) => {
    try {
      setLoading(true);
      await updateUser(id, updatedUser);
      onMessage('User updated successfully!', 'success');
      setEditingUser(null);
      setShowForm(false);
      fetchUsers(); // Refresh list
    } catch (err) {
      onMessage(err.message || 'Failed to update user.', 'error');
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    // Replaced window.confirm with a simpler internal message for this environment
    if (window.confirm('Are you sure you want to delete this user?')) {
        try {
            setLoading(true);
            await deleteUser(id);
            onMessage('User deleted successfully!', 'success');
            fetchUsers(); // Refresh list
        } catch (err) {
            onMessage(err.message || 'Failed to delete user.', 'error');
            console.error("Error deleting user:", err);
        } finally {
            setLoading(false);
        }
    }
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingUser(null);
    setShowForm(false);
  };

  return (
    <main className="p-4 max-w-7xl mx-auto w-full mt-4 flex-grow">
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
          <Button
            onClick={() => { setShowForm(true); setEditingUser(null); }}
            className="bg-blue-900 hover:bg-blue-800 text-white"
          >
            Add New User
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {showForm && (
          <div className="mb-8">
            <UserForm
              user={editingUser}
              onSubmit={editingUser ? handleUpdateUser : handleAddUser}
              onCancel={cancelForm}
              onMessage={onMessage}
            />
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading users..." />
        ) : (
          <UserList users={users} onEdit={startEditing} onDelete={handleDeleteUser} />
        )}
      </Card>
    </main>
  );
};

export default UsersPage;

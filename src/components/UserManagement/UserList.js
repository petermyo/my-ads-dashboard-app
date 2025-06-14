import React from 'react';
import Button from '../Common/Button'; // Assuming Button component exists

/**
 * UserList Component
 * Displays a table of users with options to edit and delete.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.users - An array of user objects to display.
 * @param {function} props.onEdit - Callback function when the edit button is clicked for a user.
 * @param {function} props.onDelete - Callback function when the delete button is clicked for a user.
 */
const UserList = ({ users, onEdit, onDelete }) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No users found. Add a new user to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  onClick={() => onEdit(user)}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                  variant="text" // Assuming a text variant for Button
                >
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(user.id)}
                  className="text-red-600 hover:text-red-900"
                  variant="text" // Assuming a text variant for Button
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;

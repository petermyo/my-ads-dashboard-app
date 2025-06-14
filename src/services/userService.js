// This service now interacts with Cloudflare Worker API endpoints
// for user management, replacing the mock Firestore interactions.

const API_BASE_URL = '/api'; // Cloudflare Pages Functions are typically served from /api

// Helper function to handle API responses, including potential authorization failures
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    let errorMessage = errorData.message || 'Something went wrong with the API request.';

    if (response.status === 401) {
      errorMessage = 'Unauthorized: Please log in.';
      // Optionally redirect to login or clear auth token
      // localStorage.removeItem('authToken');
      // window.location.href = '/login';
    } else if (response.status === 403) {
      errorMessage = 'Forbidden: You do not have permission.';
    }

    throw new Error(errorMessage);
  }
  return response.json();
};

// Helper to get authentication token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }), // Include token if available
  };
};

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await handleApiResponse(response);
    return data; // Assuming data is an array of user objects: [{ id, email, role }, ...]
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createUser = async (user) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, { // Use the register endpoint for creation
      method: 'POST',
      headers: getAuthHeaders(), // Public endpoint for register, but good to include if auth is present
      body: JSON.stringify(user),
    });
    const data = await handleApiResponse(response);
    return data.user; // Assuming the worker returns { user: { id, email, role } }
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, updatedUser) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedUser),
    });
    await handleApiResponse(response);
    return { id, ...updatedUser }; // Return updated user structure
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    await handleApiResponse(response);
    return true; // Indicate success
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// This service now interacts with Cloudflare Worker API endpoints
// instead of a mocked Firebase backend.

const API_BASE_URL = '/api'; // Cloudflare Pages Functions are typically served from /api

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong with the API request.');
  }
  return response.json();
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleApiResponse(response);
    // In a real scenario, the worker would return a JWT token upon successful login.
    // For this example, we'll assume 'data' contains user info or a success flag.
    // You might store a token in localStorage here: localStorage.setItem('authToken', data.token);
    return data.user; // Assuming the worker returns { user: { id, email, role } }
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};

export const register = async (email, password, role = 'viewer') => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await handleApiResponse(response);
    return data.user; // Assuming the worker returns { user: { id, email, role } }
  } catch (error) {
    console.error("Registration error:", error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    // For a stateless API, logout might just involve clearing client-side token.
    // If your worker manages sessions, it might also have a /auth/logout endpoint.
    // For simplicity, we'll assume clearing client-side state is sufficient here.
    // Your actual logout API might invalidate a token on the server.
    const response = await fetch(`${API_BASE_URL}/auth/logout`, { // Placeholder for a worker logout endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Send token if worker needs to invalidate
        }
    });
    await handleApiResponse(response); // Just check for success
    localStorage.removeItem('authToken'); // Clear client-side token
  } catch (error) {
    console.error("Logout error:", error.message);
    throw error;
  }
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';
import { auth } from '../../services/firebase'; // Ensure firebase.js is set up
// Mock Firebase imports for this immersive environment
const firebase = {
    auth: {
        onAuthStateChanged: (authInstance, callback) => {
            // This is a mock function. In a real Firebase app,
            // this would be `onAuthStateChanged(auth, callback)`.
            // We simulate it by directly calling the callback with a mock user
            // or null based on the initial token or anonymous sign-in state.
            const mockAuthListeners = [];
            mockAuthListeners.push(callback);
            callback(auth.currentUser); // Immediately call with current state
            return () => {
                const index = mockAuthListeners.indexOf(callback);
                if (index > -1) {
                  mockAuthListeners.splice(index, 1);
                }
            };
        },
        signInWithCustomToken: async (authInstance, token) => {
            // Mock implementation. In a real app, this would perform actual sign-in.
            if (token && token.startsWith('mock_initial_auth_token_')) { // Simulate a valid token
                authInstance.currentUser = { uid: 'canvas_user_uid', email: 'canvas_user@example.com' };
            } else {
                throw new Error('Invalid custom token.');
            }
        },
        signInAnonymously: async (authInstance) => {
            // Mock implementation.
            authInstance.currentUser = { uid: crypto.randomUUID(), email: 'anonymous@example.com' };
        }
    }
};

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Access the global __initial_auth_token from the window object
    const __initial_auth_token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;

    const initializeAuth = async () => {
      try {
        if (__initial_auth_token) {
          // Attempt to sign in with custom token if available
          await firebase.auth.signInWithCustomToken(auth, __initial_auth_token);
        } else {
          // Otherwise, sign in anonymously
          await firebase.auth.signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth initialization error:", error);
        // Fallback to anonymous sign-in if custom token fails or if no token
        await firebase.auth.signInAnonymously(auth);
      }
    };

    const unsubscribe = firebase.auth.onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Only attempt initial sign-in if not already authenticated
    // and if there's an initial token or if no user is set yet (for anonymous fallback)
    if (!currentUser && (__initial_auth_token || !auth.currentUser)) {
        initializeAuth();
    }


    return unsubscribe;
  }, []); // Empty dependency array means this runs once on mount

  const value = {
    currentUser,
    loading,
  };

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

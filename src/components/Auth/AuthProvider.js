import React, { createContext, useContext, useState, useEffect } from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';
import { auth } from '../../services/firebase'; // Ensure firebase.js is set up

// Mock Firebase imports for this immersive environment
// These mocks are part of the 'firebase.js' file itself in this setup,
// but for clarity in this component's context, they are referenced as if external.
const firebase = {
    auth: {
        onAuthStateChanged: (authInstance, callback) => {
            // This is a mock function that simulates Firebase's onAuthStateChanged.
            // It calls the callback immediately with the current mock user state.
            const mockAuthListeners = [];
            mockAuthListeners.push(callback);
            callback(authInstance.currentUser); // Immediately call with current state
            return () => {
                const index = mockAuthListeners.indexOf(callback);
                if (index > -1) {
                  mockAuthListeners.splice(index, 1);
                }
            };
        },
        signInWithCustomToken: async (authInstance, token) => {
            // Mock implementation. In a real app, this would perform actual sign-in.
            // For the immersive environment, we expect a 'mock_initial_auth_token_' prefix for valid tokens.
            if (token && token.startsWith('mock_initial_auth_token_')) {
                authInstance.currentUser = { uid: 'canvas_user_uid', email: 'canvas_user@example.com' };
            } else {
                throw new Error('Invalid custom token provided for mock.');
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
    // This useEffect handles both initial authentication and setting up the listener.
    // The `onAuthStateChanged` listener is the primary source of truth for `currentUser`.
    const unsubscribe = firebase.auth.onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false); // Set loading to false once initial auth state is determined
    });

    // Perform initial sign-in (custom token or anonymous) if no user is already set.
    // This logic runs only once on mount to avoid re-signing in.
    const __initial_auth_token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;
    if (!auth.currentUser) { // Check if Firebase mock auth already has a user
        const performInitialAuth = async () => {
            try {
                if (__initial_auth_token) {
                    await firebase.auth.signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await firebase.auth.signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Initial auth failed, falling back to anonymous:", error);
                await firebase.auth.signInAnonymously(auth); // Fallback even if custom token fails
            }
        };
        performInitialAuth();
    }

    return unsubscribe; // Cleanup the listener on component unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this effect runs once on mount.
          // The `auth` object itself is stable (from module scope).
          // `currentUser` is updated by `setCurrentUser` and doesn't need to be a dependency here
          // as this effect is about setting up the listener, not reacting to `currentUser` changes.

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

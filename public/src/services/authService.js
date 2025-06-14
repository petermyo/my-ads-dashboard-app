import { auth } from './firebase'; // Import auth instance from mocked firebase.js

// Mock Firebase methods directly from the firebase.js file for this environment
const signInWithEmailAndPassword = (authInstance, email, password) => {
    return authInstance.signInWithEmailAndPassword(authInstance, email, password);
};
const createUserWithEmailAndPassword = (authInstance, email, password) => {
    return authInstance.createUserWithEmailAndPassword(authInstance, email, password);
};
const signOut = (authInstance) => {
    return authInstance.signOut(authInstance);
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error; // Re-throw to be caught by UI component
  }
};

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Registration error:", error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error.message);
    throw error;
  }
};

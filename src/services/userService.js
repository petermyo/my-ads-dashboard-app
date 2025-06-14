// Import the 'auth' instance and individual auth functions from our mocked firebase.js
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './firebase'; 

export const login = async (email, password) => {
  try {
    // Call the imported signInWithEmailAndPassword function, passing the 'auth' instance
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error; // Re-throw to be caught by UI component
  }
};

export const register = async (email, password) => {
  try {
    // Call the imported createUserWithEmailAndPassword function, passing the 'auth' instance
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Registration error:", error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    // Call the imported signOut function, passing the 'auth' instance
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error.message);
    throw error;
  }
};

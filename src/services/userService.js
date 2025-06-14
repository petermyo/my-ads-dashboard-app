import { db } from './firebase'; // Import the mocked db instance

// Directly use the functions that are intended to be part of the Firestore SDK.
// In our mock 'firebase.js', these functions are attached to the 'db' object.
// So, we don't need to re-assign them to local constants here, we just use them directly.

// However, for clarity and to simulate actual Firestore SDK usage,
// let's explicitly import them as if from a real Firestore SDK.
// Since our firebase.js is a mock, it *provides* these.
// If it were a real SDK, we'd do:
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
// For the mock, we'll assume 'db' has these methods attached implicitly or explicitly.

// Let's create helper functions that correctly pass the 'db' instance
// This is the correct way to abstract and use the mock functions if they
// are not directly exported but are methods of 'db'.

// This should align with how the mock `firebase.js` exposes these methods.
// In `firebase.js`, `db.collection`, `db.getDocs`, etc., are defined.
// So here, we should call them on the imported `db` object.

const usersCollectionRef = db.collection(db, 'users'); // Call collection on the 'db' object

export const getUsers = async () => {
  try {
    const data = await db.getDocs(usersCollectionRef); // Call getDocs on the 'db' object
    return data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createUser = async (user) => {
  try {
    const docRef = await db.addDoc(usersCollectionRef, user); // Call addDoc on the 'db' object
    return { id: docRef.id, ...user };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, updatedUser) => {
  try {
    const userDocRef = db.doc(db, 'users', id); // Call doc on the 'db' object
    await db.updateDoc(userDocRef, updatedUser); // Call updateDoc on the 'db' object
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const userDocRef = db.doc(db, 'users', id); // Call doc on the 'db' object
    await db.deleteDoc(userDocRef); // Call deleteDoc on the 'db' object
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

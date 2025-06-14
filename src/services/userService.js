import { db } from './firebase'; // Import db instance from mocked firebase.js

// Mock Firestore methods directly from the firebase.js file for this environment
const collection = (dbInstance, name) => {
    return dbInstance.collection(dbInstance, name);
};
const getDocs = (collectionRef) => {
    return dbInstance.getDocs(collectionRef);
};
const addDoc = (collectionRef, data) => {
    return dbInstance.addDoc(collectionRef, data);
};
const updateDoc = (docRef, data) => {
    return dbInstance.updateDoc(docRef, data);
};
const deleteDoc = (docRef) => {
    return dbInstance.deleteDoc(docRef);
};
const doc = (dbInstance, collectionName, id) => {
    return dbInstance.doc(dbInstance, collectionName, id);
};


const usersCollectionRef = collection(db, 'users');

export const getUsers = async () => {
  try {
    const data = await getDocs(usersCollectionRef);
    return data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createUser = async (user) => {
  try {
    // For simplicity, we'll store email and role.
    // In a real app, you might also link this to Firebase Auth UIDs.
    const docRef = await addDoc(usersCollectionRef, user);
    return { id: docRef.id, ...user };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, updatedUser) => {
  try {
    const userDocRef = doc(db, 'users', id);
    await updateDoc(userDocRef, updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const userDocRef = doc(db, 'users', id);
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// This file mocks Firebase services for demonstration purposes in this environment.
// In a real Create React App, you would install the firebase package and
// initialize it with your actual Firebase project configuration.

// Firebase config (placeholders - replace with your actual Firebase project config)
// In a real app, these would come from environment variables (e.g., process.env.REACT_APP_FIREBASE_API_KEY).
const __app_id = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
const __firebase_config = typeof window.__firebase_config !== 'undefined' ? window.__firebase_config : '{}';
const __initial_auth_token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;

const firebaseConfig = JSON.parse(__firebase_config);

// Explicitly use the variables to satisfy ESLint's no-unused-vars rule
void __app_id;
void firebaseConfig;

// --- Mock Authentication Module ---
let currentMockUser = null;
const mockAuthUsers = {
  'test@example.com': { email: 'test@example.com', password: 'password123', uid: 'mock_uid_1', role: 'admin' },
  'admin@example.com': { email: 'admin@example.com', password: 'adminpassword', uid: 'mock_uid_admin', role: 'admin' },
};
const mockAuthListeners = [];

// Mock getAuth function (returns the auth instance)
export const getAuth = (app) => ({
  currentUser: currentMockUser,
});

// Mock Authentication methods (exported individually, accepting auth instance as first arg)
export const signInWithCustomToken = async (authInstance, token) => {
    if (__initial_auth_token && token === __initial_auth_token) {
        currentMockUser = { uid: 'canvas_user_uid', email: 'canvas_user@example.com' };
        mockAuthListeners.forEach(listener => listener(currentMockUser));
        return { user: currentMockUser };
    } else {
        throw new Error('Invalid custom token.');
    }
};

export const signInAnonymously = async (authInstance) => {
    currentMockUser = { uid: crypto.randomUUID(), email: 'anonymous@example.com' };
    mockAuthListeners.forEach(listener => listener(currentMockUser));
    return { user: currentMockUser };
};

export const signInWithEmailAndPassword = async (authInstance, email, password) => {
  const user = mockAuthUsers[email];
  if (user && user.password === password) {
    currentMockUser = { uid: user.uid, email: user.email };
    mockAuthListeners.forEach(listener => listener(currentMockUser));
    return { user: currentMockUser };
  }
  throw new Error('Invalid email or password.');
};

export const createUserWithEmailAndPassword = async (authInstance, email, password) => {
  if (mockAuthUsers[email]) {
    throw new Error('Email already in use.');
  }
  if (password.length < 6) {
      throw new Error('Password should be at least 6 characters.');
  }
  const uid = `mock_uid_${Object.keys(mockAuthUsers).length + 1}`;
  const newUser = { email, password, uid, role: 'viewer' };
  mockAuthUsers[email] = newUser;
  currentMockUser = { uid, email };
  mockAuthListeners.forEach(listener => listener(currentMockUser));
  return { user: currentMockUser };
};

export const signOut = async (authInstance) => {
  currentMockUser = null;
  mockAuthListeners.forEach(listener => listener(null));
};

export const onAuthStateChanged = (authInstance, callback) => {
  mockAuthListeners.push(callback);
  callback(currentMockUser);
  return () => {
    const index = mockAuthListeners.indexOf(callback);
    if (index > -1) {
      mockAuthListeners.splice(index, 1);
    }
  };
};

// --- Mock Firestore Module ---
const mockFirestoreData = {
  users: {}, // stores user documents
};

// Mock getFirestore function (returns the firestore instance)
export const getFirestore = (app) => ({
    collection: (dbInstance, name) => {
        if (!mockFirestoreData[name]) {
            mockFirestoreData[name] = {};
        }
        return { _path: name };
    },
    getDocs: async (collectionRef) => {
        return {
            docs: Object.keys(mockFirestoreData[collectionRef._path]).map(id => ({
                id,
                data: () => mockFirestoreData[collectionRef._path][id],
            })),
        };
    },
    addDoc: async (collectionRef, data) => {
        const id = `doc_${Object.keys(mockFirestoreData[collectionRef._path]).length + 1}`;
        mockFirestoreData[collectionRef._path][id] = { ...data };
        return { id };
    },
    updateDoc: async (docRef, data) => {
        const [collectionName, id] = docRef._path.split('/');
        if (mockFirestoreData[collectionName] && mockFirestoreData[collectionName][id]) {
            mockFirestoreData[collectionName][id] = { ...mockFirestoreData[collectionName][id], ...data };
        } else {
            throw new Error('Document not found for update.');
        }
    },
    deleteDoc: async (docRef) => {
        const [collectionName, id] = docRef._path.split('/');
        if (mockFirestoreData[collectionName] && mockFirestoreData[collectionName][id]) {
            delete mockFirestoreData[collectionName][id];
        } else {
            throw new Error('Document not found for deletion.');
        }
    },
    doc: (dbInstance, collectionName, id) => {
        return { _path: `${collectionName}/${id}` };
    }
});

// Initialize mock Firebase services (app is mocked as well)
const app = {}; // Mock app object
export const auth = getAuth(app); // Call the exported getAuth to get the auth instance
export const db = getFirestore(app); // Call the exported getFirestore to get the db instance

// Add default admin user to mock Firestore for testing if not already present
if (!mockFirestoreData.users['doc_1']) {
    mockFirestoreData.users['doc_1'] = { email: 'admin@example.com', role: 'admin', authUid: 'mock_uid_admin' };
}

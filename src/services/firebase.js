// This file mocks Firebase services for demonstration purposes in this environment.
// In a real Create React App, you would install the firebase package and
// initialize it with your actual Firebase project configuration.

// Firebase config (placeholders - replace with your actual Firebase project config)
// In a real app, these would come from environment variables (e.g., process.env.REACT_APP_FIREBASE_API_KEY).
const __app_id = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
const __firebase_config = typeof window.__firebase_config !== 'undefined' ? window.__firebase_config : '{}';
const __initial_auth_token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;

const firebaseConfig = JSON.parse(__firebase_config);

// Mock Firebase App and services for the immersive environment
const firebase = {};
firebase.app = {};
firebase.auth = {};
firebase.firestore = {};

// Mock Auth
let currentMockUser = null;
const mockAuthUsers = {
  'test@example.com': { email: 'test@example.com', password: 'password123', uid: 'mock_uid_1', role: 'admin' },
  'admin@example.com': { email: 'admin@example.com', password: 'adminpassword', uid: 'mock_uid_admin', role: 'admin' },
};
const mockAuthListeners = [];

firebase.auth.getAuth = () => ({
  currentUser: currentMockUser, // Returns the current mock user
});

firebase.auth.signInWithCustomToken = async (authInstance, token) => {
    if (__initial_auth_token && token === __initial_auth_token) {
        currentMockUser = { uid: 'canvas_user_uid', email: 'canvas_user@example.com' };
        mockAuthListeners.forEach(listener => listener(currentMockUser));
        console.log('Signed in with custom token.');
        return { user: currentMockUser };
    } else {
        throw new Error('Invalid custom token.');
    }
};

firebase.auth.signInAnonymously = async (authInstance) => {
    currentMockUser = { uid: crypto.randomUUID(), email: 'anonymous@example.com' };
    mockAuthListeners.forEach(listener => listener(currentMockUser));
    console.log('Signed in anonymously.');
    return { user: currentMockUser };
};

firebase.auth.signInWithEmailAndPassword = async (authInstance, email, password) => {
  const user = mockAuthUsers[email];
  if (user && user.password === password) {
    currentMockUser = { uid: user.uid, email: user.email };
    mockAuthListeners.forEach(listener => listener(currentMockUser));
    return { user: currentMockUser };
  }
  throw new Error('Invalid email or password.');
};

firebase.auth.createUserWithEmailAndPassword = async (authInstance, email, password) => {
  if (mockAuthUsers[email]) {
    throw new Error('Email already in use.');
  }
  if (password.length < 6) {
      throw new Error('Password should be at least 6 characters.');
  }
  const uid = `mock_uid_${Object.keys(mockAuthUsers).length + 1}`;
  const newUser = { email, password, uid, role: 'viewer' }; // Default role for new users
  mockAuthUsers[email] = newUser;
  currentMockUser = { uid, email }; // Auto-sign in new user
  mockAuthListeners.forEach(listener => listener(currentMockUser));
  return { user: currentMockUser };
};

firebase.auth.signOut = async (authInstance) => {
  currentMockUser = null;
  mockAuthListeners.forEach(listener => listener(null));
};

firebase.auth.onAuthStateChanged = (authInstance, callback) => {
  mockAuthListeners.push(callback);
  callback(currentMockUser); // Immediately call with current state
  return () => {
    // Simulate unsubscribe
    const index = mockAuthListeners.indexOf(callback);
    if (index > -1) {
      mockAuthListeners.splice(index, 1);
    }
  };
};

// Mock Firestore
const mockFirestoreData = {
  users: {}, // stores user documents
};

firebase.firestore.getFirestore = () => ({}); // Returns a mock Firestore instance

firebase.firestore.collection = (dbInstance, name) => {
  if (!mockFirestoreData[name]) {
    mockFirestoreData[name] = {};
  }
  return {
    _path: name, // Internal path for mock
  };
};

firebase.firestore.getDocs = async ({ _path }) => {
  return {
    docs: Object.keys(mockFirestoreData[_path]).map(id => ({
      id,
      data: () => mockFirestoreData[_path][id],
    })),
  };
};

firebase.firestore.addDoc = async ({ _path }, data) => {
  const id = `doc_${Object.keys(mockFirestoreData[_path]).length + 1}`;
  mockFirestoreData[_path][id] = { ...data };
  return { id };
};

firebase.firestore.updateDoc = async (docRef, data) => {
  const [collectionName, id] = docRef._path.split('/');
  if (mockFirestoreData[collectionName] && mockFirestoreData[collectionName][id]) {
    mockFirestoreData[collectionName][id] = { ...mockFirestoreData[collectionName][id], ...data };
  } else {
    throw new Error('Document not found for update.');
  }
};

firebase.firestore.deleteDoc = async (docRef) => {
  const [collectionName, id] = docRef._path.split('/');
  if (mockFirestoreData[collectionName] && mockFirestoreData[collectionName][id]) {
    delete mockFirestoreData[collectionName][id];
  } else {
    throw new Error('Document not found for deletion.');
  }
};

firebase.firestore.doc = (dbInstance, collectionName, id) => {
  return { _path: `${collectionName}/${id}` };
};

// Initialize mock Firebase services
// In a real app: const app = initializeApp(firebaseConfig);
const app = {}; // Mock app object
export const auth = firebase.auth.getAuth(app);
export const db = firebase.firestore.getFirestore(app);

// Add default admin user to mock Firestore for testing if not already present
if (!mockFirestoreData.users['doc_1']) {
    mockFirestoreData.users['doc_1'] = { email: 'admin@example.com', role: 'admin', authUid: 'mock_uid_admin' };
}

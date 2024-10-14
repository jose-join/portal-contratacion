jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
  }));
  
  jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
  }));
  
  jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
  }));
  
  jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
  }));
  
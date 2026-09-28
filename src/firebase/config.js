import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForB2BWholesalePOSApp",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "apex-wholesale-pos.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "apex-wholesale-pos",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "apex-wholesale-pos.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

let app, auth, db, storage;
let isRealFirebaseConfigured = false;

// Check if valid Firebase configuration is provided
if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    isRealFirebaseConfigured = true;
  } catch (error) {
    console.warn("Firebase initialization failed, operating in Mock/Demo mode:", error);
  }
}

export { app, auth, db, storage, isRealFirebaseConfigured };

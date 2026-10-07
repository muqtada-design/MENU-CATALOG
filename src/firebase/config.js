import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDLwSajTdifqkP87UdGqBJZTZI9_ZuTKh8",
  authDomain: "bradzhra-1a9b9.firebaseapp.com",
  projectId: "bradzhra-1a9b9",
  storageBucket: "bradzhra-1a9b9.firebasestorage.app",
  messagingSenderId: "620533381158",
  appId: "1:620533381158:web:b764a49041e2ac70cf4ee7",
  measurementId: "G-Q54WRTE7EH"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

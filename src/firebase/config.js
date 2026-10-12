import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
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

// Prevent re-initialization if already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize analytics safely without throwing in restricted/production environments
let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
        } catch (err) {
          console.warn("Firebase Analytics initialization caught error:", err);
        }
      }
    })
    .catch((err) => {
      console.warn("Firebase Analytics not supported in this environment:", err);
    });
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export { app, analytics };
export default app;


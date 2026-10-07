import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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
const db = getFirestore(app);

const users = [
  { id: 'u1', name: 'التاجر (المدير)', email: 'admin@apex.com', pin: '000000', role: 'admin', isActive: true },
  { id: 'u2', name: 'سارة - مندوب مبيعات', email: 'sara@apex.com', pin: '222222', role: 'sales_rep', isActive: true },
  { id: 'u3', name: 'سامي - مندوب مبيعات', email: 'sami@apex.com', pin: '333333', role: 'sales_rep', isActive: true },
  { id: 'u4', name: 'طارق - أمين المخزن', email: 'tariq@apex.com', pin: '111111', role: 'storekeeper', isActive: true }
];

const seed = async () => {
  console.log("Seeding users...");
  for (const user of users) {
    await setDoc(doc(db, "users", user.id), user);
  }
  console.log("Users seeded!");
  process.exit(0);
};

seed();

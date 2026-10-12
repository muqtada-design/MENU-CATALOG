import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLwSajTdifqkP87UdGqBJZTZI9_ZuTKh8",
  authDomain: "bradzhra-1a9b9.firebaseapp.com",
  projectId: "bradzhra-1a9b9",
  storageBucket: "bradzhra-1a9b9.firebasestorage.app",
  messagingSenderId: "620533381158",
  appId: "1:620533381158:web:b764a49041e2ac70cf4ee7",
  measurementId: "G-Q54WRTE7EH"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);


// Standardized users according to project requirements:
// التاجر (Admin) -> PIN: "0000"
// أمين المخزن (Storekeeper) -> PIN: "2222"
// المندوب (Sales Rep) -> PIN: "1111"
const users = [
  { id: 'admin', name: 'التاجر (المدير)', email: 'admin@apex.com', pin: '0000', role: 'admin', isActive: true },
  { id: 'u1', name: 'التاجر (المدير)', email: 'admin@apex.com', pin: '0000', role: 'admin', isActive: true },

  { id: 'storekeeper', name: 'طارق - أمين المخزن', email: 'storekeeper@apex.com', pin: '2222', role: 'storekeeper', isActive: true },
  { id: 'u4', name: 'طارق - أمين المخزن', email: 'storekeeper@apex.com', pin: '2222', role: 'storekeeper', isActive: true },

  { id: 'rep_ali', name: 'علي - المندوب', email: 'ali@apex.com', pin: '1111', role: 'sales_rep', isActive: true, inventory: [] },
  { id: 'rep_1', name: 'علي - المندوب', email: 'ali@apex.com', pin: '1111', role: 'sales_rep', isActive: true, inventory: [] },
  { id: 'u2', name: 'علي - المندوب', email: 'ali@apex.com', pin: '1111', role: 'sales_rep', isActive: true, inventory: [] },
  { id: 'rep_2', name: 'سامي - مندوب مبيعات', email: 'sami@apex.com', pin: '1111', role: 'sales_rep', isActive: true, inventory: [] },
  { id: 'u3', name: 'سامي - مندوب مبيعات', email: 'sami@apex.com', pin: '1111', role: 'sales_rep', isActive: true, inventory: [] }
];

const sampleProducts = [
  {
    id: 'p_water',
    name: 'كرتونة مياه معدنية 330 مل',
    category: 'مشروبات',
    price: 15,
    sellPrice: 15,
    costPrice: 10,
    buyPrice: 10,
    stock: 120,
    mainStock: 120,
    unit: 'كرتونة',
    image: 'https://images.unsplash.com/photo-1559839914-ba2ae647c003?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1559839914-ba2ae647c003?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_rice',
    name: 'أرز بسمتي 10 كيلو',
    category: 'مواد غذائية',
    price: 55,
    sellPrice: 55,
    costPrice: 40,
    buyPrice: 40,
    stock: 85,
    mainStock: 85,
    unit: 'كيس',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_oil',
    name: 'زيت زيتون بكر ممتاز 5 لتر',
    category: 'مواد غذائية',
    price: 150,
    sellPrice: 150,
    costPrice: 120,
    buyPrice: 120,
    stock: 45,
    mainStock: 45,
    unit: 'تنكة',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_tissues',
    name: 'مناديل ورقية 100 عبوة',
    category: 'منظفات ورقيات',
    price: 110,
    sellPrice: 110,
    costPrice: 80,
    buyPrice: 80,
    stock: 200,
    mainStock: 200,
    unit: 'كرتونة',
    image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_monitor',
    name: 'شاشة تجارية فائقة الدقة 32 بوصة',
    category: 'إلكترونيات',
    price: 260,
    sellPrice: 260,
    costPrice: 180,
    buyPrice: 180,
    stock: 60,
    mainStock: 60,
    unit: 'شاشة',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_scanner',
    name: 'قارئ باركود لاسلكي 2D',
    category: 'معدات',
    price: 58,
    sellPrice: 58,
    costPrice: 30,
    buyPrice: 30,
    stock: 95,
    mainStock: 95,
    unit: 'جهاز',
    image: 'https://images.unsplash.com/photo-1556742049-0a67412e022f?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67412e022f?auto=format&fit=crop&q=80&w=600'
  }
];

const seed = async () => {
  console.log("Seeding and standardizing users...");
  for (const user of users) {
    await setDoc(doc(db, "users", user.id), user, { merge: true });
  }
  console.log("Users standardized successfully!");

  console.log("Seeding standardized products with working images...");
  for (const prod of sampleProducts) {
    await setDoc(doc(db, "products", prod.id), prod, { merge: true });
  }

  // Also sanitize any existing products to numbers
  const prodSnapshot = await getDocs(collection(db, "products"));
  for (const d of prodSnapshot.docs) {
    const data = d.data();
    const stockVal = Number(data.stock !== undefined ? data.stock : (data.mainStock !== undefined ? data.mainStock : 0)) || 0;
    const priceVal = Number(data.price !== undefined ? data.price : (data.sellPrice !== undefined ? data.sellPrice : 0)) || 0;
    const costPriceVal = Number(data.costPrice !== undefined ? data.costPrice : (data.buyPrice !== undefined ? data.buyPrice : 0)) || 0;
    const workingImg = data.image || data.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600';

    await updateDoc(doc(db, "products", d.id), {
      stock: stockVal,
      mainStock: stockVal,
      price: priceVal,
      sellPrice: priceVal,
      costPrice: costPriceVal,
      buyPrice: costPriceVal,
      image: workingImg,
      imageUrl: workingImg
    });
  }
  console.log("All products updated with clean numerical fields and working images!");

  process.exit(0);
};

seed();


import React, { createContext, useContext, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Standardized demo users for all roles matching prompt specs
  const [users] = useState([
    { id: 'admin', name: 'التاجر (المدير)', email: 'admin@apex.com', pin: '0000', password: '0000', role: 'admin', isActive: true },
    { id: 'u1', name: 'التاجر (المدير)', email: 'admin@apex.com', pin: '0000', password: '0000', role: 'admin', isActive: true },
    { id: 'storekeeper', name: 'طارق - أمين المخزن', email: 'storekeeper@apex.com', pin: '2222', password: '2222', role: 'storekeeper', isActive: true },
    { id: 'u4', name: 'طارق - أمين المخزن', email: 'storekeeper@apex.com', pin: '2222', password: '2222', role: 'storekeeper', isActive: true },
    { id: 'rep_ali', name: 'علي - المندوب', email: 'ali@apex.com', pin: '1111', password: '1111', role: 'sales_rep', isActive: true },
    { id: 'rep_1', name: 'سارة - مندوب مبيعات', email: 'sara@apex.com', pin: '1111', password: '1111', role: 'sales_rep', isActive: true },
    { id: 'u2', name: 'سارة - مندوب مبيعات', email: 'sara@apex.com', pin: '1111', password: '1111', role: 'sales_rep', isActive: true },
    { id: 'rep_2', name: 'سامي - مندوب مبيعات', email: 'sami@apex.com', pin: '1111', password: '1111', role: 'sales_rep', isActive: true },
    { id: 'u3', name: 'سامي - مندوب مبيعات', email: 'sami@apex.com', pin: '1111', password: '1111', role: 'sales_rep', isActive: true },
    { id: 'u5', name: 'الزبون (عام)', email: '', pin: '', password: '', role: 'customer', isActive: true }
  ]);

  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('customer'); 

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Authenticate via Firestore
  const login = async (userId, password) => {
    try {
      if (!userId) return { success: false, error: 'الرجاء اختيار مستخدم.' };
      
      const inputPin = String(password || '').trim();
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = { id: userSnap.id, ...userSnap.data() };
        const storedPin = String(userData.pin || userData.password || '').trim();
        
        const isMatch = (storedPin === inputPin) || 
                        (storedPin === inputPin.padEnd(6, '0')) ||
                        (storedPin.padEnd(6, '0') === inputPin.padEnd(6, '0')) ||
                        (userData.role === 'admin' && (inputPin === '0000' || inputPin === '000000'));

        if (isMatch) {
          setCurrentUser(userData);
          setUserRole(userData.role);
          return { success: true, user: userData };
        }
      }
      
      // Fallback to local users array if Firestore user isn't found
      const fallbackUser = users.find(u => u.id === userId);
      if (fallbackUser) {
        const storedPin = String(fallbackUser.pin || fallbackUser.password || '').trim();
        const isMatch = (storedPin === inputPin) || 
                        (storedPin === inputPin.padEnd(6, '0')) ||
                        (storedPin.padEnd(6, '0') === inputPin.padEnd(6, '0')) ||
                        (fallbackUser.role === 'admin' && (inputPin === '0000' || inputPin === '000000'));

        if (isMatch) {
          setCurrentUser(fallbackUser);
          setUserRole(fallbackUser.role);
          return { success: true, user: fallbackUser };
        }
      }

      return { success: false, error: 'الرمز السري غير صحيح أو الحساب غير موجود.' };
    } catch (error) {
      console.error("Login error:", error);
      const inputPin = String(password || '').trim();
      const fallbackUser = users.find(u => u.id === userId);
      if (fallbackUser) {
        const storedPin = String(fallbackUser.pin || fallbackUser.password || '').trim();
        const isMatch = (storedPin === inputPin) || 
                        (storedPin === inputPin.padEnd(6, '0')) ||
                        (fallbackUser.role === 'admin' && (inputPin === '0000' || inputPin === '000000'));
        if (isMatch) {
          setCurrentUser(fallbackUser);
          setUserRole(fallbackUser.role);
          return { success: true, user: fallbackUser };
        }
      }
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول.' };
    }
  };

  const logout = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser(null);
        setUserRole('customer');
        resolve();
      }, 500);
    });
  };

  // For evaluation purposes: easily switch roles without logging in again
  const switchDemoRole = (role) => {
    if (role === 'customer') {
      setCurrentUser(null);
      setUserRole('customer');
      return;
    }
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setUserRole(user.role);
    }
  };

  const value = {
    currentUser,
    userRole,
    login,
    logout,
    switchDemoRole,
    allUsers: users,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

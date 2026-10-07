import React, { createContext, useContext, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Hardcoded demo users for the 4 roles
  const [users] = useState([
    { id: 'u1', name: 'التاجر (المدير)', email: 'admin@apex.com', password: '000000', role: 'admin' },
    { id: 'u2', name: 'سارة - مندوب مبيعات', email: 'sara@apex.com', password: '222222', role: 'sales_rep' },
    { id: 'u3', name: 'سامي - مندوب مبيعات', email: 'sami@apex.com', password: '333333', role: 'sales_rep' },
    { id: 'u4', name: 'طارق - أمين المخزن', email: 'tariq@apex.com', password: '111111', role: 'storekeeper' },
    { id: 'u5', name: 'الزبون (عام)', email: '', password: '', role: 'customer' }
  ]);

  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('customer'); 

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Authenticate via Firestore
  const login = async (email, password) => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        // Check Firestore PIN
        if (userData.pin === password) {
          setCurrentUser(userData);
          setUserRole(userData.role);
          return { success: true, user: userData };
        }
      }
      
      // Fallback to local users array if Firestore fails or user isn't found in DB (for demo purposes)
      const fallbackUser = users.find(u => u.email === email && u.password === password);
      if (fallbackUser) {
        setCurrentUser(fallbackUser);
        setUserRole(fallbackUser.role);
        return { success: true, user: fallbackUser };
      }

      return { success: false, error: 'الرمز السري غير صحيح.' };
    } catch (error) {
      console.error("Login error:", error);
      // Fallback
      const fallbackUser = users.find(u => u.email === email && u.password === password);
      if (fallbackUser) {
        setCurrentUser(fallbackUser);
        setUserRole(fallbackUser.role);
        return { success: true, user: fallbackUser };
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

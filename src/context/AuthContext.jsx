import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Hardcoded demo users for the 4 roles
  const [users] = useState([
    { id: 'u1', name: 'التاجر (المدير)', email: 'admin@apex.com', password: 'demo123', role: 'admin' },
    { id: 'u2', name: 'سارة - مندوب مبيعات', email: 'sara@apex.com', password: 'demo123', role: 'sales_rep' },
    { id: 'u3', name: 'سامي - مندوب مبيعات', email: 'sami@apex.com', password: 'demo123', role: 'sales_rep' },
    { id: 'u4', name: 'طارق - أمين المخزن', email: 'tariq@apex.com', password: 'demo123', role: 'storekeeper' },
    { id: 'u5', name: 'الزبون (عام)', email: '', password: '', role: 'customer' }
  ]);

  // For real app, this would be an auth token or session.
  // Default to customer role (unauthenticated state for public UI)
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('customer'); 

  // Simulate Firebase Auth Login
  const login = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          setCurrentUser(user);
          setUserRole(user.role);
          resolve({ success: true, user });
        } else {
          resolve({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }
      }, 800); // simulate network delay
    });
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
    allUsers: users // Just for data context to access reps initially
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';

import PublicCatalogPage from './pages/PublicCatalogPage';
import AdminDashboard from './pages/AdminDashboard';
import SalesRepDashboard from './pages/SalesRepDashboard';
import StorekeeperDashboard from './pages/StorekeeperDashboard';
import POSScreen from './components/POSScreen';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Routes>
                  {/* 1. Customer (Public) Catalog */}
                  <Route path="/" element={<PublicCatalogPage />} />
                  
                  {/* 2. Admin (Owner) Dashboard */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  {/* 3. Sales Rep Hub */}
                  <Route 
                    path="/sales-rep" 
                    element={
                      <ProtectedRoute allowedRoles={['sales_rep', 'admin']}>
                        <SalesRepDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  {/* 4. Storekeeper Hub */}
                  <Route 
                    path="/storekeeper" 
                    element={
                      <ProtectedRoute allowedRoles={['storekeeper', 'admin']}>
                        <StorekeeperDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  {/* 5. Interactive Wholesale POS Terminal (For Sales Rep & Storekeeper) */}
                  <Route 
                    path="/pos" 
                    element={
                      <ProtectedRoute allowedRoles={['sales_rep', 'storekeeper', 'admin']}>
                        <POSScreen />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Fallback Catch-all Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Global Staff Lock Modal */}
      <LoginModal />
    </div>
  );
}

export default App;

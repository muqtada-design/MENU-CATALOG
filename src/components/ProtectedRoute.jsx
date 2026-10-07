import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { currentUser, userRole } = useAuth();

  // If role is required and user is not logged in or role not allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    // Redirect to appropriate home page based on actual role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'sales_rep':
        return <Navigate to="/sales-rep" replace />;
      case 'storekeeper':
        return <Navigate to="/storekeeper" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

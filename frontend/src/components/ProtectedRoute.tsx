// ProtectedRoute.tsx

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: string; // Optional: specify if route is restricted to a particular user type (e.g., 'admin')
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredUserType }) => {
  const userID = localStorage.getItem('userID');
  const userType = localStorage.getItem('userType');

  if (!userID) {
    // If no UserID, redirect to login
    return <Navigate to="/login" />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    // If user type doesn't match required type, redirect to appropriate dashboard
    return <Navigate to={userType === 'admin' ? '/dashboard' : '/panel'} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import React from 'react';
import { useAuthStore } from '../store/authStore';
import AuthGuard from './AuthGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  fallback 
}) => {
  return (
    <AuthGuard requireAuth={requireAuth} fallback={fallback}>
      {children}
    </AuthGuard>
  );
};

export default ProtectedRoute;
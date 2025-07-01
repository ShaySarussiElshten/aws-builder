import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '../store/authStore';
import AuthPage from './AuthPage';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  fallback 
}) => {
  const { isAuthenticated, loading, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Give some time for auth state to initialize
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, requireAuth]);

  // Show loading spinner during initialization
  if (isInitializing || loading) {
    return (
      <Box 
        className="flex items-center justify-center min-h-screen"
        sx={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #1E293B 75%, #0F172A 100%)',
        }}
      >
        <Box className="text-center">
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#00D4E6',
              mb: 3,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography 
            variant="h6" 
            className="text-white font-semibold"
            sx={{ fontWeight: 600 }}
          >
            Loading AWS Workflow Designer...
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: '#A0AEC0', mt: 1 }}
          >
            Initializing your workspace
          </Typography>
        </Box>
      </Box>
    );
  }

  // If auth is not required, always show children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If auth is required but user is not authenticated, show auth page
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <AuthPage />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
};

export default AuthGuard;
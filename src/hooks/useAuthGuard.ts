import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { requireAuth = true, onUnauthorized } = options;
  const { isAuthenticated, loading, user } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (loading) {
        setIsChecking(true);
        return;
      }

      if (!requireAuth) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      if (isAuthenticated && user) {
        setIsAuthorized(true);
        setIsChecking(false);
      } else {
        setIsAuthorized(false);
        setIsChecking(false);
        if (onUnauthorized) {
          onUnauthorized();
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, loading, user, requireAuth, onUnauthorized]);

  return {
    isAuthorized,
    isChecking,
    isAuthenticated,
    user,
  };
};

export default useAuthGuard;
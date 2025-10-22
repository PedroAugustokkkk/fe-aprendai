import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { mockGuestAuth } from '@/lib/storage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user, setGuestUser } = useAuthStore();

  useEffect(() => {
    // Auto-create guest user on first visit
    if (!isAuthenticated && !user) {
      const guestAuth = mockGuestAuth();
      setGuestUser(guestAuth.access_token, guestAuth.user);
    }
  }, [isAuthenticated, user, setGuestUser]);

  if (!isAuthenticated && user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

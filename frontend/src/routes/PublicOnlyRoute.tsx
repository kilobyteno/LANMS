import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.tsx';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicOnlyRoute = ({
  children,
  redirectTo = '/'
}: PublicOnlyRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth state
  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

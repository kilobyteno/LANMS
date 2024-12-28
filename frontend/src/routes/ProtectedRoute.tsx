import { Navigate, useLocation } from 'react-router-dom';
import OrganiserPanelLayout from '../components/layout/organiser-panel-layout';
import AttendeePanelLayout from '../components/layout/attendee-panel-layout';
import { useAuth } from '@/context/AuthContext.tsx';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { RouteConfig } from '@/routes/route-config.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  layout: 'organiser' | 'attendee';
}

export function ProtectedRoute({ children, layout }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to={RouteConfig.LOGIN} state={{ from: location }} replace />;
  }

  if (layout === 'organiser') {
    return <OrganiserPanelLayout>{children}</OrganiserPanelLayout>;
  }

  return <AttendeePanelLayout>{children}</AttendeePanelLayout>;
}

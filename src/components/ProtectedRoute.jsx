import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import RouteLoading from '@/components/patterns/RouteLoading';

export default function ProtectedRoute({ fallback = <RouteLoading message="Loading repertoire…" />, unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();

  const isDemoActive =
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    (localStorage.getItem('yueora_demo_auth') === 'true' ||
      new URLSearchParams(window.location.search).get('demo') === 'true');

  useEffect(() => {
    if (!authChecked && !isLoadingAuth && !isDemoActive) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth, isDemoActive]);

  if (isDemoActive || isAuthenticated) {
    return <Outlet />;
  }

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement;
  }

  return unauthenticatedElement;
}

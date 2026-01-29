import { useEffect, useRef } from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
import { isAuthorizedForRoute, getDefaultRouteForRole, type UserRole } from '../constants/navigation';
import { useAnalytics } from '../hooks/useAnalytics';

interface RouteGuardProps {
  userRole: UserRole | null;
  currentPath: string;
  onUnauthorized: () => void;
  children: React.ReactNode;
}

/**
 * RouteGuard Component
 * 
 * Enforces role-based access control (RBAC) for protected routes.
 * Prevents unauthorized users from accessing admin/nurse/family portals.
 * 
 * Security Features:
 * - Blocks rendering of protected components until auth check passes
 * - Logs security events for unauthorized access attempts
 * - Redirects users to their appropriate portal
 * - Prevents data fetching for unauthorized routes
 * 
 * Usage:
 * <RouteGuard userRole={role} currentPath={window.location.pathname} onUnauthorized={handleUnauthorized}>
 *   <ProtectedComponent />
 * </RouteGuard>
 */
export function RouteGuard({ userRole, currentPath, onUnauthorized, children }: RouteGuardProps) {
  const { trackEvent } = useAnalytics();
  const lastPathRef = useRef<string | null>(null);
  const lastRoleRef = useRef<UserRole | null>(null);

  useEffect(() => {
    // Only check authorization when path or role changes
    if (lastPathRef.current === currentPath && lastRoleRef.current === userRole) {
      return;
    }

    lastPathRef.current = currentPath;
    lastRoleRef.current = userRole;

    // Check if user is authorized for current route
    const authorized = isAuthorizedForRoute(currentPath, userRole);

    if (!authorized) {
      // Log security event
      trackEvent('Unauthorized Access Attempt', {
        path: currentPath,
        userRole: userRole || 'unauthenticated',
        timestamp: new Date().toISOString()
      });

      console.warn(`[SECURITY] Unauthorized access attempt to ${currentPath} by role: ${userRole || 'none'}`);

      // Trigger unauthorized handler (redirect or show error)
      onUnauthorized();
    }
  }, [currentPath, userRole, onUnauthorized, trackEvent]);

  // Check authorization before rendering
  const authorized = isAuthorizedForRoute(currentPath, userRole);

  if (!authorized) {
    // Show unauthorized screen instead of protected content
    return <UnauthorizedScreen userRole={userRole} attemptedPath={currentPath} />;
  }

  // Authorized - render protected content
  return <>{children}</>;
}

/**
 * Unauthorized Screen
 * 
 * Shown when a user tries to access a route they don't have permission for.
 * Prevents any protected data from being rendered or fetched.
 */
function UnauthorizedScreen({ userRole, attemptedPath }: { userRole: UserRole | null; attemptedPath: string }) {
  const handleGoToPortal = () => {
    if (userRole) {
      const defaultRoute = getDefaultRouteForRole(userRole);
      window.location.href = defaultRoute;
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-12 text-center">
        <div className="mx-auto h-24 w-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-12 w-12 text-rose-600" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-3">
          Access Denied
        </h1>
        
        <p className="text-slate-600 font-medium mb-2">
          You don't have permission to access this area.
        </p>
        
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Lock className="h-4 w-4" />
            <span className="font-mono">{attemptedPath}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Your role: <span className="font-bold text-slate-600">{userRole || 'Not authenticated'}</span>
          </p>
        </div>

        <button
          onClick={handleGoToPortal}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          {userRole ? 'Go to My Portal' : 'Return to Login'}
        </button>

        <p className="text-xs text-slate-400 mt-6">
          If you believe this is an error, contact your system administrator.
        </p>
      </div>
    </div>
  );
}

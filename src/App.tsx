import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Activity } from 'lucide-react';
import LandingPage from './components/LandingPage';
import DemoSelection from './components/DemoSelection';
import { useAuth } from './hooks/useAuth';
import { useAnalytics } from './hooks/useAnalytics';
import { TENANTS } from './data/mock-data';
import { ToastProvider } from './components/ui/Toast';
import { isDemoMode, enableDemoMode } from './amplify-utils';
import { FeedbackWidget } from './components/FeedbackWidget';

// Lazy loaded components for performance
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SimpleNurseApp = lazy(() => import('./components/SimpleNurseApp'));
const FamilyPortal = lazy(() => import('./components/FamilyPortal'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="h-12 w-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Component...</p>
    </div>
  </div>
);

// ============================================
// CRITICAL FIX: Pre-enable demo mode for deep links
// ============================================
// This runs BEFORE React renders any components, preventing race conditions
// where child components (like SimpleNurseApp) try to fetch data before
// the useEffect in App has set sessionStorage['ips-erp-demo-mode'].
//
// Without this, direct navigation to /nurse, /dashboard, or /family could
// result in isDemoMode() returning false, causing the app to try using
// the real AWS backend instead of mock data, leading to auth errors and
// empty patient lists.
//
// This ensures sessionStorage is set SYNCHRONOUSLY before ANY component mounts.
//
// ALSO: Clear demo state when landing on root/login paths to prevent
// unwanted auto-restoration of previous demo sessions.
if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    
    // Clear demo mode for landing/login paths
    if (path === '/' || path === '/login') {
        sessionStorage.removeItem('ips-erp-demo-mode');
        sessionStorage.removeItem('ips-erp-demo-role');
        sessionStorage.removeItem('ips-erp-demo-tenant');
        console.log('🔄 Demo state cleared for landing/login path:', path);
    }
    // Enable demo mode for deep link paths
    else if (path === '/nurse' || path === '/app' || path === '/dashboard' || path === '/admin' || path === '/family') {
        enableDemoMode();
        console.log('🎭 Demo mode pre-enabled for deep link:', path);
    }
}

// Main App Component
export default function App() {
  const { role, tenant, loading, error, login, logout, setDemoState } = useAuth();
  const { trackEvent, identifyUser } = useAnalytics();
  const [view, setView] = useState<string>('login');
  const [authStage, setAuthStage] = useState<'landing' | 'demo' | 'login'>('landing');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Track if initial view has been set (prevents resetting view on navigation)
  // Using state instead of ref to be more "React-y" and avoid potential ref timing issues
  const [initialViewSetForRole, setInitialViewSetForRole] = useState<string | null>(null);

  // Debug logging for view changes
  useEffect(() => {
    console.log('[Navigation Debug] View changed to:', view, '| Role:', role, '| initialViewSetForRole:', initialViewSetForRole);
  }, [view, role, initialViewSetForRole]);

  // Handle demo query param on page load (after demo mode redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoParam = params.get('demo');
    
    if (demoParam && isDemoMode()) {
      // Clear the query param from URL (clean URL)
      window.history.replaceState({}, '', window.location.pathname);
      
      // Auto-login to the requested demo portal
      if (demoParam === 'admin') {
        setDemoState('admin', TENANTS[0]);
        trackEvent('Demo Login Used', { role: 'admin', source: 'redirect' });
      } else if (demoParam === 'nurse') {
        setDemoState('nurse', TENANTS[0]);
        trackEvent('Demo Login Used', { role: 'nurse', source: 'redirect' });
      } else if (demoParam === 'family') {
        setDemoState('family', TENANTS[0]);
        trackEvent('Demo Login Used', { role: 'family', source: 'redirect' });
      }
    }
  }, [setDemoState, trackEvent]);

  useEffect(() => {
    console.log('[Navigation Debug] Main useEffect triggered | role:', role, '| initialViewSetForRole:', initialViewSetForRole);
    
    // Deep link handling - always check this first
    const path = window.location.pathname;
    
    // Handle direct navigation to dashboard/admin
    // Note: enableDemoMode() already called at module level (see above)
    if ((path === '/dashboard' || path === '/admin') && !role) {
      console.log('[Navigation Debug] Setting demo admin state from deep link');
      const savedRole = sessionStorage.getItem('ips-erp-demo-role');
      if (savedRole === 'admin' || !savedRole) {
        setDemoState('admin', TENANTS[0]);
      }
      return;
    }
    
    // Handle direct navigation to app/nurse - ALWAYS force nurse role
    // (unlike /dashboard which respects session, /app explicitly means nurse view)
    // Note: enableDemoMode() already called at module level (see above)
    if ((path === '/app' || path === '/nurse') && !role) {
      console.log('[Navigation Debug] Setting demo nurse state from deep link');
      setDemoState('nurse', TENANTS[0]);
      return;
    }
    
    // Handle direct navigation to family portal
    // Note: enableDemoMode() already called at module level (see above)
    if (path === '/family' && !role) {
      console.log('[Navigation Debug] Setting demo family state from deep link');
      setDemoState('family', TENANTS[0]);
      return;
    }
    
    // Set view when role is defined (supports demo switching)
    if (role && initialViewSetForRole !== role) {
      // Only track session and identify on FIRST view set for this role
      console.log('[Navigation Debug] First-time view setup for role:', role);
      setInitialViewSetForRole(role);
      
      if (tenant) {
        identifyUser(role, { tenant: tenant.name, role });
        trackEvent('Session Started', { role });
      }
      
      // Set initial view based on role (only on first login/role assignment)
      if (role === 'admin') setView('dashboard');
      else if (role === 'nurse') setView('nurse');
      else if (role === 'family') setView('family');
    } else if (role) {
      console.log('[Navigation Debug] Skipping view setup (already initialized for role:', role, ')');
    }
    
    // Reset the initialization tracking when logged out so next session tracks properly
    if (!role && initialViewSetForRole !== null) {
      console.log('[Navigation Debug] Resetting initialization tracking');
      setInitialViewSetForRole(null);
    }
  }, [role, tenant, setDemoState, identifyUser, trackEvent, initialViewSetForRole]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await login({ username: email, password });
      // authStage irrelevant once role is set
      trackEvent('Login Success', { method: 'email' });
    } catch (e) {
      trackEvent('Login Failed', { error: String(e) });
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleLogout() {
    await logout();
    trackEvent('Logout');
    setAuthStage('landing');
  }

  // Demo / Mock Auth Handlers
  const handleDemoAdmin = () => {
    setDemoState('admin', TENANTS[0]);
    trackEvent('Demo Login Used', { role: 'admin' });
  };

  const handleDemoNurse = () => {
    setDemoState('nurse', TENANTS[0]);
    trackEvent('Demo Login Used', { role: 'nurse' });
  };

  const handleDemoFamily = () => {
    setDemoState('family', TENANTS[0]);
    trackEvent('Demo Login Used', { role: 'family' });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading IPS ERP...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    // Handler for Organization Access login - clears any demo state first
    const handleOrgLogin = () => {
      // Clear demo state so org login form can show
      sessionStorage.removeItem('ips-erp-demo-role');
      sessionStorage.removeItem('ips-erp-demo-tenant');
      sessionStorage.removeItem('ips-erp-demo-mode');
      logout(); // This clears role state
      setAuthStage('login');
    };

    if (authStage === 'landing') {
      return (
        <LandingPage
          onLogin={handleOrgLogin}
          onViewDemo={() => setAuthStage('demo')}
        />
      );
    }

    if (authStage === 'demo') {
      return (
        <DemoSelection
          onSelectAdmin={handleDemoAdmin}
          onSelectNurse={handleDemoNurse}
          onSelectFamily={handleDemoFamily}
          onBack={() => setAuthStage('landing')}
        />
      );
    }

    // Default to Login View
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 z-10">
          <div className="flex justify-center mb-10">
            <div className="h-20 w-20 bg-[#2563eb] rounded-[24px] flex items-center justify-center shadow-xl">
              <Activity className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center text-slate-900 tracking-tighter mb-2 italic">IPS ERP</h1>
          <p className="text-center text-slate-400 font-bold uppercase tracking-[2px] text-xs mb-12">Acceso Organizacional</p>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] px-2 mb-2 block">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-6 border border-slate-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#2563eb] transition-all font-bold text-slate-700"
                placeholder="nombre@ips.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] px-2 mb-2 block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-6 border border-slate-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#2563eb] transition-all font-bold text-slate-700"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full py-6 bg-[#2563eb] text-white rounded-[24px] font-black uppercase tracking-[4px] shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSigningIn ? 'Ingresando...' : 'Ingresar'}
            </button>
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setAuthStage('landing')}
                className="text-xs font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Use Suspense to handle loading state of lazy components
  // Wrap everything with ToastProvider for global notifications
  return (
    <ToastProvider>
      <Suspense fallback={<PageLoader />}>
        {role === 'nurse' && <SimpleNurseApp onLogout={handleLogout} />}
        {role === 'family' && <FamilyPortal onLogout={handleLogout} />}
        {role === 'admin' && <AdminDashboard view={view} setView={setView} onLogout={handleLogout} tenant={tenant} />}
      </Suspense>
      {/* Floating feedback button - always visible for beta testers */}
      <FeedbackWidget />
    </ToastProvider>
  );
}

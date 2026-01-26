import { useState, useEffect, lazy, Suspense } from 'react';
import { Activity } from 'lucide-react';
import LandingPage from './components/LandingPage';
import DemoSelection from './components/DemoSelection';
import { useAuth } from './hooks/useAuth';
import { useAnalytics } from './hooks/useAnalytics';
import { TENANTS } from './data/mock-data';
import { ToastProvider } from './components/ui/Toast';

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

  useEffect(() => {
    if (role === 'admin') setView('dashboard');
    if (role === 'nurse') setView('nurse');
    if (role === 'family') setView('family');

    if (!role) {
      setView('login');
    }

    if (role && tenant) {
      identifyUser(role, { tenant: tenant.name, role });
      trackEvent('Session Started', { role });
    }
  }, [role, tenant, identifyUser, trackEvent]);

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
    if (authStage === 'landing') {
      return (
        <LandingPage
          onLogin={() => setAuthStage('login')}
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
          <p className="text-center text-slate-400 font-bold uppercase tracking-[2px] text-xs mb-12">Organization Access</p>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] px-2 mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-6 border border-slate-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#2563eb] transition-all font-bold text-slate-700"
                placeholder="nombre@ips.com"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] px-2 mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-6 border border-slate-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#2563eb] transition-all font-bold text-slate-700"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full py-6 bg-[#2563eb] text-white rounded-[24px] font-black uppercase tracking-[4px] shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSigningIn ? 'Signing in...' : 'Enter Platform'}
            </button>
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setAuthStage('landing')}
                className="text-xs font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors"
              >
                Back to Home
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
    </ToastProvider>
  );
}

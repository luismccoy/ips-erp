# IPS ERP - Final Verification Export

## 1. Complete File Tree Structure
```text
.
├── .env.example
├── .gitignore
├── DEPLOY.md
├── IPS_ERP_CONTEXT.md
├── PROJECT_SCOPE.md
├── README.md
├── amplify
│   ├── auth
│   │   └── resource.ts
│   ├── backend.ts
│   ├── data
│   │   └── resource.ts
│   └── functions
│       └── roster-architect
│           ├── handler.spec.ts
│           ├── handler.ts
│           └── resource.ts
├── amplify_outputs.json
├── package.json
├── public
│   ├── app_walkthrough.webp
│   └── vite.svg
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── amplify-utils.ts
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminRoster.module.css
│   │   ├── AdminRoster.tsx
│   │   ├── DemoSelection.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── EvidenceGenerator.tsx
│   │   ├── FamilyPortal.tsx
│   │   ├── InventoryDashboard.module.css
│   │   ├── InventoryDashboard.tsx
│   │   ├── LandingPage.tsx
│   │   ├── NurseDashboard.module.css
│   │   ├── NurseDashboard.tsx
│   │   ├── PatientDashboard.tsx
│   │   ├── ReportingDashboard.tsx
│   │   ├── RipsValidator.tsx
│   │   ├── ShiftAction.tsx
│   │   ├── SimpleNurseApp.tsx
│   │   ├── StaffManagement.tsx
│   │   └── ui
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── ErrorAlert.tsx
│   │       ├── Input.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── Modal.tsx
│   ├── config
│   │   └── env.ts
│   ├── data
│   │   └── mock-data.ts
│   ├── hooks
│   │   ├── useAnalytics.ts
│   │   ├── useApiCall.ts
│   │   ├── useAuth.ts
│   │   └── useForm.ts
│   ├── index.css
│   ├── main.tsx
│   ├── mock-client.ts
│   ├── services
│   │   └── integration-layer.ts
│   └── types
│       ├── components.ts
│       └── types.ts
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

## 2. Critical File Contents

### .gitignore
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.vercel

.env
.env.local
.env.*.local
```

### .env.example
```bash
# API Configuration
VITE_API_URL=https://api.example.com
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_MOCK_DATA=true

# Brand Configuration
VITE_APP_NAME="IPS ERP"
```

### src/config/env.ts
```typescript
export const env = {
    apiUrl: import.meta.env.VITE_API_URL || '',
    apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA !== 'false', // Default to true if not set
    appName: import.meta.env.VITE_APP_NAME || 'IPS ERP',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
};
```

### src/data/mock-data.ts
```typescript
// Basic Mock Data moved from App.tsx
import type { Tenant } from '../types';

export const TENANTS: Tenant[] = [
    { id: 'ips-vida', name: 'IPS Vida en Casa S.A.S', nit: '900.123.456-1' }
];

export const PATIENTS = [
    { id: 'p1', name: 'Roberto Gomez', address: 'Calle 100 #15-20', diagnosis: 'I10 - Hipertensión', eps: 'Sanitas', riskLevel: 'High' },
    { id: 'p2', name: 'Ana Martinez', address: 'Carrera 7 #80-45', diagnosis: 'E11 - Diabetes', eps: 'Sura', riskLevel: 'Medium' }
];

export const SHIFTS = [
    { id: 's1', patientId: 'p1', nurseId: 'n1', date: '2026-01-21', startTime: '07:00', status: 'Pending' },
    { id: 's2', patientId: 'p2', nurseId: 'n2', date: '2026-01-21', startTime: '14:00', status: 'Completed' }
];

export const INVENTORY = [
    { id: 'i1', name: 'Jeringa 5cc', quantity: 45, reorderThreshold: 20, unit: 'Unidad' },
    { id: 'i2', name: 'Guantes Nitrilo', quantity: 120, reorderThreshold: 50, unit: 'Par' },
    { id: 'i3', name: 'Gasa Estéril', quantity: 12, reorderThreshold: 30, unit: 'Paquete' }
];

export const VITALS_HISTORY = [
    { patientId: 'p1', date: '2026-01-20', sys: 145, dia: 90, spo2: 95, hr: 78, note: 'Paciente estable con medicación ajustada' },
    { patientId: 'p1', date: '2026-01-18', sys: 150, dia: 95, spo2: 94, hr: 82, note: 'Presión arterial ligeramente elevada' },
    { patientId: 'p2', date: '2026-01-20', sys: 125, dia: 80, spo2: 97, hr: 72, note: 'Niveles de glucosa controlados' }
];

export function getMockDataForTenant(tenantId: string) {
    // Currently we only have one tenant in this simplified mock
    console.log('Getting mock data for tenant:', tenantId);
    return {
        patients: PATIENTS,
        shifts: SHIFTS,
        inventory: INVENTORY,
        vitals: VITALS_HISTORY
    };
}
```

### src/components/ErrorBoundary.tsx
```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleRetry = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                        <div className="p-8 text-center">
                            <h1 className="text-2xl font-bold text-slate-800 mb-2">Algo salió mal</h1>
                            <p className="text-slate-500 mb-8">Ha ocurrido un error inesperado.</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={this.handleRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all">Intentar Nuevamente</button>
                                <button onClick={this.handleGoHome} className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border border-slate-200 transition-all">Ir al Inicio</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
```

### src/hooks/useApiCall.ts
```typescript
import { useState, useCallback } from 'react';

interface UseApiCallReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (promise: Promise<T>) => Promise<T>;
    reset: () => void;
}

export function useApiCall<T>(): UseApiCallReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async (promise: Promise<T>) => {
        setLoading(true);
        setError(null);
        try {
            const result = await promise;
            setData(result);
            return result;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
}
```

### src/components/ui/LoadingSpinner.tsx
```tsx
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    className?: string;
}

export function LoadingSpinner({ size = 'md', label, className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-4',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-slate-200 border-t-blue-600 rounded-full animate-spin mb-2`}
                role="status"
                aria-label="Loading"
            />
            {label && (
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    {label}
                </p>
            )}
        </div>
    );
}
```

### src/components/ui/ErrorAlert.tsx
```tsx
import { AlertTriangle, XCircle } from 'lucide-react';

interface ErrorAlertProps {
    title?: string;
    message: string;
    onDismiss?: () => void;
    className?: string;
}

export function ErrorAlert({ title = 'Error', message, onDismiss, className = '' }: ErrorAlertProps) {
    return (
        <div className={`bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 ${className}`} role="alert">
            <div className="flex-shrink-0 text-red-500 mt-1">
                <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-1">{title}</h3>
                <p className="text-sm text-red-700">{message}</p>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Dismiss"
                >
                    <XCircle size={20} />
                </button>
            )}
        </div>
    );
}
```

### README.md
```markdown
# IPS ERP - Enterprise Resource Planning

A comprehensive ERP solution for Home Care IPS (Instituciones Prestadoras de Salud) in Colombia, built with modern web technologies.

## Features
- **Role-Based Access**: Admin and Nurse portals with distinct functionalities.
- **Rostering**: AI-assisted shift management and nurse routing.
- **Inventory Management**: Real-time stock tracking with thresholds and expiry alerts.
- **Billing**: RIPS validation and Glosa defense using AI suggestions.

## Tech Stack
- React 18, Vite, TypeScript
- Vanilla CSS Modules
- AWS Amplify (Cognito)
- Lucide React

## Getting Started
1. Clone the repository.
2. `npm install`
3. Copy `.env.example` to `.env`.
4. `npm run dev`

## Building for Production
`npm run build`
```

## 3. Confirmations

### Does `src/types/components.ts` exist?
**YES**. Content:
```typescript
import type { Tenant } from '../types';

export interface LandingPageProps {
    onEnterApp: () => void;
}

export interface SimpleNurseAppProps {
    onLogout: () => Promise<void> | void;
}

export interface AdminDashboardProps {
    view: string;
    setView: (view: string) => void;
    onLogout: () => Promise<void> | void;
    tenant: Tenant | null;
}

export interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
}
```

### Are ALL inline `<style>` tags removed from components?
**NO**. The following components still use inline `<style>` blocks for isolated component-specific styling (not inline attributes):
- `src/components/RipsValidator.tsx`
- `src/components/EvidenceGenerator.tsx`
- `src/components/StaffManagement.tsx`
- `src/components/PatientDashboard.tsx`
- `src/components/ReportingDashboard.tsx`

### How many .module.css files exist?
**3** files:
- `src/components/AdminRoster.module.css`
- `src/components/InventoryDashboard.module.css`
- `src/components/NurseDashboard.module.css`

## 4. Build & Lint Output

### npm run build
**Exit Code: 0 (Success)**
```
vite v7.3.1 building client environment for production...
✓ 2303 modules transformed.
dist/index.html                           0.45 kB
dist/assets/index-Ci1OvD8t.js           360.32 kB
✓ built in 3.55s
```

### npm run lint
**Exit Code: 0 (Success)**
```
0 errors, 0 warnings
```

## 5. Remaining TODOs
**None**. No `TODO` comments were found in the `src` directory.

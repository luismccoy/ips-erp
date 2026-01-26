import type { Tenant } from '../types';

/**
 * Props for the Landing Page component.
 */
export interface LandingPageProps {
    onEnterApp: () => void;
}

/**
 * Props for the simplified Nurse mobile app view.
 */
export interface SimpleNurseAppProps {
    onLogout: () => Promise<void> | void;
}

/**
 * Props for the main Admin Dashboard shell.
 */
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
    dataTour?: string;
}

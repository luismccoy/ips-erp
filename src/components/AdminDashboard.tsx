import { useState, useEffect, lazy, Suspense } from 'react';
import {
    ClipboardText, Package, CalendarBlank, ShieldWarning,
    FileText, SignOut, CurrencyDollar, ChartBar,
    Users, Globe
} from '@phosphor-icons/react';
import { ActivityIcon, StethoscopeIcon, HeartPulseIcon } from './ui/icons';

import { client, isUsingRealBackend, isDemoMode, MOCK_USER } from '../amplify-utils';
import { GuidedTour } from './GuidedTour';
import type { AdminDashboardProps } from '../types/components';
import { graphqlToFrontendSafe } from '../utils/inventory-transforms';
import { useLanguage } from '../contexts/LanguageContext';
import { STORAGE_KEYS } from '../constants/navigation';

import { NotificationBell } from './NotificationBell';
import type { NotificationItem } from '../types/workflow';
import { ErrorBoundary } from './ErrorBoundary';

// Zendenta shared components
import { Sidebar, type NavSection } from './ui/Sidebar';
import { MetricCard } from './ui/MetricCard';
import { PageHeader } from './ui/PageHeader';
import { Badge } from './ui/Badge';

// Lazy load heavy sub-panels for faster initial render
const PendingReviewsPanel = lazy(() => import('./PendingReviewsPanel').then(m => ({ default: m.PendingReviewsPanel })));
const AuditLogViewer = lazy(() => import('./AuditLogViewer').then(m => ({ default: m.AuditLogViewer })));
const BillingDashboard = lazy(() => import('./BillingDashboard').then(m => ({ default: m.BillingDashboard })));
const InventoryDashboard = lazy(() => import('./InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const RosterDashboard = lazy(() => import('./RosterDashboard').then(m => ({ default: m.RosterDashboard })));
const ComplianceDashboard = lazy(() => import('./ComplianceDashboard').then(m => ({ default: m.ComplianceDashboard })));
const ReportingDashboard = lazy(() => import('./ReportingDashboard').then(m => ({ default: m.ReportingDashboard })));
const PatientsPage = lazy(() => import('../pages/admin/PatientsPage').then(m => ({ default: m.PatientsPage })));
const StaffPage = lazy(() => import('../pages/admin/StaffPage').then(m => ({ default: m.StaffPage })));

// Clinical Assessment Components
import { ClinicalAlertsWidget } from './ClinicalAlertsWidget';

// Panel loading fallback
const PanelLoader = () => (
    <div className="flex items-center justify-center h-64">
        <div className="text-center">
            <div className="h-8 w-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Cargando módulo...</p>
        </div>
    </div>
);

// Sidebar navigation sections (Zendenta grouped layout)
const adminSections: NavSection[] = [
    {
        label: 'Principal',
        items: [
            { id: 'dashboard', label: 'Panel Principal', icon: ActivityIcon, dataTour: 'nav-dashboard', 'data-testid': 'nav-dashboard' },
            { id: 'patients', label: 'Pacientes', icon: Users, dataTour: 'nav-patients', 'data-testid': 'nav-patients' },
            { id: 'staff', label: 'Personal', icon: StethoscopeIcon, dataTour: 'nav-staff', 'data-testid': 'nav-staff' },
        ],
    },
    {
        label: 'Clínico',
        items: [
            { id: 'pending-reviews', label: 'Revisiones Pendientes', icon: ClipboardText, dataTour: 'nav-pending', 'data-testid': 'nav-pending-reviews' },
            { id: 'audit', label: 'Auditoría Clínica', icon: ClipboardText, dataTour: 'nav-audit', 'data-testid': 'nav-audit' },
            { id: 'compliance', label: 'Cumplimiento', icon: ShieldWarning, dataTour: 'nav-compliance', 'data-testid': 'nav-compliance' },
        ],
    },
    {
        label: 'Operaciones',
        items: [
            { id: 'roster', label: 'Turnos', icon: CalendarBlank, dataTour: 'nav-roster', 'data-testid': 'nav-roster' },
            { id: 'inventory', label: 'Inventario', icon: Package, dataTour: 'nav-inventory', 'data-testid': 'nav-inventory' },
            { id: 'billing', label: 'Facturación', icon: FileText, dataTour: 'nav-billing', 'data-testid': 'nav-billing' },
            { id: 'reporting', label: 'Reportes', icon: ChartBar, dataTour: 'nav-reporting', 'data-testid': 'nav-reporting' },
        ],
    },
];

// View title mapping
const viewTitles: Record<string, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Resumen General', subtitle: 'Vista general del sistema' },
    'pending-reviews': { title: 'Revisiones Pendientes', subtitle: 'Visitas esperando aprobación' },
    audit: { title: 'Auditoría Clínica' },
    inventory: { title: 'Gestión de Inventario', subtitle: 'Control de suministros médicos' },
    roster: { title: 'Programación de Turnos', subtitle: 'Asignación y optimización de rutas' },
    compliance: { title: 'Cumplimiento', subtitle: 'Resolución 3100' },
    billing: { title: 'Facturación y RIPS', subtitle: 'Gestión financiera y RIPS 2275' },
    reporting: { title: 'Reportes y Análisis', subtitle: 'Métricas y exportaciones' },
    patients: { title: 'Gestión de Pacientes', subtitle: 'Registro y seguimiento' },
    staff: { title: 'Gestión de Personal', subtitle: 'Enfermeras y auxiliares' },
};


export default function AdminDashboard({ onLogout, tenant }: AdminDashboardProps) {
    const [view, setView] = useState<string>('dashboard');
    const [initialViewSetForRole, setInitialViewSetForRole] = useState<string | null>(null);
    const [visitedPanels, setVisitedPanels] = useState<Set<string>>(new Set(['dashboard']));
    const { language, setLanguage } = useLanguage();
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        if (tenant?.role && initialViewSetForRole !== tenant.role) {
            setInitialViewSetForRole(tenant.role);
            if (tenant.role === 'admin') setView('dashboard');
        }
        if (!tenant?.role && initialViewSetForRole !== null) setInitialViewSetForRole(null);

        const checkDemoMode = () => {
            if (isDemoMode() && !sessionStorage.getItem(STORAGE_KEYS.TOUR_COMPLETED)) setShowTour(true);
        };
        checkDemoMode();
        const timer = setTimeout(checkDemoMode, 100);
        return () => clearTimeout(timer);
    }, [tenant?.role, initialViewSetForRole]);

    useEffect(() => {
        if (!visitedPanels.has(view)) {
            setVisitedPanels(prev => new Set([...prev, view]));
        }
    }, [view, visitedPanels]);

    const handleApproveRequest = async (shiftId: string) => {
        try {
            await (client.mutations as any).approveVisit({ shiftId });
        } catch (error) {
            console.error('Failed to approve visit:', error);
            alert('Error al aprobar la visita. Verifique los registros.');
        }
    };

    const handleRejectRequest = async (shiftId: string, reason: string) => {
        try {
            await (client.mutations as any).rejectVisit({ shiftId, reason });
        } catch (error) {
            console.error('Failed to reject visit:', error);
            alert('Error al rechazar la visita.');
        }
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        if (notification.type === 'VISIT_PENDING_REVIEW') setView('pending-reviews');
    };

    const viewInfo = viewTitles[view] || { title: '' };

    // Sidebar footer
    const sidebarFooter = (
        <div>
            <div className="p-3 bg-slate-50 rounded-lg mb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Licencia</p>
                <p className="text-sm text-slate-700 font-medium truncate">{tenant?.name}</p>
            </div>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <SignOut size={16} /> Cerrar Sesión
            </button>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50" data-testid="admin-dashboard">
            {/* Zendenta White Sidebar */}
            <Sidebar
                sections={adminSections}
                activeItem={view}
                onNavigate={setView}
                brandName="IPS ERP"
                brandSubtitle="Enterprise"
                footer={sidebarFooter}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto" data-testid="admin-main-content">
                {/* Top header bar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-20" data-testid="admin-dashboard-header">
                    <div className="md:hidden" /> {/* Spacer for mobile hamburger in Sidebar */}
                    <h2 className="text-lg font-bold text-slate-900 hidden md:block">{viewInfo.title}</h2>
                    <div className="flex items-center gap-3">
                        <NotificationBell
                            userId={tenant?.id || 'admin'}
                            onNotificationClick={handleNotificationClick}
                        />
                        <button
                            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-medium transition-colors"
                            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                        >
                            <Globe size={14} />
                            {language === 'es' ? 'EN' : 'ES'}
                        </button>
                        <Badge variant="success" dot>Res 3100</Badge>
                        <div className="h-9 w-9 bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">A</div>
                    </div>
                </header>

                <div className="p-6">
                    {/* Page header with title + actions */}
                    <PageHeader
                        title={viewInfo.title}
                        subtitle={viewInfo.subtitle}
                        className="md:hidden" // Only on mobile (desktop shows in top bar)
                    />

                    {/* Dashboard is always mounted (default view) */}
                    <div className={view === 'dashboard' ? '' : 'hidden'}><DashboardView /></div>

                    {/* Lazy panels: only mount after first visit, then stay mounted */}
                    {visitedPanels.has('pending-reviews') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'pending-reviews' ? '' : 'hidden'}>
                                <PendingReviewsPanel
                                    tenantId={tenant?.id || ''}
                                    onApprove={handleApproveRequest}
                                    onReject={handleRejectRequest}
                                />
                            </div>
                        </Suspense>
                    )}
                    {visitedPanels.has('audit') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'audit' ? '' : 'hidden'}><AuditLogViewer /></div>
                        </Suspense>
                    )}
                    {visitedPanels.has('inventory') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'inventory' ? '' : 'hidden'}>
                                <ErrorBoundary><InventoryDashboard /></ErrorBoundary>
                            </div>
                        </Suspense>
                    )}
                    {visitedPanels.has('roster') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'roster' ? '' : 'hidden'}><RosterDashboard /></div>
                        </Suspense>
                    )}
                    {visitedPanels.has('compliance') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'compliance' ? '' : 'hidden'}><ComplianceDashboard /></div>
                        </Suspense>
                    )}
                    {visitedPanels.has('billing') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'billing' ? '' : 'hidden'}>
                                <ErrorBoundary><BillingDashboard /></ErrorBoundary>
                            </div>
                        </Suspense>
                    )}
                    {visitedPanels.has('reporting') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'reporting' ? '' : 'hidden'}><ReportingDashboard /></div>
                        </Suspense>
                    )}
                    {visitedPanels.has('patients') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'patients' ? '' : 'hidden'}><PatientsPage /></div>
                        </Suspense>
                    )}
                    {visitedPanels.has('staff') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'staff' ? '' : 'hidden'}><StaffPage /></div>
                        </Suspense>
                    )}
                </div>
            </main>

            {/* Guided Tour (Demo Mode Only) */}
            {showTour && (
                <GuidedTour
                    currentView={view}
                    onViewChange={setView}
                    autoStart={true}
                />
            )}
        </div>
    );
}

function DashboardView() {
    const [stats, setStats] = useState({ patients: 0, shifts: 0, inventory: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [patientsRes, shiftsRes, inventoryRes] = await Promise.all([
                    (client.models.Patient as any).list(),
                    (client.models.Shift as any).list(),
                    (client.models.InventoryItem as any).list()
                ]);

                const transformedInventory = (inventoryRes.data || []).map((item: any) => {
                    try {
                        return { ...item, status: graphqlToFrontendSafe(item.status) || 'in-stock' };
                    } catch {
                        return { ...item, status: 'in-stock' };
                    }
                });

                const lowStockItems = transformedInventory.filter(
                    (item: any) => item.status === 'low-stock' || item.status === 'out-of-stock'
                );

                setStats({
                    patients: patientsRes.data?.length || 0,
                    shifts: shiftsRes.data?.length || 0,
                    inventory: lowStockItems.length
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setStats({ patients: 0, shifts: 0, inventory: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        let auditSub: any;
        let shiftSub: any;

        const setupSubscriptions = () => {
            if ((client.models.AuditLog as any)?.onCreate) {
                auditSub = (client.models.AuditLog as any).onCreate({
                    filter: { tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] } }
                }).subscribe({
                    next: (log: any) => { console.log('Real-time audit log:', log); },
                    error: () => console.log('AuditLog sub not available')
                });
            }
            if ((client.models.Shift as any)?.onUpdate) {
                shiftSub = (client.models.Shift as any).onUpdate({
                    filter: { tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] } }
                }).subscribe({
                    next: (shift: any) => { console.log('Real-time shift update:', shift); },
                    error: () => console.log('Shift update sub failed')
                });
            }
        };

        setupSubscriptions();
        return () => { auditSub?.unsubscribe(); shiftSub?.unsubscribe(); };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-tour="dashboard-stats">
                <MetricCard
                    icon={<Users size={20} />}
                    value={stats.patients}
                    label="Pacientes"
                    trend="Activos"
                    trendDirection="neutral"
                    color="blue"
                    delay={0}
                />
                <MetricCard
                    icon={<CalendarBlank size={20} />}
                    value={stats.shifts}
                    label="Turnos"
                    trend="Total"
                    trendDirection="neutral"
                    color="purple"
                    delay={0.05}
                />
                <MetricCard
                    icon={<Package size={20} />}
                    value={`${stats.inventory} Items`}
                    label="Alertas de Stock"
                    trend={stats.inventory > 0 ? 'Bajo' : 'OK'}
                    trendDirection={stats.inventory > 0 ? 'down' : 'up'}
                    color={stats.inventory > 0 ? 'red' : 'green'}
                    delay={0.1}
                />
            </div>

            {/* Clinical Alerts + System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ClinicalAlertsWidget
                    onPatientClick={(patientId) => {
                        console.log('Navigate to patient:', patientId);
                    }}
                    maxItems={5}
                />

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Estado del Sistema</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">
                                ✓
                            </div>
                            <span className="text-sm text-slate-700 font-medium">
                                {isUsingRealBackend() ? 'Conectado a AWS Backend' : 'Modo Demo — Datos de Prueba'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <HeartPulseIcon size={16} />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">
                                Escalas Clínicas: Glasgow, Braden, Morse, NEWS, Barthel, Norton, RASS
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

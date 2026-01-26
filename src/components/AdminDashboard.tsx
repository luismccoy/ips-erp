import { useState, useEffect, lazy, Suspense } from 'react';
import {
    Activity, ClipboardCheck, Package, Calendar, ShieldAlert,
    FileText, LogOut, DollarSign, ClipboardList, BarChart,
    Users, Stethoscope, Menu, X
} from 'lucide-react';

import { client, isUsingRealBackend, isDemoMode, MOCK_USER } from '../amplify-utils';
import { GuidedTour, RestartTourButton } from './GuidedTour';
import type { AdminDashboardProps, NavItemProps } from '../types/components';
import { graphqlToFrontendSafe } from '../utils/inventory-transforms';

import { NotificationBell } from './NotificationBell';
import type { NotificationItem } from '../types/workflow';

// Lazy load heavy sub-panels for faster initial render
// Once loaded, they stay mounted (hidden) for instant tab switching
const PendingReviewsPanel = lazy(() => import('./PendingReviewsPanel').then(m => ({ default: m.PendingReviewsPanel })));
const AuditLogViewer = lazy(() => import('./AuditLogViewer').then(m => ({ default: m.AuditLogViewer })));
const BillingDashboard = lazy(() => import('./BillingDashboard').then(m => ({ default: m.BillingDashboard })));
const InventoryDashboard = lazy(() => import('./InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const RosterDashboard = lazy(() => import('./RosterDashboard').then(m => ({ default: m.RosterDashboard })));
const ComplianceDashboard = lazy(() => import('./ComplianceDashboard').then(m => ({ default: m.ComplianceDashboard })));
const ReportingDashboard = lazy(() => import('./ReportingDashboard').then(m => ({ default: m.ReportingDashboard })));
const PatientManager = lazy(() => import('./PatientManager').then(m => ({ default: m.PatientManager })));
const StaffManager = lazy(() => import('./StaffManager').then(m => ({ default: m.StaffManager })));

// Panel loading fallback
const PanelLoader = () => (
    <div className="flex items-center justify-center h-64">
        <div className="text-center">
            <div className="h-8 w-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Cargando módulo...</p>
        </div>
    </div>
);




export default function AdminDashboard({ view, setView, onLogout, tenant }: AdminDashboardProps) {
    // Mobile sidebar toggle
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Track visited panels for lazy mounting (only load when first visited, then keep mounted)
    const [visitedPanels, setVisitedPanels] = useState<Set<string>>(new Set(['dashboard']));
    
    // Guided tour state (only show in demo mode)
    const [showTour, setShowTour] = useState(false);
    
    // Check for demo mode after mount (enableDemoMode runs after component mounts)
    useEffect(() => {
        const checkDemoMode = () => {
            if (isDemoMode() && !sessionStorage.getItem('ips-demo-tour-completed')) {
                setShowTour(true);
            }
        };
        // Check immediately and after a short delay (in case enableDemoMode is async)
        checkDemoMode();
        const timer = setTimeout(checkDemoMode, 100);
        return () => clearTimeout(timer);
    }, []);
    
    // Mark current view as visited
    useEffect(() => {
        if (!visitedPanels.has(view)) {
            setVisitedPanels(prev => new Set([...prev, view]));
        }
    }, [view, visitedPanels]);
    
    /**
     * Handles visit approval from PendingReviewsPanel.
     * The PendingReviewsPanel handles the approval internally with its own modals.
     */
    const handleApproveRequest = async (shiftId: string) => {
        try {
            await (client.mutations as any).approveVisit({ shiftId });
            console.log('Successfully approved visit:', shiftId);
        } catch (error) {
            console.error('Failed to approve visit:', error);
            alert('Error al aprobar la visita. Verifique los registros.');
        }
    };

    const handleRejectRequest = async (shiftId: string, reason: string) => {
        try {
            await (client.mutations as any).rejectVisit({ shiftId, reason });
            console.log('Successfully rejected visit:', shiftId);
        } catch (error) {
            console.error('Failed to reject visit:', error);
            alert('Error al rechazar la visita.');
        }
    };

    /**
     * Handles notification click from NotificationBell.
     * Navigates to pending reviews for VISIT_PENDING_REVIEW notifications.
     * Validates: Requirement 4.1
     */
    const handleNotificationClick = (notification: NotificationItem) => {
        if (notification.type === 'VISIT_PENDING_REVIEW') {
            setView('pending-reviews');
        }
    };

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar - hidden on mobile, slide in when open */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-slate-900 text-white flex flex-col
                transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-[#2563eb] rounded-xl flex items-center justify-center">
                            <Activity size={22} />
                        </div>
                        <div>
                            <span className="font-black text-lg">IPS ERP</span>
                            <p className="text-xs text-slate-500">Enterprise</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavItem icon={Activity} label="Panel Principal" active={view === 'dashboard'} onClick={() => { setView('dashboard'); setSidebarOpen(false); }} dataTour="nav-dashboard" />
                    <NavItem icon={ClipboardList} label="Revisiones Pendientes" active={view === 'pending-reviews'} onClick={() => { setView('pending-reviews'); setSidebarOpen(false); }} dataTour="nav-pending" />
                    <NavItem icon={ClipboardCheck} label="Auditoría Clínica" active={view === 'audit'} onClick={() => { setView('audit'); setSidebarOpen(false); }} dataTour="nav-audit" />
                    <NavItem icon={Package} label="Inventario" active={view === 'inventory'} onClick={() => { setView('inventory'); setSidebarOpen(false); }} dataTour="nav-inventory" />
                    <NavItem icon={Calendar} label="Programación de Turnos" active={view === 'roster'} onClick={() => { setView('roster'); setSidebarOpen(false); }} dataTour="nav-roster" />
                    <NavItem icon={ShieldAlert} label="Cumplimiento" active={view === 'compliance'} onClick={() => { setView('compliance'); setSidebarOpen(false); }} dataTour="nav-compliance" />
                    <NavItem icon={FileText} label="Facturación y RIPS" active={view === 'billing'} onClick={() => { setView('billing'); setSidebarOpen(false); }} dataTour="nav-billing" />
                    <NavItem icon={BarChart} label="Reportes y Análisis" active={view === 'reporting'} onClick={() => { setView('reporting'); setSidebarOpen(false); }} dataTour="nav-reporting" />

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">Administración</p>
                        <NavItem icon={Users} label="Pacientes" active={view === 'patients'} onClick={() => { setView('patients'); setSidebarOpen(false); }} dataTour="nav-patients" />
                        <NavItem icon={Stethoscope} label="Personal / Enfermeras" active={view === 'staff'} onClick={() => { setView('staff'); setSidebarOpen(false); }} dataTour="nav-staff" />
                    </div>

                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="p-4 bg-slate-800/40 rounded-2xl mb-4">
                        <p className="text-xs font-black text-slate-500 uppercase">Licencia</p>
                        <p className="text-sm text-white font-bold truncate">{tenant?.name}</p>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                    {/* Mobile hamburger menu */}
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden p-2 -ml-2 mr-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 truncate">
                        {view === 'dashboard' && 'Resumen General'}
                        {view === 'pending-reviews' && 'Revisiones Pendientes'}
                        {view === 'audit' && 'Auditoría Clínica'}
                        {view === 'inventory' && 'Gestión de Inventario'}
                        {view === 'roster' && 'Programación de Turnos'}
                        {view === 'compliance' && 'Cumplimiento (Res 3100)'}
                        {view === 'billing' && 'Facturación y RIPS'}
                        {view === 'reporting' && 'Reportes y Análisis'}
                        {view === 'patients' && 'Gestión de Pacientes'}
                        {view === 'staff' && 'Gestión de Personal'}

                    </h2>
                    <div className="flex items-center gap-4">
                        <NotificationBell
                            userId={tenant?.id || 'admin'}
                            onNotificationClick={handleNotificationClick}
                        />
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Res 3100 Compliant</span>
                        <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">A</div>
                    </div>
                </header>
                {/* 
                  Performance optimization: 
                  1. Lazy load panels on first visit (code-split for fast initial render)
                  2. Keep panels mounted after visited (hidden via CSS, preserves state)
                  3. Result: Fast initial load + instant tab switching after first visit
                */}
                <div className="p-4 md:p-8">
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
                            <div className={view === 'inventory' ? '' : 'hidden'}><InventoryDashboard /></div>
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
                            <div className={view === 'billing' ? '' : 'hidden'}><BillingDashboard /></div>
                        </Suspense>
                    )}
                    {visitedPanels.has('reporting') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'reporting' ? '' : 'hidden'}><ReportingDashboard /></div>
                        </Suspense>
                    )}
                    {visitedPanels.has('patients') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'patients' ? '' : 'hidden'}><PatientManager /></div>
                        </Suspense>
                    )}
                    {visitedPanels.has('staff') && (
                        <Suspense fallback={<PanelLoader />}>
                            <div className={view === 'staff' ? '' : 'hidden'}><StaffManager /></div>
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

function NavItem({ icon: Icon, label, active, onClick, dataTour }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            data-tour={dataTour}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#2563eb] text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon size={18} />
            <span className="text-sm font-bold">{label}</span>
        </button>
    );
}

function DashboardView() {
    const [stats, setStats] = useState({ patients: 0, shifts: 0, inventory: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Always use the client - it returns mock data in demo mode
                const [patientsRes, shiftsRes, inventoryRes] = await Promise.all([
                    (client.models.Patient as any).list(),
                    (client.models.Shift as any).list(),
                    (client.models.InventoryItem as any).list()
                ]);

                // Transform inventory status from GraphQL format to frontend format
                const transformedInventory = (inventoryRes.data || []).map((item: any) => {
                    try {
                        return {
                            ...item,
                            status: graphqlToFrontendSafe(item.status) || 'in-stock'
                        };
                    } catch (error) {
                        console.error('Error transforming inventory status:', error, item);
                        // Fallback to safe default if transformation fails
                        return {
                            ...item,
                            status: 'in-stock'
                        };
                    }
                });

                // Calculate low stock items using transformed status
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
        // Dashboard real-time subscriptions
        let auditSub: any;
        let shiftSub: any;

        const setupSubscriptions = () => {
            // Safe check for mock backend compatibility
            if ((client.models.AuditLog as any)?.onCreate) {
                auditSub = (client.models.AuditLog as any).onCreate({
                    filter: { tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] } }
                }).subscribe({
                    next: (log: any) => {
                        console.log('Real-time audit log:', log);
                    },
                    error: () => console.log('AuditLog sub not available or failed')
                });
            }

            if ((client.models.Shift as any)?.onUpdate) {
                shiftSub = (client.models.Shift as any).onUpdate({
                    filter: { tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] } }
                }).subscribe({
                    next: (shift: any) => {
                        console.log('Real-time shift update:', shift);
                    },
                    error: () => console.log('Shift update sub failed')
                });
            }
        };

        setupSubscriptions();

        return () => {
            auditSub?.unsubscribe();
            shiftSub?.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-400">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6" data-tour="dashboard-stats">
                {[
                    { label: 'Pacientes', value: stats.patients.toString(), change: 'Activos', color: 'blue' },
                    { label: 'Turnos', value: stats.shifts.toString(), change: 'Total', color: 'purple' },
                    { label: 'Alertas de Stock', value: `${stats.inventory} Items`, change: stats.inventory > 0 ? 'Bajo' : 'OK', color: stats.inventory > 0 ? 'red' : 'green' }
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 bg-${kpi.color}-50 rounded-lg`}>
                                <DollarSign className={`h-5 w-5 text-${kpi.color}-600`} />
                            </div>
                            <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-full">{kpi.change}</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{kpi.value}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold">{kpi.label}</div>
                    </div>
                ))}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h3 className="font-black text-slate-900 mb-4">Estado del Sistema</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">
                            ✓
                        </div>
                        <span className="text-sm text-slate-700 font-medium">
                            {isUsingRealBackend() ? 'Conectado a AWS Backend' : 'Usando Datos de Prueba (Modo Demo)'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}


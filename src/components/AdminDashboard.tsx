import { useState, useEffect } from 'react';
import {
    Activity, ClipboardCheck, Package, Calendar, ShieldAlert,
    FileText, LogOut, DollarSign, ClipboardList, BarChart
} from 'lucide-react';

import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils';
import type { AdminDashboardProps, NavItemProps } from '../types/components';
import { graphqlToFrontendSafe } from '../utils/inventory-transforms';

import { PendingReviewsPanel } from './PendingReviewsPanel';
import { NotificationBell } from './NotificationBell';

import type { NotificationItem } from '../types/workflow';
import { AuditLogViewer } from './AuditLogViewer';
import { BillingDashboard } from './BillingDashboard';
import { InventoryDashboard } from './InventoryDashboard';
import { RosterDashboard } from './RosterDashboard';
import { ComplianceDashboard } from './ComplianceDashboard';
import { ReportingDashboard } from './ReportingDashboard';




export default function AdminDashboard({ view, setView, onLogout, tenant }: AdminDashboardProps) {
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
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
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
                    <NavItem icon={Activity} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
                    <NavItem icon={ClipboardList} label="Revisiones Pendientes" active={view === 'pending-reviews'} onClick={() => setView('pending-reviews')} />
                    <NavItem icon={ClipboardCheck} label="Clinical Audit" active={view === 'audit'} onClick={() => setView('audit')} />
                    <NavItem icon={Package} label="Inventory" active={view === 'inventory'} onClick={() => setView('inventory')} />
                    <NavItem icon={Calendar} label="Rostering" active={view === 'roster'} onClick={() => setView('roster')} />
                    <NavItem icon={ShieldAlert} label="Compliance" active={view === 'compliance'} onClick={() => setView('compliance')} />
                    <NavItem icon={FileText} label="Billing & RIPS" active={view === 'billing'} onClick={() => setView('billing')} />
                    <NavItem icon={BarChart} label="Reporting & Analytics" active={view === 'reporting'} onClick={() => setView('reporting')} />

                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="p-4 bg-slate-800/40 rounded-2xl mb-4">
                        <p className="text-xs font-black text-slate-500 uppercase">License</p>
                        <p className="text-sm text-white font-bold truncate">{tenant?.name}</p>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                    <h2 className="text-2xl font-black text-slate-900">
                        {view === 'dashboard' && 'Business Overview'}
                        {view === 'pending-reviews' && 'Revisiones Pendientes'}
                        {view === 'audit' && 'Clinical Audit'}
                        {view === 'inventory' && 'Inventory Management'}
                        {view === 'roster' && 'Rostering'}
                        {view === 'compliance' && 'Compliance (Res 3100)'}
                        {view === 'billing' && 'Billing & RIPS'}
                        {view === 'reporting' && 'Reporting & Analytics'}

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
                <div className="p-8">
                    {view === 'dashboard' && <DashboardView />}
                    {view === 'pending-reviews' && (
                        <PendingReviewsPanel
                            tenantId={tenant?.id || ''}
                            onApprove={handleApproveRequest}
                            onReject={handleRejectRequest}
                        />
                    )}
                    {view === 'audit' && <AuditLogViewer />}
                    {view === 'inventory' && <InventoryDashboard />}
                    {view === 'roster' && <RosterDashboard />}
                    {view === 'compliance' && <ComplianceDashboard />}
                    {view === 'billing' && <BillingDashboard />}
                    {view === 'reporting' && <ReportingDashboard />}


                </div>
            </main>
        </div>
    );
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
    return (
        <button
            onClick={onClick}
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
            if (!isUsingRealBackend()) {
                // Use mock data dynamically
                const { PATIENTS, INVENTORY, SHIFTS } = await import('../data/mock-data');
                setStats({
                    patients: PATIENTS.length,
                    shifts: SHIFTS.length,
                    inventory: INVENTORY.filter((i: any) => i.quantity < i.reorderThreshold).length
                });
                setLoading(false);
                return;
            }

            try {
                // Fetch real data
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
            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: 'Patients', value: stats.patients.toString(), change: 'Active', color: 'blue' },
                    { label: 'Shifts', value: stats.shifts.toString(), change: 'Total', color: 'purple' },
                    { label: 'Stock Alerts', value: `${stats.inventory} Items`, change: stats.inventory > 0 ? 'Low' : 'OK', color: stats.inventory > 0 ? 'red' : 'green' }
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
                <h3 className="font-black text-slate-900 mb-4">System Status</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">
                            ✓
                        </div>
                        <span className="text-sm text-slate-700 font-medium">
                            {isUsingRealBackend() ? 'Connected to AWS Backend' : 'Using Mock Data (Development Mode)'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}


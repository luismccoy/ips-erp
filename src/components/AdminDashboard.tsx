import { useState, useEffect } from 'react';
import {
    Activity, ClipboardCheck, Package, Calendar, ShieldAlert,
    FileText, LogOut, DollarSign, Sparkles, AlertTriangle
} from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import type { AdminDashboardProps, NavItemProps } from '../types/components';
import type { Patient, InventoryItem, Shift } from '../types';

export default function AdminDashboard({ view, setView, onLogout, tenant }: AdminDashboardProps) {
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
                    <NavItem icon={ClipboardCheck} label="Clinical Audit" active={view === 'audit'} onClick={() => setView('audit')} />
                    <NavItem icon={Package} label="Inventory" active={view === 'inventory'} onClick={() => setView('inventory')} />
                    <NavItem icon={Calendar} label="Rostering" active={view === 'roster'} onClick={() => setView('roster')} />
                    <NavItem icon={ShieldAlert} label="Compliance" active={view === 'compliance'} onClick={() => setView('compliance')} />
                    <NavItem icon={FileText} label="Billing & RIPS" active={view === 'billing'} onClick={() => setView('billing')} />

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
                        {view === 'audit' && 'Clinical Audit'}
                        {view === 'inventory' && 'Inventory Management'}
                        {view === 'roster' && 'Rostering'}
                        {view === 'compliance' && 'Compliance (Res 3100)'}
                        {view === 'billing' && 'Billing & RIPS'}

                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Res 3100 Compliant</span>
                        <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">A</div>
                    </div>
                </header>
                <div className="p-8">
                    {view === 'dashboard' && <DashboardView />}
                    {view === 'audit' && <AuditView />}
                    {view === 'inventory' && <InventoryView />}
                    {view === 'roster' && <RosterView />}
                    {view === 'compliance' && <ComplianceView />}
                    {view === 'billing' && <BillingView />}
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

                const lowStockItems = (inventoryRes.data || []).filter(
                    (item: any) => item.quantity < item.reorderLevel
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

function AuditView() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            if (!isUsingRealBackend()) {
                const { PATIENTS } = await import('../data/mock-data');
                setPatients(PATIENTS as any);
                setLoading(false);
                return;
            }

            try {
                const response = await (client.models.Patient as any).list();
                setPatients(response.data || []);
            } catch (error) {
                console.error('Error fetching patients:', error);
                setPatients([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    if (loading) {
        return <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center text-slate-400">Loading patients...</div>;
    }

    if (patients.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-400 mb-4">No patients registered yet</p>
                <p className="text-xs text-slate-500">Add patients to see clinical audit data</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                Clinical Audit <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">AI Analysis</span>
            </h3>
            <div className="space-y-4">
                {patients.map(patient => (
                    <div key={patient.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-900">{patient.name}</h4>
                                <p className="text-sm text-slate-500">{patient.diagnosis || 'No diagnosis'}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                                Active
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InventoryView() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            if (!isUsingRealBackend()) {
                const { INVENTORY } = await import('../data/mock-data');
                setInventory(INVENTORY as any);
                setLoading(false);
                return;
            }

            try {
                const response = await (client.models.InventoryItem as any).list();
                setInventory(response.data || []);
            } catch (error) {
                console.error('Error fetching inventory:', error);
                setInventory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    if (loading) {
        return <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center text-slate-400">Loading inventory...</div>;
    }

    if (inventory.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-400 mb-4">No inventory items yet</p>
                <p className="text-xs text-slate-500">Add items to track pharmacy inventory</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <h3 className="font-black text-slate-900 mb-4">Inventory (Farmacia)</h3>
            <div className="space-y-3">
                {inventory.map(item => (
                    <div key={item.id} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-slate-900">{item.name}</h4>
                            <p className="text-sm text-slate-500">{item.unit || 'Unit'}</p>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-black ${item.quantity < item.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
                                {item.quantity}
                            </div>
                            <div className="text-xs text-slate-400">Threshold: {item.reorderLevel}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RosterView() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!isUsingRealBackend()) {
                const { SHIFTS, PATIENTS } = await import('../data/mock-data');
                setShifts(SHIFTS as any);
                setPatients(PATIENTS as any);
                setLoading(false);
                return;
            }

            try {
                const [shiftsRes, patientsRes] = await Promise.all([
                    (client.models.Shift as any).list(),
                    (client.models.Patient as any).list()
                ]);
                setShifts(shiftsRes.data || []);
                setPatients(patientsRes.data || []);
            } catch (error) {
                console.error('Error fetching roster data:', error);
                setShifts([]);
                setPatients([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center text-slate-400">Loading shifts...</div>;
    }

    if (shifts.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-400 mb-4">No shifts scheduled yet</p>
                <p className="text-xs text-slate-500">Create shifts to manage nurse assignments</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-slate-900">Shift Management</h3>
                <button className="bg-[#2563eb] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Sparkles size={16} /> Optimize Routes (AI)
                </button>
            </div>
            <div className="space-y-3">
                {shifts.map(shift => {
                    const patient = patients.find(p => p.id === shift.patientId);
                    return (
                        <div key={shift.id} className="p-4 border border-slate-100 rounded-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900">{patient?.name || 'Unknown Patient'}</h4>
                                    <p className="text-sm text-slate-500">{new Date(shift.scheduledTime).toLocaleString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${shift.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                                    }`}>{shift.status}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ComplianceView() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h3 className="font-black text-slate-900 mb-4">Resolución 3100 Compliance</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-green-900">98%</div>
                                <div className="text-xs text-green-600 font-bold">Audit Score</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-red-900">2</div>
                                <div className="text-xs text-red-600 font-bold">Critical Alerts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-3">Equipment Status</h4>
                <div className="space-y-2">
                    {['Tensiómetro Digital', 'Oxímetro de Pulso', 'Termómetro'].map((item, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">{item}</span>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Calibrated</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BillingView() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h3 className="font-black text-slate-900 mb-4">Billing Batches</h3>
                <div className="space-y-3">
                    {[1025, 1026].map(id => (
                        <div key={id} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-900">EPS Sanitas (Batch FE-{id})</h4>
                                <p className="text-xs text-emerald-600 font-bold">✓ Validation Passed</p>
                            </div>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-all">
                                Inspect Packet
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-red-100">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Sparkles className="text-purple-500" size={18} /> Glosa Defense Engine
                    </h4>
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                        <div className="mb-2">
                            <span className="text-xs font-bold text-red-600">Glosa: $4.2M COP</span>
                            <span className="text-xs text-rose-400 ml-2">EPS SURA</span>
                        </div>
                        <h5 className="font-black text-rose-950 text-sm mb-2">Rejection Code: 402</h5>
                        <p className="text-xs text-rose-900 mb-3">Claims rejected due to "unjustified home care extension"</p>
                        <button className="bg-rose-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-rose-800 transition-all w-full">
                            Generate Rebuttal (AI)
                        </button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-3">RIPS 2275 Validator</h4>
                    <div className="p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center">
                        <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3">
                            <ClipboardCheck size={32} />
                        </div>
                        <p className="font-bold text-slate-800 mb-2">Drop RIPS Bundle</p>
                        <p className="text-xs text-slate-400">JSON validation vs MinSalud API</p>
                        <button className="mt-4 bg-[#2563eb] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
                            Select Files
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


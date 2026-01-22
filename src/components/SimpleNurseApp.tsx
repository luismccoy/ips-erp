import { useState, useEffect } from 'react';
import { Activity, LogOut } from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import type { SimpleNurseAppProps } from '../types/components';
import type { Shift, Patient } from '../types';

export default function SimpleNurseApp({ onLogout }: SimpleNurseAppProps) {
    const [activeTab, setActiveTab] = useState('route');
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
                console.error('Error fetching nurse data:', error);
                setShifts([]);
                setPatients([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const completedShifts = shifts.filter(s => s.status === 'COMPLETED').length;
    const totalShifts = shifts.length;
    const completionRate = totalShifts > 0 ? Math.round((completedShifts / totalShifts) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <header className="bg-slate-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity size={24} className="text-[#2563eb]" />
                    <span className="font-black text-lg">IPS ERP</span>
                </div>
                <button onClick={onLogout} className="text-sm text-slate-400 hover:text-white">
                    <LogOut size={20} />
                </button>
            </header>

            <div className="p-4">
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('route')}
                        className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'route' ? 'bg-[#2563eb] text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                    >
                        My Route
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'stats' ? 'bg-[#2563eb] text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                    >
                        Stats
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-slate-400 py-8">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'route' && (
                            <div className="space-y-4">
                                {shifts.length === 0 ? (
                                    <div className="bg-slate-800 p-8 rounded-xl text-center">
                                        <p className="text-slate-400 mb-2">No shifts assigned yet</p>
                                        <p className="text-xs text-slate-500">Check back later for your route</p>
                                    </div>
                                ) : (
                                    shifts.map(shift => {
                                        const patient = patients.find(p => p.id === shift.patientId);
                                        return (
                                            <div key={shift.id} className="bg-slate-800 p-4 rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-white">{patient?.name || 'Unknown Patient'}</h3>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${shift.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>{shift.status}</span>
                                                </div>
                                                <p className="text-sm text-slate-400 mb-2">{patient?.address || 'Address not available'}</p>
                                                <p className="text-xs text-slate-500">{new Date(shift.scheduledTime).toLocaleString()}</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="space-y-4">
                                <div className="bg-slate-800 p-6 rounded-xl text-center">
                                    <div className="text-4xl font-black text-emerald-400 mb-2">{totalShifts}</div>
                                    <div className="text-sm text-slate-400">Total Shifts</div>
                                </div>
                                <div className="bg-slate-800 p-6 rounded-xl text-center">
                                    <div className="text-4xl font-black text-blue-400 mb-2">{completionRate}%</div>
                                    <div className="text-sm text-slate-400">Completion Rate</div>
                                </div>
                                <div className="bg-slate-800 p-6 rounded-xl text-center">
                                    <div className="text-sm text-slate-500 mb-2">
                                        {isUsingRealBackend() ? '🟢 Live Data' : '🟡 Mock Data'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

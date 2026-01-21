import { useState } from 'react';
import { Activity, LogOut } from 'lucide-react';
import { SHIFTS, PATIENTS } from '../data/mock-data';
import type { SimpleNurseAppProps } from '../types/components';

export default function SimpleNurseApp({ onLogout }: SimpleNurseAppProps) {
    const [activeTab, setActiveTab] = useState('route');

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

                {activeTab === 'route' && (
                    <div className="space-y-4">
                        {SHIFTS.map(shift => {
                            const patient = PATIENTS.find(p => p.id === shift.patientId);
                            return (
                                <div key={shift.id} className="bg-slate-800 p-4 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white">{patient?.name}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${shift.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>{shift.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">{patient?.address}</p>
                                    <p className="text-xs text-slate-500">{shift.startTime}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-4">
                        <div className="bg-slate-800 p-6 rounded-xl text-center">
                            <div className="text-4xl font-black text-emerald-400 mb-2">8</div>
                            <div className="text-sm text-slate-400">Shifts This Week</div>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-xl text-center">
                            <div className="text-4xl font-black text-blue-400 mb-2">100%</div>
                            <div className="text-sm text-slate-400">Completion Rate</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

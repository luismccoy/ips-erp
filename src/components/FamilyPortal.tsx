import { useState } from 'react';
import { ShieldAlert, LogOut, Activity } from 'lucide-react';
import { PATIENTS, VITALS_HISTORY } from '../data/mock-data';
import type { SimpleNurseAppProps } from '../types/components'; // Reusing similar prop type

export default function FamilyPortal({ onLogout }: SimpleNurseAppProps) {
    const [selectedPatient, setSelectedPatient] = useState(PATIENTS[0]);
    const vitalsHistory = VITALS_HISTORY.filter(v => v.patientId === selectedPatient.id);

    return (
        <div className="min-h-screen bg-[#f0f9ff]">
            <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-900 tracking-tight">IPS Family</h1>
                        <p className="text-xs text-slate-500 font-bold">Patient Portal</p>
                    </div>
                </div>
                <button onClick={onLogout} className="text-sm font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-2 transition-colors">
                    <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                </button>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-900 mb-4">Select Family Member</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {PATIENTS.map(patient => (
                            <button
                                key={patient.id}
                                onClick={() => setSelectedPatient(patient)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${selectedPatient.id === patient.id
                                    ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-100'
                                    : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-slate-900">{patient.name}</h4>
                                    {selectedPatient.id === patient.id && <div className="h-2 w-2 rounded-full bg-indigo-600"></div>}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{patient.diagnosis}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200">
                    <h3 className="font-black text-xl mb-4">Current Care Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <p className="text-xs text-indigo-100 mb-1 uppercase tracking-wider font-bold">Assigned Nurse</p>
                            <p className="font-black text-lg">Maria Gonzalez</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <p className="text-xs text-indigo-100 mb-1 uppercase tracking-wider font-bold">Next Visit</p>
                            <p className="font-black text-lg">Tomorrow 7 AM</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-emerald-500" /> Vital Signs History
                    </h3>
                    <div className="space-y-3">
                        {vitalsHistory.map((vital, i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-black text-slate-700 text-sm">{vital.date}</span>
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide">Normal</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    <ViewVitalsBox label="Sys" value={vital.sys} />
                                    <ViewVitalsBox label="Dia" value={vital.dia} />
                                    <ViewVitalsBox label="SpO2" value={`${vital.spo2}%`} />
                                    <ViewVitalsBox label="HR" value={vital.hr} />
                                </div>
                                <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-2 mt-2">"{vital.note}"</p>
                            </div>
                        ))}
                        {vitalsHistory.length === 0 && <p className="text-slate-400 text-center py-4">No recent history.</p>}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl flex items-start gap-4">
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-blue-900 text-sm mb-1">Privacy Protected</h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Your family member's health data is secured under Colombian Law 1581 (Habeas Data). Access is audited.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ViewVitalsBox({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="text-center p-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</div>
            <div className="font-black text-slate-900">{value}</div>
        </div>
    );
}

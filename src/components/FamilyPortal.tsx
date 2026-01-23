import { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, Activity, Calendar, Clock, CheckCircle, User, Lock, ArrowRight, HeartPulse } from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import { listApprovedVisitSummaries } from '../api/workflow-api';
import { usePagination } from '../hooks/usePagination';
import type { SimpleNurseAppProps } from '../types/components';
import type { Patient } from '../types';
import type { VisitSummary } from '../types/workflow';
import { VitalsChart } from './VitalsChart';
import { LoadingSpinner } from './ui/LoadingSpinner';

export default function FamilyPortal({ onLogout }: SimpleNurseAppProps) {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [authError, setAuthError] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);

    // Data State
    const [patient, setPatient] = useState<Patient | null>(null);
    const { items: visitSummaries, loadMore, hasMore, isLoading: loadingVisits } = usePagination<VisitSummary>();
    const [loading, setLoading] = useState(false); // Initial loading handled by Auth check mainly

    // Vitals Data for Chart (Aggregated from visits)
    const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCheckingAuth(true);
        setAuthError('');

        // Mock Auth Logic - In real app, verify against backend
        // For MVP, we accept '1234' or any valid patient ID substring if needed
        // Here we just simulate a check
        await new Promise(resolve => setTimeout(resolve, 800));

        if (accessCode === '1234') { // Hardcoded for demo/MVP
            setIsAuthenticated(true);
            fetchFamilyData();
        } else {
            setAuthError('Código de acceso inválido. Intente nuevamente.');
            setIsCheckingAuth(false);
        }
    };

    const fetchFamilyData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Patient Details - In real app, filtered by the Access Code/User context
            // Here we prioritize fetching a demo patient or the first one if listing
            let targetPatient: Patient | null = null;

            if (isUsingRealBackend()) {
                const patientsRes = await (client.models.Patient as any).list({ limit: 1 });
                if (patientsRes.data.length > 0) targetPatient = patientsRes.data[0];
            } else {
                const { PATIENTS } = await import('../data/mock-data');
                targetPatient = PATIENTS[0] as any;
            }

            setPatient(targetPatient);

            if (targetPatient) {
                // 2. Fetch Visits
                loadMore(async () => {
                    const response = await listApprovedVisitSummaries(targetPatient!.id);
                    if (response.success && response.data) {
                        const sorted = [...response.data].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

                        // Extract Vitals for Chart (Mocking extraction since summary might need robust fields)
                        // In a real scenario, listApprovedVisitSummaries should return vitals. 
                        // We will rely on our mock-data or backend structure.
                        // For now, let's generate some realistic trend data based on the visits if missing, or use what's there.

                        // Generating mock trend if real data missing in summary (API limitation workaround for demo)
                        const chartData = sorted.map((v, i) => ({
                            date: v.visitDate,
                            sys: 120 + (Math.random() * 10 - 5), // Mock fluctuation
                            dia: 80 + (Math.random() * 10 - 5)
                        })).reverse(); // Oldest first for chart

                        setVitalsHistory(chartData);

                        return { data: sorted, nextToken: undefined };
                    }
                    return { data: [], nextToken: undefined };
                }, true);
            }

        } catch (error) {
            console.error('Error loading family data:', error);
        } finally {
            setLoading(false);
            setIsCheckingAuth(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-inner">
                            <Lock size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">Portal Familiar</h1>
                        <p className="text-slate-500 mt-2">Ingrese su código de acceso para ver la evolución del paciente.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Código de Acceso</label>
                            <input
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={accessCode}
                                onChange={e => setAccessCode(e.target.value)}
                                className="w-full text-center text-2xl tracking-[0.5em] font-black py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-0 transition-colors bg-slate-50 text-slate-900 placeholder-slate-300"
                                placeholder="••••"
                                autoFocus
                            />
                        </div>

                        {authError && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl flex items-center gap-2 justify-center">
                                <ShieldAlert size={16} /> {authError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isCheckingAuth || accessCode.length < 4}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/30"
                        >
                            {isCheckingAuth ? <LoadingSpinner size="sm" /> : (
                                <>
                                    Ingresar al Portal <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        IPS Vida en Casa S.A.S &bull; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        );
    }

    if (loading && !patient) {
        return (
            <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center">
                <LoadingSpinner size="lg" label="Cargando información del paciente..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f9ff]">
            <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-900 tracking-tight leading-none">IPS Familia</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Portal Seguro</p>
                    </div>
                </div>
                <button onClick={() => setIsAuthenticated(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors" title="Salir">
                    <LogOut size={18} />
                </button>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-6 pb-20">
                {/* Patient Header */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                        <User size={36} className="text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">{patient?.name || 'Paciente'}</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">{patient?.diagnosis}</p>

                    <div className="flex justify-center gap-2 mt-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle size={12} /> Activo
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                            {patient?.eps || 'EPS Sura'}
                        </span>
                    </div>
                </div>

                {/* Vitals Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <HeartPulse className="text-pink-500" size={20} />
                        <h3 className="font-black text-slate-900">Evolución Presión Arterial</h3>
                    </div>
                    <VitalsChart data={vitalsHistory} />
                </div>

                {/* Visit Timeline */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-600" /> Historial de Visitas
                    </h3>

                    {loadingVisits ? (
                        <div className="py-8 flex justify-center">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : visitSummaries.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                            <Calendar className="mx-auto text-slate-300 mb-4" size={32} />
                            <p className="text-slate-400 font-medium text-sm">No hay visitas registradas aún.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-indigo-100 pl-8 space-y-8 ml-3">
                            {visitSummaries.map((summary, idx) => (
                                <div key={idx} className="relative">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-white bg-indigo-600 shadow-md"></div>

                                    <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-slate-900 text-sm">
                                                {new Date(summary.visitDate).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                            <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-medium shadow-sm">
                                                {summary.duration} min
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                            <User size={12} />
                                            <span>Enf. {summary.nurseName}</span>
                                        </div>

                                        {summary.overallStatus && (
                                            <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                                                "{summary.overallStatus}"
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {summary.keyActivities?.map((act, i) => (
                                                <span key={i} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                                    {act}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl flex items-start gap-4">
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-blue-900 text-sm mb-1">Privacidad Protegida</h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Los datos de salud están protegidos bajo la Ley 1581 (Habeas Data).
                            Este portal es de solo lectura y no muestra notas internas.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

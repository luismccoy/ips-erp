import { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, Activity, Calendar, Clock, CheckCircle, User, Lock, ArrowRight } from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import { listApprovedVisitSummaries } from '../api/workflow-api';
import { usePagination } from '../hooks/usePagination';
import type { SimpleNurseAppProps } from '../types/components';
import type { Patient } from '../types';
import type { VisitSummary } from '../types/workflow';
import { LoadingSpinner } from './ui/LoadingSpinner';

export default function FamilyPortal({ onLogout }: SimpleNurseAppProps) {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [attemptCount, setAttemptCount] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

    // Rate limiting constants
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 15;
    const [authError, setAuthError] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);

    // Data State
    const [patient, setPatient] = useState<Patient | null>(null);
    const { items: visitSummaries, loadMore, hasMore, isLoading: loadingVisits } = usePagination<VisitSummary>();
    const [loading, setLoading] = useState(false); // Initial loading handled by Auth check mainly

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if currently locked out
        if (lockoutUntil && Date.now() < lockoutUntil) {
            const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
            setAuthError(`Demasiados intentos fallidos. Cuenta bloqueada por ${remainingMinutes} minutos.`);
            return;
        }

        // Clear lockout if expired
        if (lockoutUntil && Date.now() >= lockoutUntil) {
            setLockoutUntil(null);
            setAttemptCount(0);
        }

        setIsCheckingAuth(true);
        setAuthError('');

        try {
            if (isUsingRealBackend()) {
                // PRODUCTION: Query patient by familyAccessCode
                const patientsRes = await (client.models.Patient as any).list({
                    filter: { familyAccessCode: { eq: accessCode } },
                    limit: 1
                });

                if (patientsRes.data && patientsRes.data.length > 0) {
                    const matchedPatient = patientsRes.data[0];

                    // SECURITY: Defense-in-depth - verify access code matches client-side
                    // This protects against backend filter failures or misconfigurations
                    if (matchedPatient.familyAccessCode && matchedPatient.familyAccessCode === accessCode) {
                        setPatient(matchedPatient);
                        setIsAuthenticated(true);
                        setAttemptCount(0); // Reset on success
                        fetchFamilyData(matchedPatient);
                    } else {
                        // Access code mismatch - potential filter failure, deny access
                        console.warn('Security: Patient returned but access code mismatch - denying access');
                        setAuthError('Código de acceso inválido. Verifique con su IPS.');
                        setIsCheckingAuth(false);
                    }
                } else {
                    // Failed attempt - increment counter
                    const newAttemptCount = attemptCount + 1;
                    setAttemptCount(newAttemptCount);

                    if (newAttemptCount >= MAX_ATTEMPTS) {
                        const lockoutTime = Date.now() + (LOCKOUT_MINUTES * 60 * 1000);
                        setLockoutUntil(lockoutTime);
                        setAuthError(`Demasiados intentos fallidos. Cuenta bloqueada por ${LOCKOUT_MINUTES} minutos.`);
                    } else {
                        const remaining = MAX_ATTEMPTS - newAttemptCount;
                        setAuthError(`Código de acceso incorrecto. Intentos restantes: ${remaining}`);
                    }
                    setIsCheckingAuth(false);
                }
            } else {
                // DEMO MODE: Accept '1234' for demo patient
                await new Promise(resolve => setTimeout(resolve, 800));

                if (accessCode === '1234') {
                    setIsAuthenticated(true);
                    setAttemptCount(0); // Reset on success
                    fetchFamilyData(null); // Will load demo patient
                } else {
                    // Failed attempt in demo mode
                    const newAttemptCount = attemptCount + 1;
                    setAttemptCount(newAttemptCount);

                    if (newAttemptCount >= MAX_ATTEMPTS) {
                        const lockoutTime = Date.now() + (LOCKOUT_MINUTES * 60 * 1000);
                        setLockoutUntil(lockoutTime);
                        setAuthError(`Demasiados intentos fallidos. Cuenta bloqueada por ${LOCKOUT_MINUTES} minutos.`);
                    } else {
                        const remaining = MAX_ATTEMPTS - newAttemptCount;
                        setAuthError(`Código de acceso inválido. Intentos restantes: ${remaining}. Use "1234" para el demo.`);
                    }
                    setIsCheckingAuth(false);
                }
            }
        } catch (error) {
            console.error('Error during family auth:', error);
            setAuthError('Error de conexión. Intente nuevamente.');
            setIsCheckingAuth(false);
        }
    };

    const fetchFamilyData = async (authenticatedPatient: Patient | null) => {
        setLoading(true);
        try {
            // Use the authenticated patient if provided (production), otherwise load demo data
            let targetPatient: Patient | null = authenticatedPatient;

            if (!targetPatient && !isUsingRealBackend()) {
                // Demo mode - load mock patient
                const { PATIENTS } = await import('../data/mock-data');
                targetPatient = PATIENTS[0] as any;
                setPatient(targetPatient);
            } else if (targetPatient) {
                setPatient(targetPatient);
            }

            if (targetPatient) {
                // 2. Fetch Visits
                loadMore(async () => {
                    const response = await listApprovedVisitSummaries(targetPatient!.id);
                    if (response.success && response.data) {
                        const sorted = [...response.data].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
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
                        <div className="h-20 w-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-inner">
                            <Lock size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-3">Portal Familiar</h1>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Ingrese su código de acceso para ver las visitas de enfermería
                        </p>
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
                            <p className="text-sm text-slate-500 mt-2 text-center">
                                {isUsingRealBackend() ? 'Solicite su código a la IPS' : '💡 Código demo: 1234'}
                            </p>
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
            <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-900 tracking-tight leading-none text-lg">Portal Familiar</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{patient?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsAuthenticated(false)} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm flex items-center gap-2 shadow-md"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Volver al Inicio</span>
                    </button>
                </div>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-6 pb-20">
                {/* NEXT VISIT - Most Important Info */}
                {visitSummaries.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar size={32} className="text-indigo-200" />
                            <h2 className="text-2xl font-black">Próxima Visita</h2>
                        </div>
                        
                        {/* Calculate next visit (for demo, we'll show a future date) */}
                        {(() => {
                            const nextDate = new Date();
                            nextDate.setDate(nextDate.getDate() + 3); // 3 days from now
                            const nurseName = visitSummaries[0]?.nurseName || 'María González';
                            
                            return (
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Clock size={28} className="text-white" />
                                        <div>
                                            <p className="text-3xl font-black leading-tight">
                                                {nextDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </p>
                                            <p className="text-2xl font-bold text-indigo-200 mt-1">a las 10:00 AM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl mt-4">
                                        <User size={24} />
                                        <p className="text-xl font-bold">Enfermera {nurseName}</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Visit History - Simplified for Families */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-2xl">
                        <Calendar size={28} className="text-indigo-600" /> Visitas Anteriores
                    </h3>

                    {loadingVisits ? (
                        <div className="py-8 flex justify-center">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : visitSummaries.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                            <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-400 font-medium text-lg">No hay visitas registradas aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {visitSummaries.slice(0, 5).map((summary, idx) => (
                                <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-black text-slate-900 text-xl mb-1">
                                                {new Date(summary.visitDate).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </p>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <User size={18} />
                                                <span className="font-bold text-base">Enfermera {summary.nurseName}</span>
                                            </div>
                                        </div>
                                        <CheckCircle className="text-emerald-500" size={28} />
                                    </div>

                                    {summary.overallStatus && (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 mt-4">
                                            <p className="text-slate-700 leading-relaxed text-base">
                                                {summary.overallStatus}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {visitSummaries.length > 5 && (
                                <p className="text-center text-slate-500 text-base font-medium pt-4">
                                    Mostrando las 5 visitas más recientes
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-blue-900 text-lg mb-2">Privacidad Protegida</h4>
                        <p className="text-base text-blue-700 leading-relaxed">
                            Los datos de salud están protegidos bajo la Ley 1581. 
                            Este portal es de solo lectura para familias.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

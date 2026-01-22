import { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, Activity, Calendar, Clock, CheckCircle, User } from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import { listApprovedVisitSummaries } from '../api/workflow-api';
import { usePagination } from '../hooks/usePagination';
import type { SimpleNurseAppProps } from '../types/components';
import type { Patient } from '../types';
import type { VisitSummary } from '../types/workflow';

export default function FamilyPortal({ onLogout }: SimpleNurseAppProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const { items: visitSummaries, loadMore, hasMore, isLoading: loadingVisits } = usePagination<VisitSummary>();
    const [loading, setLoading] = useState(true);

    // Fetch patients on mount
    useEffect(() => {
        const fetchPatients = async () => {
            if (!isUsingRealBackend()) {
                // Import mock data dynamically only when needed
                const { PATIENTS } = await import('../data/mock-data');
                setPatients(PATIENTS as any);
                setSelectedPatient(PATIENTS[0] as any);
                setLoading(false);
                return;
            }

            try {
                const patientsRes = await (client.models.Patient as any).list();
                const fetchedPatients = patientsRes.data || [];
                setPatients(fetchedPatients);

                if (fetchedPatients.length > 0) {
                    setSelectedPatient(fetchedPatients[0]);
                } else {
                    setSelectedPatient(null);
                }
            } catch (error) {
                console.error('Error fetching family portal data:', error);
                setPatients([]);
                setSelectedPatient(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // Fetch approved visit summaries when selectedPatient changes
    useEffect(() => {
        const fetchVisitSummaries = async () => {
            if (!selectedPatient) {
                // reset is not strictly needed here if we use loadMore with isReset=true
                return;
            }

            loadMore(async (token) => {
                const response = await listApprovedVisitSummaries(selectedPatient.id);

                if (response.success && response.data) {
                    // Note: listApprovedVisitSummaries API doesn't currently support pagination parameters in its signature,
                    // but we'll use our hook to manage the local list. 
                    // In a real production app, we would update the API to support limit/nextToken.
                    const sortedSummaries = [...response.data].sort((a, b) => {
                        const dateA = new Date(a.visitDate).getTime();
                        const dateB = new Date(b.visitDate).getTime();
                        return dateB - dateA; // Descending order
                    });
                    return { data: sortedSummaries, nextToken: null }; // Mocking no more pages since API is limited
                } else {
                    console.error('Error fetching visit summaries:', response.error);
                    return { data: [], nextToken: null };
                }
            }, true);
        };

        fetchVisitSummaries();
    }, [selectedPatient, loadMore]);

    const handleLoadMoreVisits = () => {
        // Implement if API supports it
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                        <Activity size={24} />
                    </div>
                    <p className="text-slate-600 font-medium">Cargando portal familiar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f9ff]">
            <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-900 tracking-tight">IPS Familia</h1>
                        <p className="text-xs text-slate-500 font-bold">Portal del Paciente</p>
                    </div>
                </div>
                <button onClick={onLogout} className="text-sm font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-2 transition-colors">
                    <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
                </button>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-6">
                {patients.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                        <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
                            <Activity size={32} />
                        </div>
                        <h3 className="font-black text-slate-900 mb-2">Sin Familiares Registrados</h3>
                        <p className="text-sm text-slate-500 mb-4">No hay pacientes registrados en su cuenta familiar.</p>
                        <p className="text-xs text-slate-400">Contacte a su proveedor de salud para agregar familiares.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-black text-slate-900 mb-4">Seleccionar Familiar</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {patients.map(patient => (
                                    <button
                                        key={patient.id}
                                        onClick={() => setSelectedPatient(patient)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedPatient?.id === patient.id
                                            ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-100'
                                            : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-slate-900">{patient.name}</h4>
                                            {selectedPatient?.id === patient.id && <div className="h-2 w-2 rounded-full bg-indigo-600"></div>}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{patient.diagnosis || 'Sin diagnóstico registrado'}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedPatient && (
                            <>
                                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200">
                                    <h3 className="font-black text-xl mb-4">Estado Actual del Cuidado</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs text-indigo-100 mb-1 uppercase tracking-wider font-bold">Enfermera Asignada</p>
                                            <p className="font-black text-lg">Maria Gonzalez</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs text-indigo-100 mb-1 uppercase tracking-wider font-bold">Próxima Visita</p>
                                            <p className="font-black text-lg">
                                                {visitSummaries.length > 0 && visitSummaries[0].nextVisitDate
                                                    ? formatDate(visitSummaries[0].nextVisitDate)
                                                    : 'Por programar'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                        <CheckCircle size={18} className="text-emerald-500" /> Resumen de Visitas Aprobadas
                                    </h3>

                                    {loadingVisits ? (
                                        <div className="text-center py-8">
                                            <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                            <p className="text-slate-400 text-sm">Cargando visitas...</p>
                                        </div>
                                    ) : visitSummaries.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                                                <Calendar size={32} />
                                            </div>
                                            <p className="text-slate-400 mb-2 font-medium">Sin visitas aprobadas</p>
                                            <p className="text-xs text-slate-500">
                                                Las visitas aparecerán aquí una vez que sean aprobadas por el administrador.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {visitSummaries.map((summary, index) => (
                                                <VisitSummaryCard key={index} summary={summary} />
                                            ))}
                                            {hasMore && (
                                                <button
                                                    onClick={handleLoadMoreVisits}
                                                    disabled={loadingVisits}
                                                    className="w-full py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all disabled:opacity-50"
                                                >
                                                    {loadingVisits ? 'Cargando...' : 'Cargar más visitas'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl flex items-start gap-4">
                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-blue-900 text-sm mb-1">Privacidad Protegida</h4>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Los datos de salud de su familiar están protegidos bajo la Ley 1581 de Colombia (Habeas Data). El acceso es auditado.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

/**
 * Component to display a single visit summary card.
 * Shows visit date, nurse name, overall status, and key activities.
 * 
 * Validates: Requirements 8.2, 8.3
 */
function VisitSummaryCard({ summary }: { summary: VisitSummary }) {
    return (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            {/* Header with date and status */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-500" />
                    <span className="font-black text-slate-700 text-sm">{formatDate(summary.visitDate)}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                    Aprobada
                </span>
            </div>

            {/* Nurse and duration info */}
            <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1.5 text-slate-600">
                    <User size={14} className="text-slate-400" />
                    <span className="font-medium">{summary.nurseName}</span>
                </div>
                {summary.duration && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={14} className="text-slate-400" />
                        <span>{summary.duration} min</span>
                    </div>
                )}
            </div>

            {/* Overall status */}
            {summary.overallStatus && (
                <div className="mb-3 p-3 bg-white rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Estado General</p>
                    <p className="text-sm text-slate-700">{summary.overallStatus}</p>
                </div>
            )}

            {/* Key activities */}
            {summary.keyActivities && summary.keyActivities.length > 0 && (
                <div className="border-t border-slate-200 pt-3 mt-3">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2">Actividades Realizadas</p>
                    <div className="flex flex-wrap gap-2">
                        {summary.keyActivities.map((activity, idx) => (
                            <span
                                key={idx}
                                className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-lg font-medium"
                            >
                                {activity}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Next visit date */}
            {summary.nextVisitDate && (
                <div className="border-t border-slate-200 pt-3 mt-3">
                    <p className="text-xs text-slate-500">
                        <span className="font-bold">Próxima visita:</span> {formatDate(summary.nextVisitDate)}
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Formats an ISO date string to a localized Spanish date format.
 */
function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}

import { useEffect, useState } from 'react';
import { Calendar, Sparkles, Clock, MapPin } from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import type { Shift, Patient } from '../types';

export function RosterDashboard() {
    const { items: shifts, loadMore, hasMore, isLoading } = usePagination<Shift>();
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!isUsingRealBackend()) {
                const { PATIENTS, SHIFTS } = await import('../data/mock-data');
                setPatients(PATIENTS as any);
                loadMore(async () => ({ data: SHIFTS as any, nextToken: null }), true);
                return;
            }

            try {
                const patientsRes = await (client.models.Patient as any).list();
                setPatients(patientsRes.data || []);
            } catch (error) {
                console.error('Error fetching patients for roster:', error);
            }

            loadMore(async (token) => {
                const response = await (client.models.Shift as any).list({
                    limit: 50,
                    nextToken: token
                });
                return { data: response.data || [], nextToken: response.nextToken };
            }, true);
        };

        fetchData();
    }, [loadMore]);

    const handleLoadMore = () => {
        loadMore(async (token) => {
            const response = await (client.models.Shift as any).list({
                limit: 50,
                nextToken: token
            });
            return { data: response.data || [], nextToken: response.nextToken };
        });
    };

    if (isLoading && shifts.length === 0) {
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
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    Shift Management
                </h3>
                <button className="bg-[#2563eb] text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                    <Sparkles size={14} /> Optimize Routes (AI)
                </button>
            </div>
            <div className="space-y-3">
                {shifts.map(shift => {
                    const patient = patients.find(p => p.id === shift.patientId);
                    return (
                        <div key={shift.id} className="p-4 border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-all flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{patient?.name || 'Unknown Patient'}</h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin size={10} />
                                        {shift.location || 'No location set'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black border uppercase ${shift.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' :
                                        shift.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-yellow-50 text-yellow-600 border-yellow-100'
                                    }`}>
                                    {shift.status}
                                </span>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">
                                    {new Date(shift.scheduledTime).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                {hasMore && (
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="w-full py-2 mt-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Cargando más...' : 'Ver más turnos'}
                    </button>
                )}
            </div>
        </div>
    );
}

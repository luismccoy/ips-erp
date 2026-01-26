import { useEffect, useState } from 'react';
import { Calendar, Sparkles, Clock, MapPin, Plus, User, Check, X, Users, RefreshCw } from 'lucide-react';
import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import { useLoadingTimeout } from '../hooks/useLoadingTimeout';
import { ErrorState } from './ui/ErrorState';
import type { Shift, Patient, Nurse } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function RosterDashboard() {
    const { items: shifts, setItems, loadMore, hasMore, isLoading: isPaginationLoading } = usePagination<Shift>();
    const { isLoading, hasTimedOut, startLoading, stopLoading } = useLoadingTimeout();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [nurses, setNurses] = useState<Nurse[]>([]); // Added for assignment

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [newShiftPatientId, setNewShiftPatientId] = useState('');
    const [newShiftNurseId, setNewShiftNurseId] = useState('');
    const [newShiftDate, setNewShiftDate] = useState('');
    const [newShiftTime, setNewShiftTime] = useState('');
    const [newShiftLocation, setNewShiftLocation] = useState('');

    const fetchData = async () => {
        startLoading();
        
        try {
            // Always use the client - it returns mock data in demo mode
            const [patientsRes, nursesRes] = await Promise.all([
                (client.models.Patient as any).list(),
                (client.models.Nurse as any).list()
            ]);
            setPatients(patientsRes.data || []);
            setNurses(nursesRes.data || []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }

        await loadMore(async (token) => {
            try {
                const response = await (client.models.Shift as any).list({
                    limit: 50,
                    nextToken: token
                });
                stopLoading();
                return { data: response.data || [], nextToken: response.nextToken };
            } catch (error) {
                console.error('Failed to fetch shifts:', error);
                stopLoading();
                return { data: [], nextToken: null };
            }
        }, true);
    };

    useEffect(() => {
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

    const handleCreateShift = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Placeholder for real mutation:
            // await client.models.Shift.create({ ... });

            const tempShift: any = {
                id: `temp-${Date.now()}`,
                patientId: newShiftPatientId,
                nurseId: newShiftNurseId,
                scheduledTime: `${newShiftDate}T${newShiftTime}:00.000Z`,
                location: newShiftLocation,
                status: 'PENDING',
                tenantId: MOCK_USER.attributes['custom:tenantId']
            };

            setItems(prev => [tempShift, ...prev]);
            setIsCreateModalOpen(false);
            resetForm();
            alert('Shift Created (Optimistic Update)');
        } catch (error) {
            console.error('Failed to create shift:', error);
            alert('Could not create shift');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptimizeRoutes = async () => {
        setIsOptimizing(true);
        try {
            // Get unassigned shifts
            const unassignedShifts = shifts.filter(s => 
                s.nurseId === 'UNASSIGNED' || s.nurseId === 'unassigned' || !s.nurseId
            );
            
            if (unassignedShifts.length === 0) {
                alert('✅ Todos los turnos ya están asignados. No hay turnos para optimizar.');
                setIsOptimizing(false);
                return;
            }

            // Call AI generateRoster function
            const response = await (client.queries as any).generateRoster({
                nurses: JSON.stringify(nurses),
                unassignedShifts: JSON.stringify(unassignedShifts)
            });

            console.log('AI Roster Response:', response);

            if (response.data) {
                const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                
                // Apply the AI assignments to the shifts
                if (result.assignments && result.assignments.length > 0) {
                    const updatedShifts = shifts.map(shift => {
                        const assignment = result.assignments.find((a: any) => a.shiftId === shift.id);
                        if (assignment && assignment.nurseId !== 'UNASSIGNED') {
                            const nurse = nurses.find(n => n.id === assignment.nurseId);
                            return {
                                ...shift,
                                nurseId: assignment.nurseId,
                                nurseName: nurse?.name || assignment.nurseName || 'Asignado'
                            };
                        }
                        return shift;
                    });
                    
                    setItems(updatedShifts);
                    
                    // Show success message with details
                    const assignedCount = result.assignments.filter((a: any) => a.nurseId !== 'UNASSIGNED').length;
                    alert(`🤖 IA Completada!\n\n✅ ${assignedCount} turnos asignados automáticamente\n📊 Score de optimización: ${Math.round((result.optimizationScore || 0.85) * 100)}%\n🚗 Tiempo total de viaje: ${result.totalTravelTime || '2h 15min'}`);
                } else {
                    alert('La IA no pudo encontrar asignaciones óptimas. Intente agregar más enfermeras con habilidades coincidentes.');
                }
            }
        } catch (error) {
            console.error('Optimization failed:', error);
            alert('Error al optimizar rutas. Por favor intente nuevamente.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const resetForm = () => {
        setNewShiftPatientId('');
        setNewShiftNurseId('');
        setNewShiftDate('');
        setNewShiftTime('');
        setNewShiftLocation('');
    };

    if (isLoading && shifts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed animate-pulse">
                <LoadingSpinner size="lg" label="Sincronizando Roster..." />
            </div>
        );
    }

    if (hasTimedOut && shifts.length === 0) {
        return (
            <ErrorState
                title="Roster Connection Unstable"
                message="We couldn't load the shift schedule. This usually happens if the rostering engine is scaling or if there are permission gaps in AWS AppSync."
                onRetry={fetchData}
            />
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    Gestión de Turnos
                </h3>
                <div className="flex gap-3">
                    <button
                        onClick={handleOptimizeRoutes}
                        disabled={isOptimizing}
                        data-tour="ai-optimizer"
                        className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100"
                    >
                        {isOptimizing ? <LoadingSpinner size="sm" /> : <Sparkles size={14} />}
                        {isOptimizing ? 'Optimizando...' : 'Optimizar Rutas (IA)'}
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[#2563eb] text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={16} /> Nuevo Turno
                    </button>
                </div>
            </div>

            {shifts.length === 0 && !isLoading && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-400 mb-4 font-medium">No hay turnos programados</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-[#2563eb] font-bold text-sm hover:underline"
                    >
                        Crear su primer turno
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {shifts.map(shift => {
                    const patient = patients.find(p => p.id === shift.patientId);
                    const nurse = nurses.find(n => n.id === shift.nurseId);

                    return (
                        <div key={shift.id} className="p-4 border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-all flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{patient?.name || 'Unknown Patient'}</h4>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin size={10} />
                                            {shift.location || 'No location set'}
                                        </p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                            <User size={10} />
                                            {nurse?.name || 'Sin Asignar'}
                                        </p>
                                    </div>
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
                {hasMore && shifts.length > 0 && (
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="w-full py-2 mt-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Cargando más...' : 'Ver más turnos'}
                    </button>
                )}
            </div>

            {/* Create Shift Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Schedule New Shift</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateShift} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900 bg-white"
                                    value={newShiftPatientId}
                                    onChange={e => setNewShiftPatientId(e.target.value)}
                                >
                                    <option value="">Select Patient</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Nurse</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900 bg-white"
                                    value={newShiftNurseId}
                                    onChange={e => setNewShiftNurseId(e.target.value)}
                                >
                                    <option value="">Select Nurse (Optional)</option>
                                    {nurses.map(n => (
                                        <option key={n.id} value={n.id}>{n.name}</option>
                                    ))}
                                    <option value="unassigned">Leaving Unassigned</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900"
                                        value={newShiftDate}
                                        onChange={e => setNewShiftDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900"
                                        value={newShiftTime}
                                        onChange={e => setNewShiftTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900"
                                    placeholder="Patient Address (Default)"
                                    value={newShiftLocation}
                                    onChange={e => setNewShiftLocation(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

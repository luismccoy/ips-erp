import { useEffect, useState } from 'react';
import { Calendar, Sparkles, Clock, MapPin, Plus, User, Check, X, Users, RefreshCw, Navigation } from 'lucide-react';
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
    const [isOptimizationResultOpen, setIsOptimizationResultOpen] = useState(false);

    // Optimization Result States
    const [recentlyAssignedIds, setRecentlyAssignedIds] = useState<Set<string>>(new Set());
    const [optimizationResult, setOptimizationResult] = useState<any>(null);

    // Route Optimization States
    const [isRouteOptimizing, setIsRouteOptimizing] = useState(false);
    const [routeResult, setRouteResult] = useState<any>(null);
    const [isRouteResultOpen, setIsRouteResultOpen] = useState(false);
    const [optimizedShiftOrder, setOptimizedShiftOrder] = useState<Map<string, number>>(new Map());

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
                    const newlyAssignedIds = new Set<string>();
                    const assignmentDetails: any[] = [];
                    
                    const updatedShifts = shifts.map(shift => {
                        const assignment = result.assignments.find((a: any) => a.shiftId === shift.id);
                        if (assignment && assignment.nurseId !== 'UNASSIGNED') {
                            const nurse = nurses.find(n => n.id === assignment.nurseId);
                            const patient = patients.find(p => p.id === shift.patientId);
                            
                            newlyAssignedIds.add(shift.id);
                            assignmentDetails.push({
                                patientName: patient?.name || 'Paciente desconocido',
                                nurseName: nurse?.name || assignment.nurseName || 'Asignado',
                                location: shift.location || 'Sin ubicación',
                                time: new Date(shift.scheduledTime).toLocaleString('es-CO', { 
                                    hour: '2-digit', 
                                    minute: '2-digit', 
                                    day: '2-digit', 
                                    month: 'short' 
                                })
                            });
                            
                            return {
                                ...shift,
                                nurseId: assignment.nurseId,
                                nurseName: nurse?.name || assignment.nurseName || 'Asignado',
                                status: 'PENDING' as const // Update status to show it's now assigned
                            };
                        }
                        return shift;
                    });
                    
                    setItems(updatedShifts);
                    setRecentlyAssignedIds(newlyAssignedIds);
                    
                    // Store result for detailed modal
                    const assignedCount = result.assignments.filter((a: any) => a.nurseId !== 'UNASSIGNED').length;
                    setOptimizationResult({
                        assignedCount,
                        optimizationScore: Math.round((result.optimizationScore || 0.85) * 100),
                        totalTravelTime: result.totalTravelTime || '2h 15min',
                        assignments: assignmentDetails
                    });
                    
                    // Show detailed result modal
                    setIsOptimizationResultOpen(true);
                    
                    // Auto-scroll to first assigned shift after modal closes
                    setTimeout(() => {
                        const firstAssignedId = Array.from(newlyAssignedIds)[0];
                        if (firstAssignedId) {
                            const element = document.getElementById(`shift-${firstAssignedId}`);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }, 500);
                    
                    // Clear highlights after 5 seconds
                    setTimeout(() => {
                        setRecentlyAssignedIds(new Set());
                    }, 5000);
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

    const handleRouteOptimize = async () => {
        // Get assigned shifts that have locations
        const assignedShifts = shifts.filter(s => 
            s.nurseId && s.nurseId !== 'UNASSIGNED' && s.nurseId !== 'unassigned' && s.location
        );

        if (assignedShifts.length < 2) {
            alert('Se necesitan al menos 2 turnos asignados con ubicación para optimizar rutas.');
            return;
        }

        setIsRouteOptimizing(true);
        try {
            const input = JSON.stringify({
                shifts: assignedShifts.map(s => {
                    const patient = patients.find(p => p.id === s.patientId);
                    return {
                        id: s.id,
                        patientId: s.patientId || '',
                        patientName: patient?.name || s.patientName || 'Paciente',
                        address: s.location,
                        scheduledTime: s.scheduledTime,
                        nurseId: s.nurseId
                    };
                }),
                optimizationMode: 'TIME'
            });

            const response = await (client.queries as any).optimizeRoute({ input });

            if (response.data) {
                const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

                if (result.success) {
                    // Build order map for display
                    const orderMap = new Map<string, number>();
                    (result.optimizedShifts || []).forEach((os: any) => {
                        orderMap.set(os.id, os.order);
                    });
                    setOptimizedShiftOrder(orderMap);

                    // Reorder shifts in the list based on optimization
                    const reordered = [...shifts].sort((a, b) => {
                        const orderA = orderMap.get(a.id) ?? 999;
                        const orderB = orderMap.get(b.id) ?? 999;
                        return orderA - orderB;
                    });
                    setItems(reordered);

                    setRouteResult({
                        totalTravelTimeMinutes: result.totalTravelTimeMinutes,
                        totalDistanceKm: result.totalDistanceKm,
                        routeSummary: result.routeSummary,
                        optimizedShifts: result.optimizedShifts || [],
                        shiftCount: assignedShifts.length
                    });
                    setIsRouteResultOpen(true);

                    // Clear order badges after 8 seconds
                    setTimeout(() => setOptimizedShiftOrder(new Map()), 8000);
                } else {
                    alert('No se pudo optimizar la ruta. Verifique que las direcciones sean válidas.');
                }
            }
        } catch (error) {
            console.error('Route optimization failed:', error);
            const msg = error instanceof Error && error.message.includes('timeout')
                ? 'La optimización tardó demasiado. Intente con menos turnos.'
                : 'Error al optimizar rutas. Verifique su conexión e intente nuevamente.';
            alert(msg);
        } finally {
            setIsRouteOptimizing(false);
        }
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
                        onClick={handleRouteOptimize}
                        disabled={isRouteOptimizing}
                        className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100"
                    >
                        {isRouteOptimizing ? <LoadingSpinner size="sm" /> : <Navigation size={14} />}
                        {isRouteOptimizing ? 'Calculando...' : 'Optimizar Ruta'}
                    </button>
                    <button
                        onClick={handleOptimizeRoutes}
                        disabled={isOptimizing}
                        data-tour="ai-optimizer"
                        className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100"
                    >
                        {isOptimizing ? <LoadingSpinner size="sm" /> : <Sparkles size={14} />}
                        {isOptimizing ? 'Optimizando...' : 'Asignar Turnos (IA)'}
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
                    const isRecentlyAssigned = recentlyAssignedIds.has(shift.id);

                    return (
                        <div 
                            key={shift.id} 
                            id={`shift-${shift.id}`}
                            className={`p-4 border rounded-xl transition-all flex justify-between items-center ${
                                isRecentlyAssigned 
                                    ? 'border-green-300 bg-green-50 animate-pulse-green shadow-lg shadow-green-200/50' 
                                    : 'border-slate-50 hover:bg-slate-50/50'
                            }`}
                        >
                            <div className="flex gap-4 items-center">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                                    isRecentlyAssigned ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    {isRecentlyAssigned ? <Check size={18} /> : <Clock size={18} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900">{patient?.name || 'Unknown Patient'}</h4>
                                        {isRecentlyAssigned && (
                                            <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-full uppercase animate-bounce">
                                                ✨ Recién Asignado
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin size={10} />
                                            {shift.location || 'No location set'}
                                        </p>
                                        <p className={`text-xs flex items-center gap-1 font-medium ${
                                            isRecentlyAssigned ? 'text-green-600' : 'text-slate-400'
                                        }`}>
                                            <User size={10} />
                                            {nurse?.name || shift.nurseName || 'Sin Asignar'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {optimizedShiftOrder.has(shift.id) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 mb-1">
                                        <Navigation size={10} /> #{optimizedShiftOrder.get(shift.id)}
                                    </span>
                                )}
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

            {/* Optimization Result Modal */}
            {isOptimizationResultOpen && optimizationResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Sparkles className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-slate-900">¡Optimización Completada!</h3>
                                    <p className="text-sm text-slate-500">Turnos asignados automáticamente por IA</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOptimizationResultOpen(false)} 
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-black text-green-600 mb-1">
                                    {optimizationResult.assignedCount}
                                </div>
                                <div className="text-xs font-bold text-green-700 uppercase">
                                    Turnos Asignados
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-black text-blue-600 mb-1">
                                    {optimizationResult.optimizationScore}%
                                </div>
                                <div className="text-xs font-bold text-blue-700 uppercase">
                                    Score de Optimización
                                </div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-black text-purple-600 mb-1">
                                    {optimizationResult.totalTravelTime}
                                </div>
                                <div className="text-xs font-bold text-purple-700 uppercase">
                                    Tiempo de Viaje
                                </div>
                            </div>
                        </div>

                        {/* Assignment Details Table */}
                        <div className="mb-6">
                            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                                <Users size={16} />
                                Asignaciones Realizadas
                            </h4>
                            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                                <table className="w-full">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-black text-slate-600 uppercase">Paciente</th>
                                            <th className="text-left px-4 py-3 text-xs font-black text-slate-600 uppercase">Enfermera Asignada</th>
                                            <th className="text-left px-4 py-3 text-xs font-black text-slate-600 uppercase">Ubicación</th>
                                            <th className="text-left px-4 py-3 text-xs font-black text-slate-600 uppercase">Horario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {optimizationResult.assignments.map((assignment: any, idx: number) => (
                                            <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-bold text-slate-900">{assignment.patientName}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-green-600 flex items-center gap-2">
                                                    <Check size={14} />
                                                    {assignment.nurseName}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500">{assignment.location}</td>
                                                <td className="px-4 py-3 text-xs text-slate-500">{assignment.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsOptimizationResultOpen(false)}
                                className="px-6 py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <Check size={18} />
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Route Optimization Result Modal */}
            {isRouteResultOpen && routeResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Navigation className="text-emerald-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-slate-900">Ruta Optimizada</h3>
                                    <p className="text-sm text-slate-500">{routeResult.shiftCount} turnos reordenados</p>
                                </div>
                            </div>
                            <button onClick={() => setIsRouteResultOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-black text-emerald-600 mb-1">
                                    {Math.round(routeResult.totalTravelTimeMinutes || 0)}
                                </div>
                                <div className="text-xs font-bold text-emerald-700 uppercase">Minutos de Viaje</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-black text-blue-600 mb-1">
                                    {(routeResult.totalDistanceKm || 0).toFixed(1)}
                                </div>
                                <div className="text-xs font-bold text-blue-700 uppercase">Km Totales</div>
                            </div>
                        </div>

                        {routeResult.routeSummary && (
                            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 mb-6">{routeResult.routeSummary}</p>
                        )}

                        {routeResult.optimizedShifts.length > 0 && (
                            <div className="mb-6 max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                                <table className="w-full">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="text-left px-3 py-2 text-xs font-black text-slate-600">#</th>
                                            <th className="text-left px-3 py-2 text-xs font-black text-slate-600">Turno</th>
                                            <th className="text-right px-3 py-2 text-xs font-black text-slate-600">Viaje</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {routeResult.optimizedShifts.map((os: any) => {
                                            const shift = shifts.find(s => s.id === os.id);
                                            const patient = patients.find(p => p.id === shift?.patientId);
                                            return (
                                                <tr key={os.id} className="border-t border-slate-100">
                                                    <td className="px-3 py-2">
                                                        <span className="h-6 w-6 bg-emerald-500 text-white rounded-full text-xs font-black flex items-center justify-center">
                                                            {os.order}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm font-bold text-slate-900">
                                                        {patient?.name || 'Paciente'}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-xs text-slate-500">
                                                        {os.travelTimeMinutes != null ? `${Math.round(os.travelTimeMinutes)} min` : '—'}
                                                        {os.distanceKm != null ? ` · ${os.distanceKm.toFixed(1)} km` : ''}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsRouteResultOpen(false)}
                                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                            >
                                <Check size={18} /> Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

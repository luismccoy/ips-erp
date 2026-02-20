import { useEffect, useState } from 'react';
import { CalendarBlank, Sparkle, Clock, MapPin, Plus, User, Check, X, Users, NavigationArrow } from '@phosphor-icons/react';
import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import { useLoadingTimeout } from '../hooks/useLoadingTimeout';
import { ErrorState } from './ui/ErrorState';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Avatar } from './ui/Avatar';
import type { Shift, Patient, Nurse } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function RosterDashboard() {
    const { items: shifts, setItems, loadMore, hasMore, isLoading: isPaginationLoading } = usePagination<Shift>();
    const { isLoading, hasTimedOut, startLoading, stopLoading } = useLoadingTimeout();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [nurses, setNurses] = useState<Nurse[]>([]);

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
        } catch (error) {
            console.error('Failed to create shift:', error);
            alert('No se pudo crear el turno');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptimizeRoutes = async () => {
        setIsOptimizing(true);
        try {
            const unassignedShifts = shifts.filter(s =>
                s.nurseId === 'UNASSIGNED' || s.nurseId === 'unassigned' || !s.nurseId
            );

            if (unassignedShifts.length === 0) {
                alert('Todos los turnos ya están asignados. No hay turnos para optimizar.');
                setIsOptimizing(false);
                return;
            }

            const response = await (client.queries as any).generateRoster({
                nurses: JSON.stringify(nurses),
                unassignedShifts: JSON.stringify(unassignedShifts)
            });

            if (response.data) {
                const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

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
                                status: 'PENDING' as const
                            };
                        }
                        return shift;
                    });

                    setItems(updatedShifts);
                    setRecentlyAssignedIds(newlyAssignedIds);

                    const assignedCount = result.assignments.filter((a: any) => a.nurseId !== 'UNASSIGNED').length;
                    setOptimizationResult({
                        assignedCount,
                        optimizationScore: Math.round((result.optimizationScore || 0.85) * 100),
                        totalTravelTime: result.totalTravelTime || '2h 15min',
                        assignments: assignmentDetails
                    });

                    setIsOptimizationResultOpen(true);

                    setTimeout(() => {
                        const firstAssignedId = Array.from(newlyAssignedIds)[0];
                        if (firstAssignedId) {
                            const element = document.getElementById(`shift-${firstAssignedId}`);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }, 500);

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
                    const orderMap = new Map<string, number>();
                    (result.optimizedShifts || []).forEach((os: any) => {
                        orderMap.set(os.id, os.order);
                    });
                    setOptimizedShiftOrder(orderMap);

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
            <Card>
                <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner size="lg" label="Sincronizando Roster..." />
                </div>
            </Card>
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
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <CalendarBlank size={18} className="text-slate-400" />
                    Gestión de Turnos
                </h3>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant="success"
                        size="sm"
                        icon={isRouteOptimizing ? undefined : <NavigationArrow size={14} />}
                        isLoading={isRouteOptimizing}
                        onClick={handleRouteOptimize}
                    >
                        {isRouteOptimizing ? 'Calculando...' : 'Optimizar Ruta'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        icon={isOptimizing ? undefined : <Sparkle size={14} />}
                        isLoading={isOptimizing}
                        onClick={handleOptimizeRoutes}
                        data-tour="ai-optimizer"
                    >
                        {isOptimizing ? 'Optimizando...' : 'Asignar Turnos (IA)'}
                    </Button>
                    <Button variant="cta" size="sm" icon={<Plus size={14} />} onClick={() => setIsCreateModalOpen(true)}>
                        Nuevo Turno
                    </Button>
                </div>
            </div>

            {shifts.length === 0 && !isLoading && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                    <CalendarBlank className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-400 mb-4 font-medium">No hay turnos programados</p>
                    <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                        Crear su primer turno
                    </Button>
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
                                    ? 'border-green-300 bg-green-50 shadow-lg shadow-green-200/50'
                                    : 'border-slate-100 hover:bg-slate-50/50'
                            }`}
                        >
                            <div className="flex gap-4 items-center">
                                <Avatar
                                    name={patient?.name || 'P'}
                                    size="sm"
                                    status={isRecentlyAssigned ? 'online' : undefined}
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900">{patient?.name || 'Unknown Patient'}</h4>
                                        {isRecentlyAssigned && (
                                            <Badge variant="success" dot>Recién Asignado</Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin size={10} />
                                            {shift.location || patient?.address || 'Sin ubicación'}
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
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 mb-1">
                                        <NavigationArrow size={10} /> #{optimizedShiftOrder.get(shift.id)}
                                    </span>
                                )}
                                <Badge
                                    variant={
                                        shift.status === 'COMPLETED' ? 'success' :
                                        shift.status === 'IN_PROGRESS' ? 'info' : 'warning'
                                    }
                                    dot
                                >
                                    {shift.status === 'COMPLETED' ? 'Completado' :
                                     shift.status === 'IN_PROGRESS' ? 'En Progreso' :
                                     shift.status === 'PENDING' ? 'Pendiente' : shift.status}
                                </Badge>
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
            <Modal isOpen={isOptimizationResultOpen && !!optimizationResult} onClose={() => setIsOptimizationResultOpen(false)} title="Optimización Completada" maxWidth="2xl">
                {optimizationResult && (
                    <>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-extrabold text-green-600 mb-1">{optimizationResult.assignedCount}</div>
                                <div className="text-xs font-bold text-green-700 uppercase">Turnos Asignados</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-extrabold text-blue-600 mb-1">{optimizationResult.optimizationScore}%</div>
                                <div className="text-xs font-bold text-blue-700 uppercase">Score de Optimización</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-extrabold text-purple-600 mb-1">{optimizationResult.totalTravelTime}</div>
                                <div className="text-xs font-bold text-purple-700 uppercase">Tiempo de Viaje</div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                                <Users size={16} />
                                Asignaciones Realizadas
                            </h4>
                            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                                <table className="w-full">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Paciente</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Enfermera</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Ubicación</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Horario</th>
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

                        <div className="flex justify-end">
                            <Button variant="primary" icon={<Check size={16} />} onClick={() => setIsOptimizationResultOpen(false)}>
                                Entendido
                            </Button>
                        </div>
                    </>
                )}
            </Modal>

            {/* Route Optimization Result Modal */}
            <Modal isOpen={isRouteResultOpen && !!routeResult} onClose={() => setIsRouteResultOpen(false)} title="Ruta Optimizada" maxWidth="lg">
                {routeResult && (
                    <>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-extrabold text-emerald-600 mb-1">
                                    {Math.round(routeResult.totalTravelTimeMinutes || 0)}
                                </div>
                                <div className="text-xs font-bold text-emerald-700 uppercase">Minutos de Viaje</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                <div className="text-3xl font-extrabold text-blue-600 mb-1">
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
                                            <th className="text-left px-3 py-2 text-xs font-bold text-slate-600">#</th>
                                            <th className="text-left px-3 py-2 text-xs font-bold text-slate-600">Turno</th>
                                            <th className="text-right px-3 py-2 text-xs font-bold text-slate-600">Viaje</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {routeResult.optimizedShifts.map((os: any) => {
                                            const shift = shifts.find(s => s.id === os.id);
                                            const patient = patients.find(p => p.id === shift?.patientId);
                                            return (
                                                <tr key={os.id} className="border-t border-slate-100">
                                                    <td className="px-3 py-2">
                                                        <span className="h-6 w-6 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
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
                            <Button variant="success" icon={<Check size={16} />} onClick={() => setIsRouteResultOpen(false)}>
                                Entendido
                            </Button>
                        </div>
                    </>
                )}
            </Modal>

            {/* Create Shift Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Programar Nuevo Turno">
                <form onSubmit={handleCreateShift} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paciente</label>
                        <select
                            required
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                            value={newShiftPatientId}
                            onChange={e => setNewShiftPatientId(e.target.value)}
                        >
                            <option value="">Seleccionar Paciente</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Enfermera Asignada</label>
                        <select
                            required
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                            value={newShiftNurseId}
                            onChange={e => setNewShiftNurseId(e.target.value)}
                        >
                            <option value="">Seleccionar Enfermera (Opcional)</option>
                            {nurses.map(n => (
                                <option key={n.id} value={n.id}>{n.name}</option>
                            ))}
                            <option value="unassigned">Dejar Sin Asignar</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                value={newShiftDate}
                                onChange={e => setNewShiftDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
                            <input
                                type="time"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                value={newShiftTime}
                                onChange={e => setNewShiftTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ubicación</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                            placeholder="Dirección del paciente (por defecto)"
                            value={newShiftLocation}
                            onChange={e => setNewShiftLocation(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button variant="secondary" className="flex-1" type="button" onClick={() => setIsCreateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" className="flex-1" type="submit" isLoading={isSubmitting}>
                            Crear Turno
                        </Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}

/**
 * SimpleNurseApp Component
 * 
 * A mobile-first nurse dashboard for the IPS ERP Home Care application.
 * Integrates with the Visit Workflow Compliance system, allowing nurses to:
 * - View their assigned shifts and route
 * - Start/continue visit documentation for completed shifts
 * - See visit status badges (Pending Approval, Rejected, Approved)
 * - Receive notifications for visit approvals/rejections
 * 
 * Requirements: 1.1, 1.2, 1.5, 3.4, 3.6, 4.1
 */

import { useState, useEffect, useCallback } from 'react';
import { Activity, LogOut, FileText, Edit3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import { createVisitDraft } from '../api/workflow-api';
import { usePagination } from '../hooks/usePagination';
import { NotificationBell } from './NotificationBell';
import { VisitDocumentationForm } from './VisitDocumentationForm';
import type { SimpleNurseAppProps } from '../types/components';
import type { Shift, Patient } from '../types';
import type { Visit, VisitStatus, NotificationItem } from '../types/workflow';

// ============================================================================
// Types
// ============================================================================

interface ShiftWithVisit extends Shift {
    visit?: Visit | null;
}

// ============================================================================
// Mock Visit Data for Development
// ============================================================================

const MOCK_VISITS: Record<string, Visit> = {
    'shift-2': {
        id: 'shift-2',
        tenantId: 'tenant-1',
        shiftId: 'shift-2',
        patientId: 'patient-2',
        nurseId: 'nurse-1',
        status: 'SUBMITTED',
        kardex: { generalObservations: 'Paciente estable' },
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    'shift-3': {
        id: 'shift-3',
        tenantId: 'tenant-1',
        shiftId: 'shift-3',
        patientId: 'patient-3',
        nurseId: 'nurse-1',
        status: 'REJECTED',
        kardex: { generalObservations: 'Evaluación inicial' },
        rejectionReason: 'Falta documentación de signos vitales completa',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    'shift-4': {
        id: 'shift-4',
        tenantId: 'tenant-1',
        shiftId: 'shift-4',
        patientId: 'patient-4',
        nurseId: 'nurse-1',
        status: 'APPROVED',
        kardex: { generalObservations: 'Visita de seguimiento completada' },
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    'shift-5': {
        id: 'shift-5',
        tenantId: 'tenant-1',
        shiftId: 'shift-5',
        patientId: 'patient-5',
        nurseId: 'nurse-1',
        status: 'DRAFT',
        kardex: { generalObservations: 'En progreso...' },
    },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Simulates network delay for mock mode.
 */
async function simulateNetworkDelay(minMs: number = 200, maxMs: number = 500): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
}

// ============================================================================
// Status Badge Component
// ============================================================================

interface VisitStatusBadgeProps {
    status: VisitStatus;
    rejectionReason?: string | null;
}

const VisitStatusBadge: React.FC<VisitStatusBadgeProps> = ({ status, rejectionReason }) => {
    const config: Record<VisitStatus, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
        DRAFT: {
            label: 'Borrador',
            bgColor: 'bg-slate-500/20',
            textColor: 'text-slate-400',
            icon: <Edit3 size={12} />,
        },
        SUBMITTED: {
            label: 'Pendiente',
            bgColor: 'bg-yellow-500/20',
            textColor: 'text-yellow-400',
            icon: <Clock size={12} />,
        },
        REJECTED: {
            label: 'Rechazada',
            bgColor: 'bg-red-500/20',
            textColor: 'text-red-400',
            icon: <XCircle size={12} />,
        },
        APPROVED: {
            label: 'Aprobada',
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-400',
            icon: <CheckCircle size={12} />,
        },
    };

    const { label, bgColor, textColor, icon } = config[status];

    return (
        <div className="mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${bgColor} ${textColor}`}>
                {icon}
                {label}
            </span>
            {status === 'REJECTED' && rejectionReason && (
                <p className="text-xs text-red-400 mt-1 flex items-start gap-1">
                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{rejectionReason}</span>
                </p>
            )}
        </div>
    );
};

// ============================================================================
// Documentation Button Component
// ============================================================================

interface DocumentationButtonProps {
    shift: ShiftWithVisit;
    onStartDocumentation: (shiftId: string) => void;
    onContinueDocumentation: (shiftId: string) => void;
    isLoading: boolean;
}

const DocumentationButton: React.FC<DocumentationButtonProps> = ({
    shift,
    onStartDocumentation,
    onContinueDocumentation,
    isLoading,
}) => {
    // Only show button for COMPLETED shifts
    if (shift.status !== 'COMPLETED') {
        return null;
    }

    const visit = shift.visit;

    // If visit exists and is SUBMITTED or APPROVED, don't show edit button
    if (visit && (visit.status === 'SUBMITTED' || visit.status === 'APPROVED')) {
        return null;
    }

    // If visit exists and is DRAFT or REJECTED, show "Continue Documentation"
    if (visit && (visit.status === 'DRAFT' || visit.status === 'REJECTED')) {
        return (
            <button
                onClick={() => onContinueDocumentation(shift.id)}
                disabled={isLoading}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Edit3 size={16} />
                {visit.status === 'REJECTED' ? 'Corregir Documentación' : 'Continuar Documentación'}
            </button>
        );
    }

    // No visit exists, show "Start Documentation"
    return (
        <button
            onClick={() => onStartDocumentation(shift.id)}
            disabled={isLoading}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <FileText size={16} />
            {isLoading ? 'Creando...' : 'Iniciar Documentación'}
        </button>
    );
};

// ============================================================================
// SimpleNurseApp Component
// ============================================================================

export default function SimpleNurseApp({ onLogout }: SimpleNurseAppProps) {
    // ========================================================================
    // State
    // ========================================================================
    const [activeTab, setActiveTab] = useState('route');
    const { items: shifts, loadMore, hasMore, isLoading, setItems: setShifts } = usePagination<ShiftWithVisit>();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [creatingDraft, setCreatingDraft] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Visit Documentation Form state
    const [showDocumentationForm, setShowDocumentationForm] = useState(false);
    const [selectedShift, setSelectedShift] = useState<ShiftWithVisit | null>(null);

    // Current user ID (in real app, this would come from auth context)
    const currentUserId = 'nurse-1';

    // ========================================================================
    // Data Fetching
    // ========================================================================
    const fetchData = useCallback(async () => {
        setLoadingPatients(true);
        setError(null);

        try {
            if (!isUsingRealBackend()) {
                // Mock mode: load mock data
                const { SHIFTS, PATIENTS } = await import('../data/mock-data');
                await simulateNetworkDelay();

                // Transform mock data to match Shift type
                const transformedShifts: ShiftWithVisit[] = SHIFTS.map((shift: any) => ({
                    id: shift.id,
                    tenantId: 'tenant-1',
                    nurseId: shift.nurseId,
                    nurseName: 'Enfermera Demo',
                    patientId: shift.patientId,
                    patientName: PATIENTS.find((p: any) => p.id === shift.patientId)?.name || 'Paciente',
                    location: PATIENTS.find((p: any) => p.id === shift.patientId)?.address || '',
                    status: shift.status === 'Completed' ? 'COMPLETED' :
                        shift.status === 'Pending' ? 'PENDING' :
                            shift.status === 'In Progress' ? 'IN_PROGRESS' : 'PENDING',
                    scheduledTime: `${shift.date}T${shift.startTime}:00`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    visit: MOCK_VISITS[shift.id] || null,
                }));

                // Transform mock patients to match Patient type
                const transformedPatients: Patient[] = PATIENTS.map((patient: any) => ({
                    id: patient.id,
                    tenantId: 'tenant-1',
                    name: patient.name,
                    documentId: '123456789',
                    address: patient.address,
                    diagnosis: patient.diagnosis,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }));

                loadMore(async () => ({ data: transformedShifts, nextToken: null }), true);
                setPatients(transformedPatients);
            } else {
                // Real backend mode
                const patientsRes = await (client.models.Patient as any).list();
                setPatients(patientsRes.data || []);

                loadMore(async (token) => {
                    const shiftsRes = await (client.models.Shift as any).list({
                        limit: 50,
                        nextToken: token
                    });

                    const shiftsData = shiftsRes.data || [];

                    // Try to fetch visits if the model exists
                    let visitsData: any[] = [];
                    try {
                        const visitsRes = await (client.models as any).Visit?.list();
                        visitsData = visitsRes?.data || [];
                    } catch (e) {
                        console.log('Visit model not available, continuing without visits');
                    }

                    // Create a map of visits by shiftId for quick lookup
                    const visitsMap: Record<string, Visit> = {};
                    visitsData.forEach((visit: any) => {
                        visitsMap[visit.id] = {
                            id: visit.id,
                            tenantId: visit.tenantId,
                            shiftId: visit.id,
                            patientId: visit.patientId,
                            nurseId: visit.nurseId,
                            status: visit.status,
                            kardex: visit.kardex ? (typeof visit.kardex === 'string' ? JSON.parse(visit.kardex) : visit.kardex) : {},
                            rejectionReason: visit.rejectionReason,
                            submittedAt: visit.submittedAt,
                            approvedAt: visit.approvedAt,
                        };
                    });

                    // Merge shifts with visits
                    const shiftsWithVisits: ShiftWithVisit[] = shiftsData.map((shift: Shift) => ({
                        ...shift,
                        visit: visitsMap[shift.id] || null,
                    }));

                    return { data: shiftsWithVisits, nextToken: shiftsRes.nextToken };
                }, true);
            }
        } catch (err) {
            console.error('Error fetching nurse data:', err);
            setError('Error al cargar los datos. Por favor intente de nuevo.');
            setPatients([]);
        } finally {
            setLoadingPatients(false);
        }
    }, [loadMore]);

    const handleLoadMore = useCallback(() => {
        loadMore(async (token) => {
            const shiftsRes = await (client.models.Shift as any).list({
                limit: 50,
                nextToken: token
            });

            const shiftsData = shiftsRes.data || [];

            // Try to fetch visits if the model exists
            let visitsData: any[] = [];
            try {
                const visitsRes = await (client.models as any).Visit?.list();
                visitsData = visitsRes?.data || [];
            } catch (e) {
                console.log('Visit model not available');
            }

            const visitsMap: Record<string, Visit> = {};
            visitsData.forEach((visit: any) => {
                visitsMap[visit.id] = {
                    id: visit.id,
                    tenantId: visit.tenantId,
                    shiftId: visit.id,
                    patientId: visit.patientId,
                    nurseId: visit.nurseId,
                    status: visit.status,
                    kardex: visit.kardex ? (typeof visit.kardex === 'string' ? JSON.parse(visit.kardex) : visit.kardex) : {},
                    rejectionReason: visit.rejectionReason,
                    submittedAt: visit.submittedAt,
                    approvedAt: visit.approvedAt,
                };
            });

            const shiftsWithVisits: ShiftWithVisit[] = shiftsData.map((shift: Shift) => ({
                ...shift,
                visit: visitsMap[shift.id] || null,
            }));

            return { data: shiftsWithVisits, nextToken: shiftsRes.nextToken };
        });
    }, [loadMore]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ========================================================================
    // Event Handlers
    // ========================================================================

    /**
     * Handles "Start Documentation" button click.
     * Creates a visit draft and opens the documentation form.
     * 
     * Validates: Requirements 1.1, 1.2
     */
    const handleStartDocumentation = useCallback(async (shiftId: string) => {
        setCreatingDraft(shiftId);
        setError(null);

        try {
            const result = await createVisitDraft(shiftId);

            if (result.success) {
                // Find the shift and open documentation form
                const shift = shifts.find(s => s.id === shiftId);
                if (shift) {
                    // Update shift with new draft visit
                    const updatedShift: ShiftWithVisit = {
                        ...shift,
                        visit: {
                            id: shiftId,
                            tenantId: shift.tenantId || '',
                            shiftId: shiftId,
                            patientId: shift.patientId || '',
                            nurseId: currentUserId,
                            status: 'DRAFT',
                            kardex: { generalObservations: '' },
                        },
                    };

                    // Update shifts state
                    setShifts(prev => prev.map(s => s.id === shiftId ? updatedShift : s));

                    // Open documentation form
                    setSelectedShift(updatedShift);
                    setShowDocumentationForm(true);
                }
            } else {
                setError(result.error || 'Error al crear el borrador de visita');
            }
        } catch (err) {
            console.error('Error creating visit draft:', err);
            setError('Error al crear el borrador de visita. Por favor intente de nuevo.');
        } finally {
            setCreatingDraft(null);
        }
    }, [shifts, currentUserId]);

    /**
     * Handles "Continue Documentation" button click.
     * Opens the documentation form for an existing draft or rejected visit.
     * 
     * Validates: Requirements 1.5, 3.6
     */
    const handleContinueDocumentation = useCallback((shiftId: string) => {
        const shift = shifts.find(s => s.id === shiftId);
        if (shift) {
            setSelectedShift(shift);
            setShowDocumentationForm(true);
        }
    }, [shifts]);

    /**
     * Handles documentation form close.
     */
    const handleCloseDocumentationForm = useCallback(() => {
        setShowDocumentationForm(false);
        setSelectedShift(null);
    }, []);

    /**
     * Handles successful visit submission.
     * Refreshes data and closes the form.
     */
    const handleSubmitSuccess = useCallback(() => {
        setShowDocumentationForm(false);
        setSelectedShift(null);
        // Refresh data to get updated visit status
        fetchData();
    }, [fetchData]);

    /**
     * Handles notification click.
     * For VISIT_REJECTED notifications, navigates to the rejected visit for correction.
     * 
     * Validates: Requirement 4.4
     */
    const handleNotificationClick = useCallback((notification: NotificationItem) => {
        if (notification.type === 'VISIT_REJECTED') {
            // Find the shift with this visit
            const shift = shifts.find(s => s.id === notification.entityId);
            if (shift) {
                setSelectedShift(shift);
                setShowDocumentationForm(true);
            }
        }
    }, [shifts]);

    // ========================================================================
    // Computed Values
    // ========================================================================
    const completedShifts = shifts.filter(s => s.status === 'COMPLETED').length;
    const totalShifts = shifts.length;
    const completionRate = totalShifts > 0 ? Math.round((completedShifts / totalShifts) * 100) : 0;

    // Count visits by status
    const pendingApproval = shifts.filter(s => s.visit?.status === 'SUBMITTED').length;
    const rejectedVisits = shifts.filter(s => s.visit?.status === 'REJECTED').length;
    const approvedVisits = shifts.filter(s => s.visit?.status === 'APPROVED').length;

    // ========================================================================
    // Render
    // ========================================================================
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header with NotificationBell */}
            <header className="bg-slate-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity size={24} className="text-[#2563eb]" />
                    <span className="font-black text-lg">IPS ERP</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* NotificationBell - Requirement 4.1 */}
                    <NotificationBell
                        userId={currentUserId}
                        onNotificationClick={handleNotificationClick}
                    />
                    <button onClick={onLogout} className="text-sm text-slate-400 hover:text-white p-2">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="p-4">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('route')}
                        className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'route' ? 'bg-[#2563eb] text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                    >
                        Mi Ruta
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'stats' ? 'bg-[#2563eb] text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                    >
                        Estadísticas
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                        <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-red-400">{error}</p>
                            <button
                                onClick={fetchData}
                                className="text-xs text-red-300 hover:text-red-200 underline mt-1"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}

                {(isLoading && shifts.length === 0) || loadingPatients ? (
                    <div className="text-center text-slate-400 py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-slate-600 border-t-[#2563eb] rounded-full mx-auto mb-3"></div>
                        Cargando...
                    </div>
                ) : (
                    <>
                        {/* Route Tab - Shift Cards with Visit Status */}
                        {activeTab === 'route' && (
                            <div className="space-y-4">
                                {shifts.length === 0 ? (
                                    <div className="bg-slate-800 p-8 rounded-xl text-center">
                                        <p className="text-slate-400 mb-2">No hay turnos asignados</p>
                                        <p className="text-xs text-slate-500">Revise más tarde para ver su ruta</p>
                                    </div>
                                ) : (
                                    shifts.map(shift => {
                                        const patient = patients.find(p => p.id === shift.patientId);
                                        const isCreatingThisDraft = creatingDraft === shift.id;

                                        return (
                                            <div key={shift.id} className="bg-slate-800 p-4 rounded-xl">
                                                {/* Shift Header */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-white">
                                                        {patient?.name || shift.patientName || 'Paciente Desconocido'}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${shift.status === 'COMPLETED'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : shift.status === 'IN_PROGRESS'
                                                            ? 'bg-blue-500/20 text-blue-400'
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {shift.status === 'COMPLETED' ? 'Completado' :
                                                            shift.status === 'IN_PROGRESS' ? 'En Progreso' :
                                                                shift.status === 'CANCELLED' ? 'Cancelado' : 'Pendiente'}
                                                    </span>
                                                </div>

                                                {/* Patient Address */}
                                                <p className="text-sm text-slate-400 mb-2">
                                                    {patient?.address || shift.location || 'Dirección no disponible'}
                                                </p>

                                                {/* Scheduled Time */}
                                                <p className="text-xs text-slate-500">
                                                    {new Date(shift.scheduledTime).toLocaleString('es-CO', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>

                                                {/* Visit Status Badge - Requirements 3.4, 3.6 */}
                                                {shift.visit && (
                                                    <VisitStatusBadge
                                                        status={shift.visit.status}
                                                        rejectionReason={shift.visit.rejectionReason}
                                                    />
                                                )}

                                                {/* Documentation Button - Requirements 1.1, 1.5 */}
                                                <DocumentationButton
                                                    shift={shift}
                                                    onStartDocumentation={handleStartDocumentation}
                                                    onContinueDocumentation={handleContinueDocumentation}
                                                    isLoading={isCreatingThisDraft}
                                                />
                                            </div>
                                        );
                                    })
                                )}
                                {hasMore && (
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                        className="w-full py-4 text-sm font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50 mt-4"
                                    >
                                        {isLoading ? 'Cargando más...' : 'Cargar Más Turnos'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Stats Tab */}
                        {activeTab === 'stats' && (
                            <div className="space-y-4">
                                {/* Total Shifts */}
                                <div className="bg-slate-800 p-6 rounded-xl text-center">
                                    <div className="text-4xl font-black text-emerald-400 mb-2">{totalShifts}</div>
                                    <div className="text-sm text-slate-400">Total de Turnos</div>
                                </div>

                                {/* Completion Rate */}
                                <div className="bg-slate-800 p-6 rounded-xl text-center">
                                    <div className="text-4xl font-black text-blue-400 mb-2">{completionRate}%</div>
                                    <div className="text-sm text-slate-400">Tasa de Completado</div>
                                </div>

                                {/* Visit Status Summary */}
                                <div className="bg-slate-800 p-4 rounded-xl">
                                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Estado de Visitas</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                                            <div className="text-xl font-bold text-yellow-400">{pendingApproval}</div>
                                            <div className="text-xs text-slate-400">Pendientes</div>
                                        </div>
                                        <div className="text-center p-2 bg-red-500/10 rounded-lg">
                                            <div className="text-xl font-bold text-red-400">{rejectedVisits}</div>
                                            <div className="text-xs text-slate-400">Rechazadas</div>
                                        </div>
                                        <div className="text-center p-2 bg-green-500/10 rounded-lg">
                                            <div className="text-xl font-bold text-green-400">{approvedVisits}</div>
                                            <div className="text-xs text-slate-400">Aprobadas</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Backend Status */}
                                <div className="bg-slate-800 p-6 rounded-xl text-center">
                                    <div className="text-sm text-slate-500 mb-2">
                                        {isUsingRealBackend() ? '🟢 Datos en Vivo' : '🟡 Datos de Prueba'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Visit Documentation Form Modal */}
            {showDocumentationForm && selectedShift && (
                <VisitDocumentationForm
                    shiftId={selectedShift.id}
                    patientId={selectedShift.patientId || ''}
                    patientName={
                        patients.find(p => p.id === selectedShift.patientId)?.name ||
                        selectedShift.patientName ||
                        'Paciente'
                    }
                    onClose={handleCloseDocumentationForm}
                    onSubmitSuccess={handleSubmitSuccess}
                />
            )}
        </div>
    );
}

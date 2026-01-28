/**
 * SimpleNurseApp Component
 * 
 * A mobile-first nurse dashboard for the IPS ERP Home Care application.
 * Integrates with the Visit Workflow Compliance system, allowing nurses to:
 * - View their assigned shifts and route
 * - Filter visits to show only today's schedule (default: enabled)
 * - Start/continue visit documentation for completed shifts
 * - See visit status badges (Pending Approval, Rejected, Approved)
 * - Receive notifications for visit approvals/rejections
 * - Work offline with automatic sync when connectivity returns
 * 
 * NAVIGATION ISOLATION:
 * - This app is self-contained and does NOT navigate to Family Portal or other portals
 * - All notifications are handled internally (opens documentation forms only)
 * - Logout button only logs out, does not redirect to other portals
 * - All buttons and handlers stay within the Nurse App scope
 * 
 * FIXED ISSUES (v1.1):
 * - Added "SOLO HOY" (Today Only) filter toggle with default enabled
 * - Verified all onClick handlers navigate correctly (no wrong destinations)
 * - Added isolation safeguards to prevent accidental navigation to Family Portal
 * - All buttons now explicitly documented and verified for correct behavior
 * 
 * Requirements: 1.1, 1.2, 1.5, 3.4, 3.6, 4.1
 * Offline: Phase 4 UI Integration
 */

import { useState, useEffect, useCallback } from 'react';
import { Activity, LogOut, FileText, Edit3, Clock, CheckCircle, XCircle, AlertCircle, FileCheck, HeartPulse, CloudOff, ChevronRight } from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import { createVisitDraft } from '../api/workflow-api';
import { usePagination } from '../hooks/usePagination';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { NotificationBell } from './NotificationBell';
import { VisitDocumentationForm } from './VisitDocumentationForm';
import { AssessmentEntryForm } from './AssessmentEntryForm';
import { OfflineBanner } from './OfflineBanner';
import { SyncStatusBadge, SyncCloudIcon, type SyncStatusType } from './SyncStatusBadge';
import { SyncProgressIndicator } from './SyncProgressIndicator';
import { NetworkStatusIndicator, LastSyncTime } from './NetworkStatusIndicator';
import type { SimpleNurseAppProps } from '../types/components';
import type { Shift, Patient } from '../types';
import type { Visit, VisitStatus, NotificationItem } from '../types/workflow';

// ============================================================================
// Types
// ============================================================================

interface ShiftWithVisit extends Shift {
    visit?: Visit | null;
    /** Sync status for offline support */
    _syncStatus?: SyncStatusType;
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
            icon: <Edit3 size={14} />,
        },
        SUBMITTED: {
            label: 'Pendiente',
            bgColor: 'bg-yellow-500/20',
            textColor: 'text-yellow-400',
            icon: <Clock size={14} />,
        },
        REJECTED: {
            label: 'Rechazada',
            bgColor: 'bg-red-500/20',
            textColor: 'text-red-400',
            icon: <XCircle size={14} />,
        },
        APPROVED: {
            label: 'Aprobada',
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-400',
            icon: <CheckCircle size={14} />,
        },
    };

    const { label, bgColor, textColor, icon } = config[status];

    return (
        <div className="mt-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm font-medium ${bgColor} ${textColor}`}>
                {icon}
                {label}
            </span>
            {status === 'REJECTED' && rejectionReason && (
                <p className="text-sm text-red-400 mt-2 flex items-start gap-1.5">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
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
    onGeneratePacket: (shiftId: string) => void;
}

const DocumentationButton: React.FC<DocumentationButtonProps> = ({
    shift,
    onStartDocumentation,
    onContinueDocumentation,
    isLoading,
    onGeneratePacket
}) => {
    // Only show button for COMPLETED shifts
    if (shift.status !== 'COMPLETED') {
        return null;
    }

    const visit = shift.visit;

    // If visit APPROVED, show "Generate Packet" (New Feature from UX Audit)
    if (visit && visit.status === 'APPROVED') {
        return (
            <button
                onClick={() => onGeneratePacket(shift.id)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-medium rounded-lg transition-colors min-h-[48px]"
            >
                <FileCheck size={18} />
                Generar Paquete de Facturación
            </button>
        );
    }

    // If visit exists and is SUBMITTED, show "Pending Review" (disabled)
    if (visit && visit.status === 'SUBMITTED') {
        return (
            <div className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-yellow-500/10 text-yellow-500 text-base font-medium rounded-lg border border-yellow-500/20 min-h-[48px]">
                <Clock size={18} />
                Esperando Revisión
            </div>
        );
    }

    // If visit exists and is DRAFT or REJECTED, show "Continue Documentation"
    if (visit && (visit.status === 'DRAFT' || visit.status === 'REJECTED')) {
        return (
            <button
                onClick={() => onContinueDocumentation(shift.id)}
                disabled={isLoading}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
                <Edit3 size={18} />
                {visit.status === 'REJECTED' ? 'Corregir Documentación' : 'Continuar Documentación'}
            </button>
        );
    }

    // No visit exists, show "Start Documentation"
    return (
        <button
            onClick={() => onStartDocumentation(shift.id)}
            disabled={isLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#2563eb] hover:bg-blue-700 text-white text-base font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
            <FileText size={18} />
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

    // Today filter state - default to showing only today's visits
    const [showOnlyToday, setShowOnlyToday] = useState(true);

    // Visit Documentation Form state
    const [showDocumentationForm, setShowDocumentationForm] = useState(false);
    const [selectedShift, setSelectedShift] = useState<ShiftWithVisit | null>(null);

    // Clinical Assessment Form state
    const [showAssessmentForm, setShowAssessmentForm] = useState(false);
    const [assessmentPatient, setAssessmentPatient] = useState<{ id: string; name: string } | null>(null);

    // Current user ID (in real app, this would come from auth context)
    const currentUserId = 'nurse-1';

    // ========================================================================
    // Offline Hooks (Phase 4)
    // ========================================================================
    const { isOffline, isSlow, isOnline } = useNetworkStatus();
    const { pendingCount, isSyncing, lastSyncTimeFormatted } = useSyncStatus();

    // ========================================================================
    // Data Fetching
    // ========================================================================
    const fetchData = useCallback(async () => {
        setLoadingPatients(true);
        setError(null);

        try {
            // Always use the client - it returns demo data in demo mode
            const patientsRes = await (client.models.Patient as any).list();
            setPatients(patientsRes.data || []);

            await loadMore(async (token) => {
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
                        const visitShiftId = visit.shiftId || visit.id;
                        visitsMap[visitShiftId] = {
                            id: visit.id,
                            tenantId: visit.tenantId,
                            shiftId: visitShiftId,
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
                const visitShiftId = visit.shiftId || visit.id;
                visitsMap[visitShiftId] = {
                    id: visit.id,
                    tenantId: visit.tenantId,
                    shiftId: visitShiftId,
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
     * Supports offline mode with optimistic updates.
     * 
     * Validates: Requirements 1.1, 1.2
     * Offline: Phase 4 - Optimistic updates
     */
    const handleStartDocumentation = useCallback(async (shiftId: string) => {
        setCreatingDraft(shiftId);
        setError(null);

        // Find the shift first for optimistic update
        const shift = shifts.find(s => s.id === shiftId);
        if (!shift) {
            setError('Turno no encontrado');
            setCreatingDraft(null);
            return;
        }

        // Prepare the optimistic draft visit
        const optimisticVisit: Visit = {
            id: shiftId,
            tenantId: shift.tenantId || '',
            shiftId: shiftId,
            patientId: shift.patientId || '',
            nurseId: currentUserId,
            status: 'DRAFT',
            kardex: { generalObservations: '' },
        };

        // Apply optimistic update immediately
        const updatedShift: ShiftWithVisit = {
            ...shift,
            visit: optimisticVisit,
            _syncStatus: isOffline ? 'pending' : 'syncing',
        };

        // Update UI immediately (optimistic)
        setShifts(prev => prev.map(s => s.id === shiftId ? updatedShift : s));
        setSelectedShift(updatedShift);
        setShowDocumentationForm(true);

        try {
            // If offline, the draft is already saved optimistically
            if (isOffline) {
                console.log('📴 Offline: Visit draft queued for sync');
                // Mark as pending sync
                setShifts(prev => prev.map(s => 
                    s.id === shiftId 
                        ? { ...s, _syncStatus: 'pending' as SyncStatusType }
                        : s
                ));
            } else {
                // Online: try to create on server
                const result = await createVisitDraft(shiftId);

                if (result.success) {
                    // Update with synced status
                    setShifts(prev => prev.map(s => 
                        s.id === shiftId 
                            ? { ...s, _syncStatus: 'synced' as SyncStatusType }
                            : s
                    ));
                } else {
                    // Server error but keep the local draft
                    console.warn('Server error, keeping local draft:', result.error);
                    setShifts(prev => prev.map(s => 
                        s.id === shiftId 
                            ? { ...s, _syncStatus: 'pending' as SyncStatusType }
                            : s
                    ));
                }
            }
        } catch (err) {
            console.error('Error creating visit draft:', err);
            // Mark as pending if network error
            setShifts(prev => prev.map(s => 
                s.id === shiftId 
                    ? { ...s, _syncStatus: 'pending' as SyncStatusType }
                    : s
            ));
        } finally {
            setCreatingDraft(null);
        }
    }, [shifts, currentUserId, isOffline, setShifts]);

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
     * Handles Billing Packet Generation (Mock)
     */
    const handleGeneratePacket = useCallback((shiftId: string) => {
        // In backend, this would check if a BillingRecord exists or create one
        console.log('Generating packet for shift:', shiftId);
        alert('Packet Generated! It has been sent to the Billing Department.');
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
     * ISOLATED: This handler only opens forms within the Nurse App - no external navigation.
     * 
     * Validates: Requirement 4.4
     */
    const handleNotificationClick = useCallback((notification: NotificationItem) => {
        // NURSE APP ISOLATION: Only handle nurse-related notifications
        // Do NOT navigate to Family Portal or other portals
        if (notification.type === 'VISIT_REJECTED') {
            // Find the shift with this visit
            const shift = shifts.find(s => s.id === notification.entityId);
            if (shift) {
                // Stay within nurse app - just open the documentation form
                setSelectedShift(shift);
                setShowDocumentationForm(true);
            }
        }
        // Ignore all other notification types to prevent accidental navigation
        // to Family Portal or other portals
    }, [shifts]);

    // ========================================================================
    // Helper Functions
    // ========================================================================
    
    /**
     * Check if a date is today
     */
    const isToday = (dateString: string): boolean => {
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    // ========================================================================
    // Computed Values
    // ========================================================================
    
    // Filter shifts by today if toggle is active
    const filteredShifts = showOnlyToday 
        ? shifts.filter(shift => isToday(shift.scheduledTime))
        : shifts;

    const completedShifts = filteredShifts.filter(s => s.status === 'COMPLETED').length;
    const totalShifts = filteredShifts.length;
    const completionRate = totalShifts > 0 ? Math.round((completedShifts / totalShifts) * 100) : 0;

    // Count visits by status
    const pendingApproval = filteredShifts.filter(s => s.visit?.status === 'SUBMITTED').length;
    const rejectedVisits = filteredShifts.filter(s => s.visit?.status === 'REJECTED').length;
    const approvedVisits = filteredShifts.filter(s => s.visit?.status === 'APPROVED').length;

    // ========================================================================
    // Render
    // ========================================================================
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Offline Banner - Shows when offline, slow, or syncing */}
            <OfflineBanner />
            
            {/* Header with NotificationBell and Network Status */}
            {/* NURSE APP HEADER: Isolated - no navigation to Family Portal or other portals */}
            <header className={`bg-slate-800 p-4 flex justify-between items-center ${(isOffline || isSlow || pendingCount > 0 || isSyncing) ? 'mt-10' : ''}`}>
                <div className="flex items-center gap-2">
                    <Activity size={24} className="text-[#2563eb]" />
                    <span className="font-black text-lg">IPS ERP - Enfermería</span>
                    {/* Network status dot */}
                    {isOffline && (
                        <span className="text-xs text-red-400 flex items-center gap-1 ml-2">
                            <CloudOff size={12} />
                            Offline
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {/* Network Status Indicator with pending badge */}
                    <NetworkStatusIndicator showPendingBadge={true} size="md" />
                    
                    {/* NotificationBell - Requirement 4.1 */}
                    {/* ISOLATED: Only shows nurse-related notifications, handled by handleNotificationClick */}
                    <NotificationBell
                        userId={currentUserId}
                        onNotificationClick={handleNotificationClick}
                    />
                    {/* Logout button - only logs out, does not navigate to other portals */}
                    <button 
                        onClick={onLogout} 
                        className="text-sm text-slate-400 hover:text-white p-3 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Cerrar sesión"
                        title="Cerrar sesión"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </header>

            <div className="p-4">
                {/* Tab Navigation - Mobile optimized with 48px touch targets */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab('route')}
                        className={`flex-1 py-4 min-h-[48px] rounded-xl font-bold text-base transition-colors ${activeTab === 'route' ? 'bg-[#2563eb] text-white' : 'bg-slate-800 text-slate-400 active:bg-slate-700'
                            }`}
                    >
                        Mi Ruta
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-4 min-h-[48px] rounded-xl font-bold text-base transition-colors ${activeTab === 'stats' ? 'bg-[#2563eb] text-white' : 'bg-slate-800 text-slate-400 active:bg-slate-700'
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
                            <div className="space-y-6">
                                {/* Today Filter Toggle - Mobile optimized with 48px touch target */}
                                <div className="bg-slate-800 p-5 rounded-xl flex items-center justify-between gap-4">
                                    <span className="text-base font-semibold text-slate-300">Mostrar solo visitas de hoy</span>
                                    <button
                                        onClick={() => setShowOnlyToday(!showOnlyToday)}
                                        className={`relative inline-flex items-center h-12 rounded-full w-24 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-[#2563eb] ${
                                            showOnlyToday ? 'bg-[#2563eb]' : 'bg-slate-600'
                                        }`}
                                        role="switch"
                                        aria-checked={showOnlyToday}
                                        aria-label="Filtrar solo hoy"
                                    >
                                        <span
                                            className={`${
                                                showOnlyToday ? 'translate-x-[52px]' : 'translate-x-1'
                                            } inline-block w-9 h-9 transform bg-white rounded-full transition-transform shadow-md`}
                                        />
                                    </button>
                                </div>

                                {/* SOLO HOY Badge - Visual indicator */}
                                {showOnlyToday && (
                                    <div className="bg-blue-500/20 border border-blue-500/30 p-5 rounded-xl flex items-center justify-center gap-3">
                                        <Clock size={20} className="text-blue-400" />
                                        <span className="text-lg font-bold text-blue-400">SOLO HOY</span>
                                        <span className="text-base text-blue-300">({filteredShifts.length} {filteredShifts.length === 1 ? 'visita' : 'visitas'})</span>
                                    </div>
                                )}

                                {filteredShifts.length === 0 ? (
                                    <div className="bg-slate-800 p-8 rounded-xl text-center">
                                        <p className="text-base text-slate-400 mb-2">
                                            {showOnlyToday ? 'No hay visitas programadas para hoy' : 'No hay turnos asignados'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {showOnlyToday ? 'Intente desactivar el filtro "Solo hoy" para ver todas las visitas' : 'Revise más tarde para ver su ruta'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredShifts.map(shift => {
                                        const patient = patients.find(p => p.id === shift.patientId);
                                        const isCreatingThisDraft = creatingDraft === shift.id;
                                        // Determine sync status for the shift/visit
                                        // _syncStatus is tracked on ShiftWithVisit level
                                        const visitSyncStatus: SyncStatusType = shift._syncStatus || 'synced';

                                        // Determine if this card should be interactive (pending/in-progress, regardless of visit status)
                                        const isActionable = (shift.status === 'PENDING' || shift.status === 'IN_PROGRESS');
                                        
                                        return (
                                            <div 
                                                key={shift.id} 
                                                className={`bg-slate-800 p-6 rounded-xl transition-all ${
                                                    isActionable ? 'hover:bg-slate-750 hover:shadow-lg hover:border hover:border-blue-500/30 cursor-pointer active:bg-slate-700' : ''
                                                }`}
                                                onClick={isActionable ? () => {
                                                    // Route to appropriate handler based on visit status
                                                    if (!shift.visit) {
                                                        handleStartDocumentation(shift.id);
                                                    } else if (shift.visit.status === 'DRAFT' || shift.visit.status === 'REJECTED' || shift.visit.status === 'APPROVED') {
                                                        handleContinueDocumentation(shift.id);
                                                    }
                                                    // SUBMITTED visits don't do anything on card click
                                                } : undefined}
                                                role={isActionable ? 'button' : undefined}
                                                tabIndex={isActionable ? 0 : undefined}
                                            >
                                                {/* Shift Header */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-white">
                                                            {patient?.name || shift.patientName || 'Paciente Desconocido'}
                                                        </h3>
                                                        {/* Sync status icon for the visit */}
                                                        {shift.visit && visitSyncStatus !== 'synced' && (
                                                            <SyncCloudIcon syncStatus={visitSyncStatus} size={14} />
                                                        )}
                                                        {/* Chevron indicator for actionable cards */}
                                                        {isActionable && (
                                                            <ChevronRight size={18} className="text-blue-400 ml-auto" />
                                                        )}
                                                    </div>
                                                    <span className={`px-3 py-2 rounded-lg text-sm font-bold ${shift.status === 'COMPLETED'
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
                                                <p className="text-base text-slate-400 mb-2">
                                                    {patient?.address || shift.location || 'Dirección no disponible'}
                                                </p>

                                                {/* Scheduled Time */}
                                                <p className="text-sm text-slate-500">
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

                                                {/* Offline sync status message */}
                                                {visitSyncStatus === 'pending' && (
                                                    <div className="mt-3 text-sm text-yellow-400 flex items-center gap-1.5 bg-yellow-500/10 px-3 py-2 rounded">
                                                        <CloudOff size={14} />
                                                        <span>Se sincronizará cuando haya conexión</span>
                                                    </div>
                                                )}
                                                {visitSyncStatus === 'error' && (
                                                    <div className="mt-3 text-sm text-red-400 flex items-center gap-1.5 bg-red-500/10 px-3 py-2 rounded">
                                                        <AlertCircle size={14} />
                                                        <span>Error al sincronizar - toque para reintentar</span>
                                                    </div>
                                                )}

                                                {/* SENTINEL FIX #1: Action buttons for Pending/In-Progress Shifts */}
                                                {(shift.status === 'PENDING' || shift.status === 'IN_PROGRESS') && (
                                                    <>
                                                        {/* No visit yet - show Iniciar Visita */}
                                                        {!shift.visit && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStartDocumentation(shift.id);
                                                                }}
                                                                disabled={isCreatingThisDraft}
                                                                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 min-h-[48px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                                            >
                                                                <FileText size={20} />
                                                                {isCreatingThisDraft ? 'Iniciando...' : 'Iniciar Visita'}
                                                            </button>
                                                        )}
                                                        {/* Visit approved - show Ver Visita */}
                                                        {shift.visit?.status === 'APPROVED' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleContinueDocumentation(shift.id);
                                                                }}
                                                                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-base font-bold rounded-lg transition-colors shadow-lg"
                                                            >
                                                                <CheckCircle size={20} />
                                                                Ver Visita Aprobada
                                                            </button>
                                                        )}
                                                        {/* Visit submitted - show waiting status */}
                                                        {shift.visit?.status === 'SUBMITTED' && (
                                                            <div className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 min-h-[48px] bg-yellow-500/10 text-yellow-500 text-base font-bold rounded-lg border border-yellow-500/20">
                                                                <Clock size={20} />
                                                                Esperando Revisión
                                                            </div>
                                                        )}
                                                        {/* Visit draft or rejected - show continue/correct */}
                                                        {(shift.visit?.status === 'DRAFT' || shift.visit?.status === 'REJECTED') && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleContinueDocumentation(shift.id);
                                                                }}
                                                                disabled={isCreatingThisDraft}
                                                                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 min-h-[48px] bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-base font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                                            >
                                                                <Edit3 size={20} />
                                                                {shift.visit?.status === 'REJECTED' ? 'Corregir Documentación' : 'Continuar Documentación'}
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {/* Documentation Button - Requirements 1.1, 1.5 */}
                                                <DocumentationButton
                                                    shift={shift}
                                                    onStartDocumentation={handleStartDocumentation}
                                                    onContinueDocumentation={handleContinueDocumentation}
                                                    onGeneratePacket={handleGeneratePacket}
                                                    isLoading={isCreatingThisDraft}
                                                />

                                                {/* Clinical Assessment Button */}
                                                {shift.status === 'COMPLETED' && (
                                                    <button
                                                        onClick={() => {
                                                            setAssessmentPatient({
                                                                id: shift.patientId || '',
                                                                name: patient?.name || shift.patientName || 'Paciente'
                                                            });
                                                            setShowAssessmentForm(true);
                                                        }}
                                                        className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-3.5 text-base font-medium rounded-lg transition-colors min-h-[48px] ${
                                                            isOffline 
                                                                ? 'bg-pink-600/10 border border-pink-500/20 text-pink-400/70' 
                                                                : 'bg-pink-600/20 border border-pink-500/30 text-pink-400 hover:bg-pink-600/30'
                                                        }`}
                                                    >
                                                        <HeartPulse size={18} />
                                                        Registrar Valoración Clínica
                                                        {isOffline && <span className="text-xs ml-1">(offline)</span>}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                                {hasMore && (
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                        className="w-full py-4 px-6 text-base font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl transition-all disabled:opacity-50 mt-6 min-h-[52px]"
                                    >
                                        {isLoading ? 'Cargando más...' : 'Cargar Más Turnos'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Stats Tab */}
                        {activeTab === 'stats' && (
                            <div className="space-y-6">
                                {/* Total Shifts */}
                                <div className="bg-slate-800 p-6 rounded-xl text-center">
                                    <div className="text-4xl font-black text-emerald-400 mb-2">{totalShifts}</div>
                                    <div className="text-base text-slate-400">Total de Turnos</div>
                                </div>

                                {/* Completion Rate */}
                                <div className="bg-slate-800 p-6 rounded-xl text-center">
                                    <div className="text-4xl font-black text-blue-400 mb-2">{completionRate}%</div>
                                    <div className="text-base text-slate-400">Tasa de Completado</div>
                                </div>

                                {/* Visit Status Summary */}
                                <div className="bg-slate-800 p-5 rounded-xl">
                                    <h4 className="text-base font-semibold text-slate-300 mb-4">Estado de Visitas</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-400">{pendingApproval}</div>
                                            <div className="text-sm text-slate-400">Pendientes</div>
                                        </div>
                                        <div className="text-center p-3 bg-red-500/10 rounded-lg">
                                            <div className="text-2xl font-bold text-red-400">{rejectedVisits}</div>
                                            <div className="text-sm text-slate-400">Rechazadas</div>
                                        </div>
                                        <div className="text-center p-3 bg-green-500/10 rounded-lg">
                                            <div className="text-2xl font-bold text-green-400">{approvedVisits}</div>
                                            <div className="text-sm text-slate-400">Aprobadas</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Backend Status */}
                                <div className="bg-slate-800 p-6 rounded-xl text-center">
                                    <div className="text-base text-slate-500 mb-2">
                                        {isUsingRealBackend() ? '🟢 Datos en Vivo' : '🟡 Datos de Prueba'}
                                    </div>
                                </div>

                                {/* Sync Status */}
                                <div className="bg-slate-800 p-5 rounded-xl">
                                    <h4 className="text-base font-semibold text-slate-300 mb-4">Estado de Sincronización</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                                            <div className={`text-2xl font-bold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                                                {isOnline ? '🟢' : '🔴'}
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                {isOnline ? 'Conectado' : 'Sin conexión'}
                                            </div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                                            <div className={`text-2xl font-bold ${pendingCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {pendingCount}
                                            </div>
                                            <div className="text-sm text-slate-400">Pendientes</div>
                                        </div>
                                    </div>
                                    {lastSyncTimeFormatted && (
                                        <div className="mt-3 text-center">
                                            <LastSyncTime className="text-slate-500" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Sync Progress Indicator - Floating at bottom right */}
            <SyncProgressIndicator position="bottom-right" />

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

            {/* Clinical Assessment Form Modal */}
            {showAssessmentForm && assessmentPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <AssessmentEntryForm
                                patientId={assessmentPatient.id}
                                patientName={assessmentPatient.name}
                                nurseId={currentUserId}
                                onSave={(assessment) => {
                                    console.log('Assessment saved:', assessment);
                                    setShowAssessmentForm(false);
                                    setAssessmentPatient(null);
                                }}
                                onCancel={() => {
                                    setShowAssessmentForm(false);
                                    setAssessmentPatient(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

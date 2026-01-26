/**
 * PendingReviewsPanel Component
 * 
 * Admin panel for reviewing submitted visits pending approval.
 * Displays a list of SUBMITTED visits with nurse name, patient name, visit date,
 * and submission timestamp. Allows admins to view full KARDEX documentation
 * and approve or reject visits.
 * 
 * Features:
 * - Fetches all SUBMITTED visits for the tenant
 * - Displays list sorted by submittedAt ascending (oldest first)
 * - Shows empty state when no pending visits
 * - Click to view full KARDEX documentation
 * - Approve and Reject buttons in detail view
 * - Loading state while fetching
 * - Spanish language UI (Colombian IPS context)
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 7.1
 * 
 * @example
 * <PendingReviewsPanel 
 *   tenantId="tenant-123"
 *   onApprove={(shiftId) => handleApprove(shiftId)}
 *   onReject={(shiftId, reason) => handleReject(shiftId, reason)}
 * />
 */

import React, { useState, useEffect, useCallback } from 'react';
import { client } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type {
  PendingReviewsPanelProps,
  PendingVisit,
  KardexData,
  VitalsData,
  MedicationAdminData,
  TaskCompletionData,
} from '../types/workflow';

// ============================================================================
// Extended Props Interface (with callbacks)
// ============================================================================

interface PendingReviewsPanelExtendedProps extends PendingReviewsPanelProps {
  /** Callback when admin approves a visit */
  onApprove?: (shiftId: string) => void;
  /** Callback when admin rejects a visit with reason */
  onReject?: (shiftId: string, reason: string) => void;
}


// listSubmittedVisitsQuery removed


// ============================================================================
// Mock Data for Development Mode
// ============================================================================

// MOCK_PENDING_VISITS removed



// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Simulates network delay for mock mode.
 */
// simulateNetworkDelay removed


/**
 * Formats a date string to a localized display format.
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formats a timestamp to a relative time string.
 */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

/**
 * Formats a datetime string to time only.
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Gets pain level color based on value.
 */
function getPainLevelColor(level: number): string {
  if (level >= 7) return 'text-red-600 bg-red-50';
  if (level >= 4) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
}

// ============================================================================
// Icons
// ============================================================================

const ClipboardCheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const PillIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const ChecklistIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const InboxIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);


// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Section header for detail view sections.
 */
const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
    <span className="text-indigo-600">{icon}</span>
    <h4 className="text-md font-semibold text-slate-800">{title}</h4>
  </div>
);

/**
 * Vitals display card.
 */
const VitalsCard: React.FC<{ vitals: VitalsData }> = ({ vitals }) => (
  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
    <div className="bg-slate-50 p-3 rounded-lg text-center">
      <div className="text-xs text-slate-500 mb-1">Presión</div>
      <div className="text-lg font-bold text-slate-900">{vitals.sys}/{vitals.dia}</div>
      <div className="text-xs text-slate-400">mmHg</div>
    </div>
    <div className="bg-slate-50 p-3 rounded-lg text-center">
      <div className="text-xs text-slate-500 mb-1">SpO₂</div>
      <div className={`text-lg font-bold ${vitals.spo2 < 95 ? 'text-red-600' : 'text-slate-900'}`}>{vitals.spo2}%</div>
      <div className="text-xs text-slate-400">saturación</div>
    </div>
    <div className="bg-slate-50 p-3 rounded-lg text-center">
      <div className="text-xs text-slate-500 mb-1">FC</div>
      <div className="text-lg font-bold text-slate-900">{vitals.hr}</div>
      <div className="text-xs text-slate-400">bpm</div>
    </div>
    {vitals.temperature && (
      <div className="bg-slate-50 p-3 rounded-lg text-center">
        <div className="text-xs text-slate-500 mb-1">Temp</div>
        <div className={`text-lg font-bold ${vitals.temperature > 37.5 ? 'text-red-600' : 'text-slate-900'}`}>{vitals.temperature}°C</div>
        <div className="text-xs text-slate-400">temperatura</div>
      </div>
    )}
    {vitals.weight && (
      <div className="bg-slate-50 p-3 rounded-lg text-center">
        <div className="text-xs text-slate-500 mb-1">Peso</div>
        <div className="text-lg font-bold text-slate-900">{vitals.weight}</div>
        <div className="text-xs text-slate-400">kg</div>
      </div>
    )}
  </div>
);

/**
 * KARDEX display component (read-only).
 */
const KardexDisplay: React.FC<{ kardex: KardexData }> = ({ kardex }) => (
  <div className="space-y-4">
    {/* General Observations */}
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones Generales</label>
      <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800">{kardex.generalObservations || '-'}</div>
    </div>

    {/* Two-column grid for other fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {kardex.skinCondition && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Condición de la Piel</label>
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800">{kardex.skinCondition}</div>
        </div>
      )}
      {kardex.mobilityStatus && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado de Movilidad</label>
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800">{kardex.mobilityStatus}</div>
        </div>
      )}
      {kardex.nutritionIntake && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ingesta Nutricional</label>
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800">{kardex.nutritionIntake}</div>
        </div>
      )}
      {kardex.painLevel !== undefined && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de Dolor</label>
          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getPainLevelColor(kardex.painLevel)}`}>
            {kardex.painLevel}/10
          </div>
        </div>
      )}
      {kardex.mentalStatus && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado Mental</label>
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800">{kardex.mentalStatus}</div>
        </div>
      )}
      {kardex.environmentalSafety && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Seguridad Ambiental</label>
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800">{kardex.environmentalSafety}</div>
        </div>
      )}
      {kardex.caregiverSupport && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Apoyo del Cuidador</label>
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800">{kardex.caregiverSupport}</div>
        </div>
      )}
    </div>

    {/* Internal Notes - highlighted */}
    {kardex.internalNotes && (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notas Internas</label>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          {kardex.internalNotes}
        </div>
      </div>
    )}
  </div>
);

/**
 * Medications list display.
 */
const MedicationsDisplay: React.FC<{ medications: MedicationAdminData[] }> = ({ medications }) => {
  if (medications.length === 0) {
    return <p className="text-sm text-slate-500 italic">No se administraron medicamentos.</p>;
  }

  return (
    <div className="space-y-3">
      {medications.map((med, index) => (
        <div key={index} className="p-3 bg-slate-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium text-slate-900">{med.medicationName}</span>
              <span className="text-slate-500 ml-2">({med.dosageGiven})</span>
            </div>
            <span className="text-xs text-slate-500">{formatTime(med.time)}</span>
          </div>
          {med.route && <div className="text-xs text-slate-500 mt-1">Vía: {med.route}</div>}
          {med.notes && <div className="text-xs text-slate-600 mt-1">{med.notes}</div>}
        </div>
      ))}
    </div>
  );
};

/**
 * Tasks list display.
 */
const TasksDisplay: React.FC<{ tasks: TaskCompletionData[] }> = ({ tasks }) => {
  if (tasks.length === 0) {
    return <p className="text-sm text-slate-500 italic">No se registraron tareas completadas.</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div key={index} className="p-3 bg-slate-50 rounded-lg flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium text-slate-900">{task.taskDescription}</div>
            <div className="text-xs text-slate-500 mt-1">Completada: {formatTime(task.completedAt)}</div>
            {task.notes && <div className="text-xs text-slate-600 mt-1">{task.notes}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};


// ============================================================================
// Rejection Modal Component
// ============================================================================

interface RejectionModalInternalProps {
  visit: PendingVisit;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const RejectionModal: React.FC<RejectionModalInternalProps> = ({ visit, onConfirm, onCancel, isLoading }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Debe proporcionar un motivo de rechazo');
      return;
    }
    setError(null);
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-100">
          <h3 className="text-lg font-bold text-red-900">Rechazar Visita</h3>
          <p className="text-sm text-red-700 mt-1">
            Visita de {visit.nurseName} para {visit.patientName}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Motivo del Rechazo <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${error ? 'border-red-500' : 'border-slate-300'
              }`}
            rows={4}
            placeholder="Describa el motivo por el cual se rechaza esta documentación..."
            disabled={isLoading}
          />
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            El enfermero recibirá una notificación con este motivo y podrá corregir la documentación.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Rechazando...
              </>
            ) : (
              <>
                <XIcon />
                Rechazar Visita
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// Main PendingReviewsPanel Component
// ============================================================================

export const PendingReviewsPanel: React.FC<PendingReviewsPanelExtendedProps> = ({
  tenantId,
  onApprove,
  onReject,
}) => {
  // State
  const { items: pendingVisits, loadMore, hasMore, isLoading, setItems: setPendingVisits } = usePagination<PendingVisit>();
  const [error, setError] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<PendingVisit | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // UX Polish: Persistent local filter to prevent "zombie" items from reappearing during race conditions
  const [hiddenVisitIds, setHiddenVisitIds] = useState<Set<string>>(new Set());

  /**
   * Fetches pending visits from backend or mock data.
   * Sorts by submittedAt ascending (oldest first) per Requirement 5.5.
   */
  const fetchPendingVisits = useCallback(async () => {
    setError(null);

    try {
      loadMore(async (token) => {
        const response = await client.models.Visit.list({
          filter: { 
            status: { eq: 'SUBMITTED' },
            tenantId: { eq: tenantId } // SECURITY: Filter by tenant!
          },
          limit: 50,
          nextToken: token
        });

        const items = response.data || [];

        const mappedVisits: PendingVisit[] = items.map((item: any) => ({
          id: item.id,
          shiftId: item.shiftId,
          patientName: item.patientName || `Paciente ${item.patientId}`,
          nurseName: item.nurseName || `Enfermero ${item.nurseId}`,
          visitDate: item.createdAt?.split('T')[0] || '',
          submittedAt: item.submittedAt || item.createdAt,
          kardex: typeof item.kardex === 'string' ? JSON.parse(item.kardex) : item.kardex || {},
          vitals: typeof item.vitalsRecorded === 'string' ? JSON.parse(item.vitalsRecorded) : item.vitalsRecorded || { sys: 0, dia: 0, spo2: 0, hr: 0 },
          medications: typeof item.medicationsAdministered === 'string' ? JSON.parse(item.medicationsAdministered) : item.medicationsAdministered || [],
          tasks: typeof item.tasksCompleted === 'string' ? JSON.parse(item.tasksCompleted) : item.tasksCompleted || [],
        }))
          // Filter out items that we know are hidden/rejected locally
          .filter(visit => !hiddenVisitIds.has(visit.id));

        // Sort by submittedAt ascending (oldest first) - Requirement 5.5
        const sorted = mappedVisits.sort(
          (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        );
        return { data: sorted, nextToken: response.nextToken };
      }, true);
    } catch (err) {
      console.error('Error fetching pending visits:', err);
      setError('Error al cargar las visitas pendientes. Por favor, intente de nuevo.');
    }
  }, [loadMore, hiddenVisitIds, tenantId]);

  const handleLoadMore = useCallback(() => {
    loadMore(async (token) => {
      const response = await client.models.Visit.list({
        filter: { 
          status: { eq: 'SUBMITTED' },
          tenantId: { eq: tenantId } // SECURITY: Filter by tenant!
        },
        limit: 50,
        nextToken: token
      });

      const items = response.data || [];
      const mappedVisits: PendingVisit[] = items.map((item: any) => ({
        id: item.id,
        shiftId: item.shiftId,
        patientName: item.patientName || `Paciente ${item.patientId}`,
        nurseName: item.nurseName || `Enfermero ${item.nurseId}`,
        visitDate: item.createdAt?.split('T')[0] || '',
        submittedAt: item.submittedAt || item.createdAt,
        kardex: typeof item.kardex === 'string' ? JSON.parse(item.kardex) : item.kardex || {},
        vitals: typeof item.vitalsRecorded === 'string' ? JSON.parse(item.vitalsRecorded) : item.vitalsRecorded || { sys: 0, dia: 0, spo2: 0, hr: 0 },
        medications: typeof item.medicationsAdministered === 'string' ? JSON.parse(item.medicationsAdministered) : item.medicationsAdministered || [],
        tasks: typeof item.tasksCompleted === 'string' ? JSON.parse(item.tasksCompleted) : item.tasksCompleted || [],
      }))
        .filter(visit => !hiddenVisitIds.has(visit.id));

      return { data: mappedVisits, nextToken: response.nextToken };
    });
  }, [loadMore, hiddenVisitIds, tenantId]);

  // Fetch on mount
  useEffect(() => {
    fetchPendingVisits();
  }, [fetchPendingVisits]);

  /**
   * Handles visit approval.
   * Validates: Requirements 6.1, 6.2, 6.3
   */
  const handleApprove = async () => {
    if (!selectedVisit || !onApprove) return;

    setIsApproving(true);
    try {
      await onApprove(selectedVisit.shiftId);

      // Remove from list after successful approval - Requirement 6.3
      const idToRemove = selectedVisit.id;
      setHiddenVisitIds(prev => new Set(prev).add(idToRemove)); // Add to persistent hidden set
      setPendingVisits(prev => prev.filter(v => v.id !== idToRemove));

      setSelectedVisit(null);
      // alert('Visita Aprobada Correctamente'); // Optional feedback
    } catch (err) {
      console.error('Error approving visit:', err);
      // Error handling is done by parent component
    } finally {
      setIsApproving(false);
    }
  };

  /**
   * Handles visit rejection.
   * Validates: Requirements 7.1, 7.3, 7.4
   */
  const handleReject = async (reason: string) => {
    if (!selectedVisit || !onReject) return;

    setIsRejecting(true);
    try {
      await onReject(selectedVisit.shiftId, reason);

      // Remove from list after successful rejection - Requirement 7.4
      const idToRemove = selectedVisit.id;
      setHiddenVisitIds(prev => new Set(prev).add(idToRemove)); // Add to persistent hidden set
      setPendingVisits(prev => prev.filter(v => v.id !== idToRemove));

      setSelectedVisit(null);
      setShowRejectionModal(false);
      alert('Visita rechazada y enviada a corrección.'); // UX Feedback
    } catch (err) {
      console.error('Error rejecting visit:', err);
      // Error handling is done by parent component
    } finally {
      setIsRejecting(false);
    }
  };

  // ============================================================================
  // Render: Loading State
  // ============================================================================
  if (isLoading && pendingVisits.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" label="Cargando visitas pendientes..." />
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Error State
  // ============================================================================
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchPendingVisits}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Detail View (when a visit is selected)
  // ============================================================================
  if (selectedVisit) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {/* Header with back button */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setSelectedVisit(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeftIcon />
            <span className="font-medium">Volver a la lista</span>
          </button>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
            Pendiente de Revisión
          </span>
        </div>

        {/* Visit Info Header */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{selectedVisit.patientName}</h3>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <UserIcon />
                  {selectedVisit.nurseName}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon />
                  {formatDate(selectedVisit.visitDate)}
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon />
                  Enviado {formatRelativeTime(selectedVisit.submittedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Vitals Section */}
          <section>
            <SectionHeader title="Signos Vitales" icon={<HeartIcon />} />
            <VitalsCard vitals={selectedVisit.vitals} />
          </section>

          {/* KARDEX Section */}
          <section>
            <SectionHeader title="Documentación KARDEX" icon={<ClipboardCheckIcon />} />
            <KardexDisplay kardex={selectedVisit.kardex} />
          </section>

          {/* Medications Section */}
          <section>
            <SectionHeader title="Medicamentos Administrados" icon={<PillIcon />} />
            <MedicationsDisplay medications={selectedVisit.medications} />
          </section>

          {/* Tasks Section */}
          <section>
            <SectionHeader title="Tareas Completadas" icon={<ChecklistIcon />} />
            <TasksDisplay tasks={selectedVisit.tasks} />
          </section>
        </div>

        {/* Action Buttons - Requirement 6.1, 7.1 */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={() => setShowRejectionModal(true)}
            disabled={isApproving || isRejecting}
            className="px-6 py-2.5 text-sm font-bold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <XIcon />
            Rechazar
          </button>
          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="px-6 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isApproving ? (
              <>
                <LoadingSpinner size="sm" />
                Aprobando...
              </>
            ) : (
              <>
                <CheckIcon />
                Aprobar Visita
              </>
            )}
          </button>
        </div>

        {/* Rejection Modal */}
        {showRejectionModal && (
          <RejectionModal
            visit={selectedVisit}
            onConfirm={handleReject}
            onCancel={() => setShowRejectionModal(false)}
            isLoading={isRejecting}
          />
        )}
      </div>
    );
  }

  // ============================================================================
  // Render: Empty State - Requirement 5.4
  // ============================================================================
  if (pendingVisits.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-slate-300 mb-4">
            <InboxIcon />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No hay visitas pendientes</h3>
          <p className="text-sm text-slate-500 text-center max-w-md">
            Todas las visitas han sido revisadas. Las nuevas visitas enviadas por los enfermeros aparecerán aquí.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: List View - Requirements 5.1, 5.2, 5.5
  // ============================================================================
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <ClipboardCheckIcon />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Visitas Pendientes de Revisión</h3>
            <p className="text-sm text-slate-500">{pendingVisits.length} visita{pendingVisits.length !== 1 ? 's' : ''} esperando aprobación</p>
          </div>
        </div>
        <button
          onClick={fetchPendingVisits}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Actualizar lista"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100" data-tour="pending-list">
        {pendingVisits.map((visit) => (
          <button
            key={visit.id}
            onClick={() => setSelectedVisit(visit)}
            className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Patient Name */}
                <h4 className="font-bold text-slate-900 truncate">{visit.patientName}</h4>

                {/* Nurse Name - Requirement 5.2 */}
                <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                  <UserIcon />
                  <span>{visit.nurseName}</span>
                </div>

                {/* Visit Date and Submission Time - Requirement 5.2 */}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CalendarIcon />
                    {formatDate(visit.visitDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon />
                    Enviado {formatRelativeTime(visit.submittedAt)}
                  </span>
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="flex-shrink-0 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
      {hasMore && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-bold text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-sm"
          >
            {isLoading ? 'Cargando más...' : 'Ver más visitas'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingReviewsPanel;

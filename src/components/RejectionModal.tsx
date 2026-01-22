/**
 * RejectionModal Component
 * 
 * Modal dialog for admin rejection of submitted visits.
 * Displays visit summary and requires a rejection reason before calling the rejectVisit mutation.
 * 
 * Features:
 * - Displays visit summary (patient name, nurse name, visit date)
 * - Textarea for rejection reason (required)
 * - Validates reason is not empty before allowing submit
 * - Loading state during mutation
 * - Spanish language UI (Colombian IPS context)
 * 
 * Requirements: 7.2, 7.3, 7.4, 7.5
 * 
 * @example
 * <RejectionModal
 *   visit={selectedVisit}
 *   onConfirm={(reason) => handleReject(reason)}
 *   onCancel={() => setShowModal(false)}
 *   isLoading={isRejecting}
 * />
 */

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type { RejectionModalProps } from '../types/workflow';

// ============================================================================
// Icons
// ============================================================================

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

const ExclamationIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ============================================================================
// Helper Functions
// ============================================================================

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

// ============================================================================
// RejectionModal Component
// ============================================================================

export const RejectionModal: React.FC<RejectionModalProps> = ({
  visit,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  // State for rejection reason input
  const [reason, setReason] = useState('');
  // State for validation error
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Handles the rejection confirmation.
   * Validates that reason is not empty before calling onConfirm.
   * Validates: Requirements 7.3, 7.5
   */
  const handleConfirm = async () => {
    // Validate reason is not empty - Requirement 7.5
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setValidationError('Debe proporcionar un motivo de rechazo');
      return;
    }

    // Clear any previous validation error
    setValidationError(null);

    // Call onConfirm with the reason - Requirement 7.3
    await onConfirm(trimmedReason);
  };

  /**
   * Handles reason input change.
   * Clears validation error when user starts typing.
   */
  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  /**
   * Handles key press events.
   * Allows Ctrl+Enter to submit the form.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey && !isLoading) {
      handleConfirm();
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Rechazar Visita"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <ExclamationIcon />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            ¿Rechazar esta documentación?
          </h3>
          <p className="text-sm text-slate-600">
            El enfermero recibirá una notificación con el motivo del rechazo
            y podrá corregir la documentación para volver a enviarla.
          </p>
        </div>

        {/* Visit Summary Card */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Paciente
            </label>
            <p className="text-lg font-bold text-slate-900">{visit.patientName}</p>
          </div>

          {/* Nurse and Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Nurse Name */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Enfermero/a
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <UserIcon />
                <span>{visit.nurseName}</span>
              </div>
            </div>

            {/* Visit Date */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Fecha de Visita
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CalendarIcon />
                <span>{formatDate(visit.visitDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Reason Input - Requirement 7.2 */}
        <div>
          <label 
            htmlFor="rejection-reason"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Motivo del Rechazo <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={handleReasonChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={4}
            placeholder="Describa el motivo por el cual se rechaza esta documentación..."
            className={`
              w-full px-4 py-3 text-sm border rounded-xl resize-none
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
              disabled:bg-slate-100 disabled:cursor-not-allowed
              ${validationError 
                ? 'border-red-500 bg-red-50' 
                : 'border-slate-300 bg-white'
              }
            `}
          />
          {/* Validation Error Message - Requirement 7.5 */}
          {validationError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {validationError}
            </p>
          )}
          {/* Helper Text */}
          <p className="mt-2 text-xs text-slate-500">
            Proporcione instrucciones claras para que el enfermero pueda corregir la documentación.
            <span className="text-slate-400 ml-1">(Ctrl+Enter para enviar)</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Rechazando...</span>
              </>
            ) : (
              <>
                <XIcon />
                <span>Rechazar Visita</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectionModal;

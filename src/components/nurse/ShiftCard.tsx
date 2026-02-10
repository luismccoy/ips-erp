import { memo } from 'react';
import { AlertCircle, CloudOff, HeartPulse } from 'lucide-react';
import { SyncCloudIcon } from '../SyncStatusBadge';
import { DocumentationButton } from './DocumentationButton';
import { VisitStatusBadge } from './VisitStatusBadge';
import type { Patient } from '../../types';
import type { SyncStatusType } from '../SyncStatusBadge';
import type { ShiftWithVisit } from './types';

interface ShiftCardProps {
    shift: ShiftWithVisit;
    patient?: Patient;
    isCreatingDraft: boolean;
    visitSyncStatus: SyncStatusType;
    isOffline: boolean;
    onStartDocumentation: (shiftId: string) => void;
    onContinueDocumentation: (shiftId: string) => void;
    onGeneratePacket: (shiftId: string) => void;
    onOpenAssessment: (patient: { id: string; name: string }) => void;
}

const ShiftCard = memo(({
    shift,
    patient,
    isCreatingDraft,
    visitSyncStatus,
    isOffline,
    onStartDocumentation,
    onContinueDocumentation,
    onGeneratePacket,
    onOpenAssessment,
}: ShiftCardProps) => {
    const patientName = patient?.name || shift.patientName || 'Paciente Desconocido';
    const patientAddress = patient?.address || shift.location || 'Dirección no disponible';

    return (
        <div className="bg-slate-800 p-4 rounded-xl relative">
            {/* Card Content Container - Ensure proper stacking context */}
            <div className="relative z-10">
                {/* Shift Header */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">
                            {patientName}
                        </h3>
                        {/* Sync status icon for the visit - Always maintain visibility */}
                        {shift.visit && visitSyncStatus !== 'synced' && (
                            <span className="relative z-20">
                                <SyncCloudIcon syncStatus={visitSyncStatus} size={14} />
                            </span>
                        )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold relative z-20 ${shift.status === 'COMPLETED'
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
                    {patientAddress}
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
                    <div className="relative z-20">
                        <VisitStatusBadge
                            status={shift.visit.status}
                            rejectionReason={shift.visit.rejectionReason}
                        />
                    </div>
                )}

                {/* Sync Status Messages - Improved visibility */}
                {visitSyncStatus === 'pending' && (
                    <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1.5 rounded relative z-20">
                        <CloudOff size={12} />
                        <span>Se sincronizará cuando haya conexión</span>
                    </div>
                )}
                {visitSyncStatus === 'error' && (
                    <div className="mt-2 text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 px-2 py-1.5 rounded relative z-20">
                        <AlertCircle size={12} />
                        <span>Error al sincronizar - toque para reintentar</span>
                    </div>
                )}
            </div>

            {/* Action Buttons Container - Fixed positioning and stacking */}
            <div className="mt-4 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex relative z-30">
                {/* Documentation Button - Always rendered but conditionally enabled */}
                <div className="sm:flex-1">
                    <DocumentationButton
                        shift={shift}
                        onStartDocumentation={onStartDocumentation}
                        onContinueDocumentation={onContinueDocumentation}
                        onGeneratePacket={onGeneratePacket}
                        isLoading={isCreatingDraft}
                    />
                </div>

                {/* Clinical Assessment Button - Improved responsive behavior */}
                {shift.status === 'COMPLETED' && (
                    <div className="sm:flex-1">
                        <button
                            onClick={() => {
                                onOpenAssessment({
                                    id: shift.patientId || '',
                                    name: patient?.name || shift.patientName || 'Paciente',
                                });
                            }}
                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative z-30 
                                ${isOffline
                                    ? 'bg-pink-600/10 border border-pink-500/20 text-pink-400/70'
                                    : 'bg-pink-600/20 border border-pink-500/30 text-pink-400 hover:bg-pink-600/30'
                                }`}
                        >
                            <HeartPulse size={16} />
                            <span className="whitespace-nowrap">Valoración Clínica</span>
                            {isOffline && <span className="text-[10px] ml-1">(offline)</span>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

ShiftCard.displayName = 'ShiftCard';

export { ShiftCard };
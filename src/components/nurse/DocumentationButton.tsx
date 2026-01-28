import { memo } from 'react';
import { Clock, Edit3, FileCheck, FileText } from 'lucide-react';
import type { ShiftWithVisit } from './types';

interface DocumentationButtonProps {
    shift: ShiftWithVisit;
    onStartDocumentation: (shiftId: string) => void;
    onContinueDocumentation: (shiftId: string) => void;
    isLoading: boolean;
    onGeneratePacket: (shiftId: string) => void;
}

const DocumentationButton = memo(({
    shift,
    onStartDocumentation,
    onContinueDocumentation,
    isLoading,
    onGeneratePacket,
}: DocumentationButtonProps) => {
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
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
                <FileCheck size={16} />
                Generar Paquete de Facturación
            </button>
        );
    }

    // If visit exists and is SUBMITTED, show "Pending Review" (disabled)
    if (visit && visit.status === 'SUBMITTED') {
        return (
            <div className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500/10 text-yellow-500 text-sm font-medium rounded-lg border border-yellow-500/20">
                <Clock size={16} />
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
});

DocumentationButton.displayName = 'DocumentationButton';

export { DocumentationButton };

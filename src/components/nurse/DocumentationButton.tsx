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
    const visit = shift.visit;

    // Determine button state based on conditions
    const getButtonConfig = () => {
        // Generate Packet State
        if (visit?.status === 'APPROVED') {
            return {
                onClick: () => onGeneratePacket(shift.id),
                icon: <FileCheck size={16} />,
                text: 'Generar Paquete',
                className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                disabled: false
            };
        }

        // Pending Review State
        if (visit?.status === 'SUBMITTED') {
            return {
                onClick: undefined,
                icon: <Clock size={16} />,
                text: 'Esperando Revisión',
                className: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
                disabled: true
            };
        }

        // Continue/Correct Documentation State
        if (visit?.status === 'DRAFT' || visit?.status === 'REJECTED') {
            return {
                onClick: () => onContinueDocumentation(shift.id),
                icon: <Edit3 size={16} />,
                text: visit.status === 'REJECTED' ? 'Corregir Documentación' : 'Continuar',
                className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                disabled: isLoading
            };
        }

        // Start Documentation State (Default)
        return {
            onClick: () => onStartDocumentation(shift.id),
            icon: <FileText size={16} />,
            text: isLoading ? 'Creando...' : 'Iniciar',
            className: 'bg-[#2563eb] hover:bg-blue-700 text-white',
            disabled: isLoading || shift.status === 'CANCELLED'
        };
    };

    const config = getButtonConfig();

    return (
        <button
            onClick={config.onClick}
            disabled={config.disabled}
            className={`
                w-full flex items-center justify-center gap-2 px-3 py-2
                text-sm font-medium rounded-lg transition-colors
                relative z-30
                disabled:opacity-50 disabled:cursor-not-allowed
                ${config.className}
            `}
        >
            {config.icon}
            <span className="whitespace-nowrap">{config.text}</span>
        </button>
    );
});

DocumentationButton.displayName = 'DocumentationButton';

export { DocumentationButton };
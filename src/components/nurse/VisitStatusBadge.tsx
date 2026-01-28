import React, { memo } from 'react';
import { AlertCircle, CheckCircle, Clock, Edit3, XCircle } from 'lucide-react';
import type { VisitStatus } from '../../types/workflow';

interface VisitStatusBadgeProps {
    status: VisitStatus;
    rejectionReason?: string | null;
}

const VisitStatusBadge = memo(({ status, rejectionReason }: VisitStatusBadgeProps) => {
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
});

VisitStatusBadge.displayName = 'VisitStatusBadge';

export { VisitStatusBadge };

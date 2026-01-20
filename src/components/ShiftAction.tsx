import React from 'react';
import { type Schema } from '../../amplify/data/resource';

type Shift = Schema['Shift']['type'];

interface ShiftActionProps {
    shift: Shift;
    onUpdate: (id: string, newStatus: Shift['status']) => void;
}

export const ShiftAction: React.FC<ShiftActionProps> = ({ shift, onUpdate }) => {
    const getNextStatus = (current: Shift['status']): Shift['status'] | null => {
        if (current === 'ASSIGNED') return 'IN_PROGRESS';
        if (current === 'IN_PROGRESS') return 'COMPLETED';
        return null;
    };

    const nextStatus = getNextStatus(shift.status);

    if (!nextStatus) return null;

    return (
        <button
            onClick={() => onUpdate(shift.id, nextStatus)}
            style={{
                padding: '8px 16px',
                backgroundColor: nextStatus === 'IN_PROGRESS' ? '#007bff' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            {nextStatus === 'IN_PROGRESS' ? 'Start Visit' : 'Complete Visit'}
        </button>
    );
};

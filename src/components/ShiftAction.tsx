import React from 'react';
import { type Shift } from '../types';

interface ShiftActionProps {
    shift: Shift;
    onUpdate: (id: string, newStatus: Shift['status']) => void;
}

export const ShiftAction: React.FC<ShiftActionProps> = ({ shift, onUpdate }) => {
    const getNextStatus = (current: Shift['status']): Shift['status'] | null => {
        if (current === 'PENDING') return 'IN_PROGRESS';
        if (current === 'IN_PROGRESS') return 'COMPLETED';
        return null;
    };

    const nextStatus = getNextStatus(shift.status);

    if (!nextStatus) return null;

    const isStart = nextStatus === 'IN_PROGRESS';

    return (
        <button
            className={isStart ? 'btn-warning' : 'btn-success'}
            onClick={() => onUpdate(shift.id, nextStatus)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
            {isStart ? (
                <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Start Visit
                </>
            ) : (
                <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Complete Visit
                </>
            )}
        </button>
    );
};

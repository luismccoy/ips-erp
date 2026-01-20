import React, { useEffect, useState } from 'react';
import { client, MOCK_USER } from '../amplify-utils';
import { type Schema } from '../../amplify/data/resource';
import { ShiftAction } from './ShiftAction';

type Shift = Schema['Shift']['type'];

export const NurseDashboard: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);

    useEffect(() => {
        // Real-time subscription to assignments for this tenant
        // In a real app, we would also filter by nurseId owner auth
        const sub = client.models.Shift.observeQuery({
            filter: {
                tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] }
            }
        }).subscribe({
            next: (data) => setShifts([...data.items]),
            error: (err) => console.error('Subscription error:', err)
        });

        return () => sub.unsubscribe();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: Shift['status']) => {
        // Optimistic UI updates happen automatically via observeQuery if we write to the local store
        try {
            await client.models.Shift.update({
                id,
                status: newStatus,
                // Add GPS proof placeholder
                ...(newStatus === 'IN_PROGRESS' ? { startedAt: new Date().toISOString() } : {}),
                ...(newStatus === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}),
            });
        } catch (err) {
            console.error('Failed to update shift:', err);
            alert('Failed to update status. You might be offline (check console).');
        }
    };

    const handleCreateMockShift = async () => {
        await client.models.Shift.create({
            tenantId: MOCK_USER.attributes['custom:tenantId'],
            status: 'ASSIGNED',
            clinicalNote: 'Routine wound care',
            nurseId: 'mock-nurse-id' // Should match user sub in real app
        });
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Dashboard: {MOCK_USER.username}</h1>
            <p>Tenant: {MOCK_USER.attributes['custom:tenantId']}</p>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={handleCreateMockShift}>+ Simul Assignment</button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
                {shifts.map(shift => (
                    <div key={shift.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>Status: {shift.status}</strong>
                                <p>{shift.clinicalNote}</p>
                                <small>ID: {shift.id.slice(0, 8)}...</small>
                            </div>
                            <ShiftAction shift={shift} onUpdate={handleUpdateStatus} />
                        </div>
                    </div>
                ))}
                {shifts.length === 0 && <p>No shifts assigned.</p>}
            </div>
        </div>
    );
};

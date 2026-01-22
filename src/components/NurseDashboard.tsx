import React, { useEffect, useState } from 'react';
import { client, MOCK_USER } from '../amplify-utils';
import { type Shift } from '../types';
import { ShiftAction } from './ShiftAction';
import { useApiCall } from '../hooks/useApiCall';
import { ErrorAlert } from './ui/ErrorAlert';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import styles from './NurseDashboard.module.css';

type BadgeVariant = 'info' | 'warning' | 'success' | 'error' | 'default';

export const NurseDashboard: React.FC = () => {
    const api = useApiCall();
    const [shifts, setShifts] = useState<Shift[]>([]);

    useEffect(() => {
        // Real-time subscription to assignments for this tenant
        const query = client.models.Shift.observeQuery({
            filter: {
                tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] }
            }
        });
        
        const sub = (query as any).subscribe({
            next: (data: any) => setShifts([...data.items]),
            error: (err: Error) => console.error('Subscription error:', err)
        });

        return () => sub.unsubscribe();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: Shift['status']) => {
        try {
            await api.execute((async () => {
                await client.models.Shift.update({
                    id,
                    status: newStatus,
                    ...(newStatus === 'IN_PROGRESS' ? { startedAt: new Date().toISOString() } : {}),
                    ...(newStatus === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}),
                });
            })());
        } catch (err) {
            console.error('Failed to update shift:', err);
        }
    };

    const handleCreateMockShift = async () => {
        try {
            await api.execute(client.models.Shift.create({
                tenantId: MOCK_USER.attributes['custom:tenantId'],
                status: 'ASSIGNED',
                patientName: 'Test Patient',
                location: 'Test Location',
                nurseName: MOCK_USER.username,
                clinicalNote: 'Routine wound care',
                nurseId: 'mock-nurse-id'
            }));
        } catch (err) {
            console.error('Failed to create shift', err);
        }
    };

    const getStatusBadgeVariant = (status: string): BadgeVariant => {
        switch (status) {
            case 'ASSIGNED': return 'info';
            case 'IN_PROGRESS': return 'warning';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    return (
        <div className={styles.nurseDashboard}>
            {api.error && (
                <ErrorAlert message={api.error.message} className="mb-4" onDismiss={api.reset} />
            )}

            <div className={styles.dashboardHeader}>
                <Card className={styles.userInfoCard} noPadding>
                    <div className={styles.userAvatar}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.userDetails}>
                        <h2>Welcome, {MOCK_USER.username}</h2>
                        <p className={styles.tenantInfo}>
                            <svg className={styles.iconInline} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Tenant: {MOCK_USER.attributes['custom:tenantId']}
                        </p>
                    </div>
                </Card>

                <Button onClick={handleCreateMockShift} icon={
                    <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                }>
                    Create Test Shift
                </Button>
            </div>

            <Card className={styles.shiftsSection} noPadding>
                <div style={{ padding: '2rem' }}>
                    <div className={styles.sectionHeader}>
                        <h3>My Shifts</h3>
                        <div className={styles.shiftCount}>
                            <span className={styles.countNumber}>{shifts.length}</span>
                            <span className={styles.countLabel}>{shifts.length === 1 ? 'Shift' : 'Shifts'}</span>
                        </div>
                    </div>

                    {shifts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <h4>No Shifts Assigned</h4>
                            <p>You don't have any shifts assigned yet. Create a test shift to get started.</p>
                        </div>
                    ) : (
                        <div className={styles.shiftsGrid}>
                            {shifts.map((shift, index) => (
                                <Card key={shift.id} className={`${styles.shiftCard} animate-slide-in`} noPadding style={{ animationDelay: `${index * 0.1}s`, padding: '1.5rem' }}>
                                    <div className={styles.shiftHeader}>
                                        <Badge variant={getStatusBadgeVariant(shift.status ?? 'ASSIGNED')}>
                                            {shift.status?.replace('_', ' ') ?? 'Assigned'}
                                        </Badge>
                                        <span className={styles.shiftId}>ID: {shift.id?.slice(0, 8) ?? 'N/A'}</span>
                                    </div>

                                    <div className={styles.shiftBody}>
                                        <div className={styles.shiftNote}>
                                            <svg className={styles.noteIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p>{shift.clinicalNote || 'No notes provided'}</p>
                                        </div>

                                        {shift.startedAt && (
                                            <div className={styles.shiftTimestamp}>
                                                <svg className={styles.iconInline} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Started: {new Date(shift.startedAt).toLocaleString()}
                                            </div>
                                        )}

                                        {shift.completedAt && (
                                            <div className={styles.shiftTimestamp}>
                                                <svg className={styles.iconInline} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Completed: {new Date(shift.completedAt).toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.shiftFooter}>
                                        <ShiftAction shift={shift} onUpdate={handleUpdateStatus} />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};


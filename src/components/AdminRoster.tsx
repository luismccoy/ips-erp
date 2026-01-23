import React, { useState, useEffect } from 'react';
import { client, MOCK_USER } from '../amplify-utils';
import { useApiCall } from '../hooks/useApiCall';

import { ErrorAlert } from './ui/ErrorAlert';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { type Shift, type Nurse } from '../types';
import styles from './AdminRoster.module.css';

interface Assignment {
    shiftId: string;
    nurseId: string;
    nurseName?: string;
}

interface RosterActionResponse {
    assignments: Assignment[];
}

export const AdminRoster: React.FC = () => {
    const api = useApiCall<RosterActionResponse>(); // Generic API handler for roster actions
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);

    useEffect(() => {
        const tenantId = MOCK_USER.attributes['custom:tenantId'];

        const nurseQuery = client.models.Nurse.observeQuery({
            filter: { tenantId: { eq: tenantId } }
        });

        const nurseSub = (nurseQuery as any).subscribe({
            next: (data: any) => setNurses(data.items)
        });

        const shiftQuery = client.models.Shift.observeQuery({
            filter: {
                tenantId: { eq: tenantId },
                status: { eq: 'PENDING' }
            }
        });

        const shiftSub = (shiftQuery as any).subscribe({
            next: (data: any) => setShifts(data.items)
        });

        return () => {
            nurseSub.unsubscribe();
            shiftSub.unsubscribe();
        };
    }, []);

    const handleAutoAssign = async () => {
        if (shifts.length === 0 || nurses.length === 0) {
            alert('No hay turnos pendientes o enfermeros disponibles.');
            return;
        }

        try {
            await api.execute((async () => {
                const result: any = await client.queries.generateRoster({
                    nurses: JSON.stringify(nurses),
                    unassignedShifts: JSON.stringify(shifts)
                });

                if (result.errors && result.errors.length > 0) throw new Error(result.errors[0].message);

                if (result.data) {
                    const parsedResult = JSON.parse(result.data as string) as RosterActionResponse;
                    setAssignments(parsedResult.assignments || []);
                    return parsedResult;
                }
                throw new Error('No data received');
            })());
        } catch (err) {
            console.error('AI Roster failed:', err);
        }
    };

    const handleConfirmAssignments = async () => {
        try {
            await api.execute((async () => {
                for (const assignment of assignments) {
                    if (assignment.nurseId !== 'UNASSIGNED') {
                        await (client.models.Shift as any).update({
                            id: assignment.shiftId,
                            nurseId: assignment.nurseId,
                            status: 'PENDING'
                        });
                    }
                }
                setAssignments([]);
                alert('¡Roster confirmado y asignado exitosamente!');
                return { assignments: [] };
            })());
        } catch (err) {
            console.error('Confirm failed:', err);
        }
    };

    return (
        <div className={styles.adminRoster}>
            <div className={styles.rosterGrid}>
                <Card className={`${styles.rosterCard} main-card`} noPadding>
                    <div style={{ padding: '2rem' }}>
                        <div className={styles.rosterHeader}>
                            <div className={styles.headerIcon}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className={styles.headerText}>
                                <h2>Roster Architect</h2>
                                <p>Powered by Claude 3.5 Sonnet</p>
                            </div>
                        </div>

                        <div className={styles.rosterDescription}>
                            <p>Optimiza automáticamente las asignaciones de turnos basadas en habilidades, proximidad y carga de trabajo.</p>
                        </div>

                        <div className={styles.statsRow}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Turnos Pendientes</span>
                                <span className={styles.statValue}>{shifts.length}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Personal Disponible</span>
                                <span className={styles.statValue}>{nurses.length}</span>
                            </div>
                        </div>

                        {api.error && (
                            <ErrorAlert message={api.error?.message || 'Unknown error'} className="mb-4" onDismiss={api.reset} />
                        )}

                        <Button
                            variant="secondary"
                            onClick={handleAutoAssign}
                            disabled={api.loading || shifts.length === 0}
                            isLoading={api.loading}
                            className="w-full mt-4 flex justify-center items-center gap-2"
                        >
                            {api.loading ? 'Procesando...' : 'Autocompletar Roster'}
                        </Button>

                        {assignments.length > 0 && (
                            <div className={`${styles.assignmentsSection} animate-slide-in`}>
                                <h3>Asignaciones Sugeridas</h3>
                                <div className={styles.assignmentsList}>
                                    {assignments.map((a, idx) => (
                                        <div key={idx} className={styles.assignmentItem}>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.shiftId}>Turno: {a.shiftId.split('-')[1]}</span>
                                                <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span className={styles.nurseName}>{a.nurseName || 'Sin Asignar'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="success"
                                    onClick={handleConfirmAssignments}
                                    className="w-full mt-4"
                                >
                                    Confirmar y Publicar Roster
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="roster-sidebar">
                    <Card className={styles.glassCard}>
                        <h3>Personal Activo</h3>
                        <div className={styles.sidebarList}>
                            {nurses.map(n => (
                                <div key={n.id} className={styles.sidebarItem}>
                                    <span className={styles.name}>{n.name}</span>
                                    <div className={styles.skillsTags}>
                                        {n.skills?.map((s: string) => <Badge key={s} variant="neutral" className={styles.skillTag}>{s}</Badge>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div >
    );
};

import React, { useEffect, useState } from 'react';
import { client, MOCK_USER } from '../amplify-utils';
import { type Patient, type Medication, type Task } from '../types';

export const PatientDashboard: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        // Subscribe to patients for this tenant
        const patientQuery = client.models.Patient.observeQuery({
            filter: {
                tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] }
            }
        });
        
        const patientSub = (patientQuery as any).subscribe({
            next: (data: any) => {
                setPatients([...data.items]);
                if (data.items.length > 0 && !selectedPatient) {
                    setSelectedPatient(data.items[0]);
                }
            },
            error: (err: Error) => console.error('Patient sub error:', err)
        });

        return () => patientSub.unsubscribe();
    }, [selectedPatient]);

    useEffect(() => {
        if (!selectedPatient) return;

        // Subscribe to medications for selected patient
        const medQuery = client.models.Medication.observeQuery({
            filter: {
                patientId: { eq: selectedPatient.id }
            }
        });
        
        const medSub = (medQuery as any).subscribe({
            next: (data: any) => setMedications([...data.items]),
            error: (err: Error) => console.error('Medication sub error:', err)
        });

        // Subscribe to tasks for selected patient
        const taskQuery = client.models.Task.observeQuery({
            filter: {
                patientId: { eq: selectedPatient.id }
            }
        });
        
        const taskSub = (taskQuery as any).subscribe({
            next: (data: any) => setTasks([...data.items]),
            error: (err: Error) => console.error('Task sub error:', err)
        });

        return () => {
            medSub.unsubscribe();
            taskSub.unsubscribe();
        };
    }, [selectedPatient]);

    const handleToggleTask = async (task: Task) => {
        await client.models.Task.update({
            id: task.id,
            isCompleted: !task.isCompleted
        });
    };

    if (!selectedPatient) {
        return <div className="loading">Loading patient data...</div>;
    }

    return (
        <div className="patient-dashboard-container">
            <aside className="patient-sidebar glass">
                <h3>Mis Pacientes</h3>
                <div className="patient-list-sidebar">
                    {patients.map(p => (
                        <div
                            key={p.id}
                            className={`sidebar-patient-item ${selectedPatient.id === p.id ? 'active' : ''}`}
                            onClick={() => setSelectedPatient(p)}
                        >
                            <span className="name">{p.name}</span>
                            <span className="doc-id-small">{p.documentId}</span>
                        </div>
                    ))}
                </div>
            </aside>

            <div className="patient-dashboard-main">
                <div className="patient-header-grid">
                    <div className="patient-card glass">
                        <div className="card-header">
                            <div className="avatar">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="info">
                                <h2>{selectedPatient.name}</h2>
                                <p className="doc-id">CC: {selectedPatient.documentId}</p>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="info-row">
                                <span className="label">Edad:</span>
                                <span className="value">{selectedPatient.age} años</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Dirección:</span>
                                <span className="value">{selectedPatient.address}</span>
                            </div>
                            <div className="info-row highlight">
                                <span className="label">Diagnóstico:</span>
                                <span className="value">{selectedPatient.diagnosis}</span>
                            </div>
                        </div>
                    </div>

                    <div className="task-summary-card glass">
                        <div className="summary-stat">
                            <span className="stat-value">{tasks.filter(t => t.isCompleted).length}/{tasks.length}</span>
                            <span className="stat-label">Tareas Completadas</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-value text-primary">{medications.filter(m => m.status === 'ACTIVE').length}</span>
                            <span className="stat-label">Medicamentos Activos</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <section className="medications-section glass">
                        <div className="section-header">
                            <h3>Digital Kardex (Medicamentos)</h3>
                            <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.83,21.17l-.33-.33c-2-2-2-5.17,0-7.17L13.67,4.83c2-2,5.17-2,7.17,0L21.17,5.17c2,2,2,5.17,0,7.17L12.33,21.17C10.33,23.17,7.17,23.17,5.17,21.17z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12.33,21.17l-7.17-7.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="med-list">
                            {medications.map(med => (
                                <div key={med.id} className={`med-item ${med.status.toLowerCase()}`}>
                                    <div className="med-info">
                                        <span className="med-name">{med.name}</span>
                                        <span className="med-details">{med.dosage} • {med.frequency}</span>
                                    </div>
                                    <span className={`status-pill ${med.status.toLowerCase()}`}>{med.status}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="tasks-section glass">
                        <div className="section-header">
                            <h3>Ruta de Cuidado (Tareas)</h3>
                            <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 11l3 3l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="task-list">
                            {tasks.map(task => (
                                <div key={task.id} className="task-item" onClick={() => handleToggleTask(task)}>
                                    <div className={`checkbox ${task.isCompleted ? 'checked' : ''}`}>
                                        {task.isCompleted && (
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="task-content">
                                        <span className={`task-desc ${task.isCompleted ? 'completed' : ''}`}>{task.description}</span>
                                        {task.dueDate && <span className="task-date">Vence: {new Date(task.dueDate).toLocaleTimeString()}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <style>{`
                .patient-dashboard-container {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 1.5rem;
                    min-height: 80vh;
                }

                .patient-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    height: fit-content;
                    position: sticky;
                    top: 1.5rem;
                }

                .patient-sidebar h3 {
                    margin: 0;
                    font-size: 1.125rem;
                    color: var(--neutral-800);
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--neutral-100);
                }

                .patient-list-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .sidebar-patient-item {
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    border: 2px solid transparent;
                }

                .sidebar-patient-item:hover {
                    background: var(--neutral-50);
                }

                .sidebar-patient-item.active {
                    background: var(--primary-50);
                    border-color: var(--primary-500);
                }

                .sidebar-patient-item .name {
                    font-weight: 700;
                    color: var(--neutral-900);
                }

                .sidebar-patient-item .doc-id-small {
                    font-size: 0.75rem;
                    color: var(--neutral-500);
                    font-family: monospace;
                }

                .patient-dashboard-main {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .glass {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                    border-radius: var(--radius-xl);
                    padding: 1.5rem;
                }

                .patient-header-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }

                .patient-card .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--neutral-100);
                }

                .avatar {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .avatar svg { width: 32px; height: 32px; }

                .info h2 { margin: 0; font-size: 1.5rem; color: var(--neutral-900); }
                .doc-id { margin: 4px 0 0; color: var(--neutral-500); font-weight: 600; font-family: monospace; }

                .card-body {
                    display: grid;
                    gap: 0.75rem;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.95rem;
                }

                .info-row.highlight {
                    background: var(--primary-50);
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    margin-top: 0.5rem;
                }

                .info-row .label { color: var(--neutral-500); font-weight: 500; }
                .info-row .value { color: var(--neutral-800); font-weight: 700; }
                .info-row.highlight .value { color: var(--primary-700); }

                .task-summary-card {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 1.5rem;
                    text-align: center;
                }

                .summary-stat {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value { font-size: 2.25rem; font-weight: 800; color: var(--neutral-900); line-height: 1; }
                .stat-label { font-size: 0.875rem; color: var(--neutral-500); font-weight: 600; margin-top: 4px; }
                .text-primary { color: var(--primary-600); }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .section-header h3 { margin: 0; font-size: 1.125rem; color: var(--neutral-900); }
                .icon { width: 24px; height: 24px; color: var(--primary-500); }

                .med-list, .task-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .med-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: var(--neutral-50);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--neutral-100);
                    transition: transform 0.2s;
                }

                .med-item:hover { transform: translateX(4px); }

                .med-info { display: flex; flex-direction: column; gap: 2px; }
                .med-name { font-weight: 700; color: var(--neutral-800); }
                .med-details { font-size: 0.875rem; color: var(--neutral-500); }

                .status-pill {
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .status-pill.active { background: #dcfce7; color: #15803d; }
                .status-pill.discontinued { background: #fee2e2; color: #991b1b; }

                .task-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    background: white;
                    border: 1px solid var(--neutral-100);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .task-item:hover { border-color: var(--primary-300); background: var(--primary-50); }

                .checkbox {
                    width: 24px;
                    height: 24px;
                    border: 2px solid var(--neutral-300);
                    border-radius: 6px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .checkbox.checked { background: var(--success-500); border-color: var(--success-500); }

                .task-content { display: flex; flex-direction: column; gap: 2px; }
                .task-desc { font-weight: 600; color: var(--neutral-800); }
                .task-desc.completed { text-decoration: line-through; color: var(--neutral-400); }
                .task-date { font-size: 0.75rem; color: var(--neutral-500); }

                @media (max-width: 1024px) {
                    .patient-dashboard-container { grid-template-columns: 1fr; }
                    .patient-sidebar { position: static; }
                    .patient-header-grid, .dashboard-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

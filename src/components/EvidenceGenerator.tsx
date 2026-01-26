import React, { useEffect, useState } from 'react';
import { client, MOCK_USER } from '../amplify-utils';
import { type Patient } from '../types';
import { useToast } from './ui/Toast';

interface HistoryItem {
    id: string;
    date: string;
    patient: string;
    status: 'COMPLETED' | 'READY';
    size: string;
}

export const EvidenceGenerator: React.FC = () => {
    const { showToast } = useToast();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([
        { id: 'EXP-001', date: '2026-01-15', patient: 'Juan Manuel Santos', status: 'COMPLETED', size: '2.4 MB' },
        { id: 'EXP-002', date: '2026-01-18', patient: 'Maria Rodriguez', status: 'READY', size: '1.8 MB' }
    ]);

    useEffect(() => {
        setLoadingPatients(true);
        const query = client.models.Patient.observeQuery({
            filter: { tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] } }
        });
        
        const sub = (query as any).subscribe({
            next: (data: any) => {
                setPatients(data.items);
                setLoadingPatients(false);
            },
            error: () => setLoadingPatients(false)
        });
        return () => sub.unsubscribe();
    }, []);

    const handleGenerate = async () => {
        if (!selectedPatient) {
            showToast('warning', 'Selección requerida', 'Por favor seleccione un paciente.');
            return;
        }
        setIsGenerating(true);
        // Simulate PDF/Zip generation
        await new Promise(r => setTimeout(r, 3000));
        const patientName = patients.find(p => p.id === selectedPatient)?.name || 'Unknown';
        setHistory([{
            id: `EXP-${Math.floor(Math.random() * 900) + 100}`,
            date: new Date().toISOString().split('T')[0],
            patient: patientName,
            status: 'READY',
            size: '2.1 MB'
        }, ...history]);
        setIsGenerating(false);
        showToast('success', '¡Éxito!', 'Paquete de evidencia generado exitosamente.');
    };

    return (
        <div className="evidence-container">
            <div className="evidence-header glass">
                <div className="header-text">
                    <h2>Generador de Paquetes de Evidencia</h2>
                    <p>Exportación masiva de soportes clínicos, GPS y firmas para auditorías de ADRES y EPS.</p>
                </div>
            </div>

            <div className="evidence-main-grid">
                <div className="generator-card glass">
                    <h3>Nuevo Paquete</h3>
                    <div className="form-group">
                        <label>Seleccionar Paciente</label>
                        <div className="select-wrapper">
                            <select
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className="select-input"
                                disabled={loadingPatients}
                            >
                                {loadingPatients ? (
                                    <option value="">Cargando pacientes...</option>
                                ) : (
                                    <>
                                        <option value="">-- Seleccione un paciente --</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.documentId})</option>
                                        ))}
                                    </>
                                )}
                            </select>
                            {loadingPatients && <div className="select-spinner"></div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Rango de Fechas</label>
                        <div className="date-range">
                            <input type="date" className="date-input" defaultValue="2026-01-01" />
                            <span>a</span>
                            <input type="date" className="date-input" defaultValue="2026-01-31" />
                        </div>
                    </div>

                    <div className="inclusions">
                        <label className="checkbox-item">
                            <input type="checkbox" defaultChecked /> Notas Clínicas (XML/PDF)
                        </label>
                        <label className="checkbox-item">
                            <input type="checkbox" defaultChecked /> Registros de GPS (Proof of Presence)
                        </label>
                        <label className="checkbox-item">
                            <input type="checkbox" defaultChecked /> Firmas Digitales del Paciente
                        </label>
                        <label className="checkbox-item">
                            <input type="checkbox" defaultChecked /> Registro Fotográfico (Si aplica)
                        </label>
                    </div>

                    <button
                        className="btn-primary btn-full"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generando Paquete...' : 'Generar Soporte para Cobro'}
                    </button>
                    {isGenerating && (
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill"></div>
                        </div>
                    )}
                </div>

                <div className="history-card glass">
                    <h3>Paquetes Generados Recientemente</h3>
                    <div className="history-list">
                        {history.map(item => (
                            <div key={item.id} className="history-item">
                                <div className="item-info">
                                    <span className="id">{item.id}</span>
                                    <span className="patient">{item.patient}</span>
                                    <span className="date">{item.date}</span>
                                </div>
                                <div className="item-actions">
                                    <span className="size">{item.size}</span>
                                    <button className="btn-download">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .evidence-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .evidence-header { padding: 1.5rem 2rem; }
                .evidence-header h2 { margin: 0; color: var(--neutral-900); }
                .evidence-header p { margin: 4px 0 0; color: var(--neutral-500); }

                .evidence-main-grid {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 1.5rem;
                }

                .generator-card, .history-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .generator-card h3, .history-card h3 { margin: 0; font-size: 1.125rem; color: var(--neutral-800); }

                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.75rem; font-weight: 700; color: var(--neutral-500); text-transform: uppercase; }

                .select-wrapper {
                    position: relative;
                }
                .select-input, .date-input {
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--neutral-200);
                    background: white;
                    font-size: 0.95rem;
                    color: var(--neutral-800);
                    width: 100%;
                }
                .select-input:disabled {
                    background: var(--neutral-50);
                    cursor: wait;
                }
                .select-spinner {
                    position: absolute;
                    right: 2.5rem;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 16px;
                    height: 16px;
                    border: 2px solid var(--neutral-200);
                    border-top-color: var(--primary-500);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

                .date-range { display: flex; align-items: center; gap: 0.5rem; }
                .date-range span { color: var(--neutral-400); font-weight: 600; }

                .inclusions { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; background: var(--neutral-50); border-radius: var(--radius-md); }
                .checkbox-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: var(--neutral-700); font-weight: 500; cursor: pointer; }
                .checkbox-item input { width: 18px; height: 18px; cursor: pointer; }

                .btn-full { width: 100%; justify-content: center; height: 3rem; font-size: 1rem; }

                .progress-bar-container { height: 6px; background: var(--neutral-100); border-radius: 3px; overflow: hidden; margin-top: -0.5rem; }
                .progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--primary-500), var(--primary-300)); width: 0%; animation: progress 3s linear forwards; }
                
                @keyframes progress { 
                    0% { width: 0%; }
                    100% { width: 100%; }
                }

                .history-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .history-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: white;
                    border: 1px solid var(--neutral-100);
                    border-radius: var(--radius-md);
                    transition: transform 0.2s;
                }
                .history-item:hover { transform: translateX(8px); border-color: var(--primary-200); }

                .item-info { display: flex; flex-direction: column; gap: 2px; }
                .item-info .id { font-size: 0.75rem; font-weight: 700; color: var(--primary-600); font-family: monospace; }
                .item-info .patient { font-weight: 700; color: var(--neutral-800); }
                .item-info .date { font-size: 0.75rem; color: var(--neutral-500); font-weight: 600; }

                .item-actions { display: flex; align-items: center; gap: 1.5rem; }
                .item-actions .size { font-size: 0.875rem; color: var(--neutral-500); font-weight: 600; }
                
                .btn-download {
                    background: var(--neutral-100);
                    border: none;
                    color: var(--neutral-600);
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-download:hover { background: var(--primary-100); color: var(--primary-700); }
                .btn-download svg { width: 20px; height: 20px; }

                .glass {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                    border-radius: var(--radius-xl);
                }

                @media (max-width: 1024px) {
                    .evidence-main-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

import React, { useState } from 'react';

export const RipsValidator: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [validating, setValidating] = useState(false);
    const [results, setResults] = useState<{ errors: string[], warnings: string[], status: 'PENDING' | 'PASS' | 'FAIL' }>({
        errors: [],
        warnings: [],
        status: 'PENDING'
    });

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResults({ errors: [], warnings: [], status: 'PENDING' });
        }
    };

    const runValidation = async () => {
        if (!file) return;
        setValidating(true);
        // Simulate RIPS validation logic (Colombia resolution 3374/2000 & new 2275/2023)
        await new Promise(r => setTimeout(r, 2500));

        const mockErrors = [
            "Fila 45: Código de diagnóstico 'Z00' no válido para procedimiento de urgencias.",
            "Fila 102: Falta valor de autorización para paciente CC: 12345678."
        ];
        const mockWarnings = [
            "Fila 12: Valor de copago es 0, verifique si es correcto.",
            "Fila 88: Fecha de prestación es fin de semana."
        ];

        setResults({
            errors: mockErrors,
            warnings: mockWarnings,
            status: 'FAIL'
        });
        setValidating(false);
    };

    return (
        <div className="rips-validator-container">
            <div className="rips-header glass">
                <div className="header-text">
                    <h2>Validador de RIPS (Resolución 2275)</h2>
                    <p>Cargue sus archivos AC, AP, US, etc. para validar el cumplimiento de la norma técnica colombiana.</p>
                </div>
            </div>

            <div className="validator-grid">
                <div className="upload-card glass">
                    <h3>Cargar Archivos</h3>
                    <div className="drop-zone" onClick={() => document.getElementById('rips-input')?.click()}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>{file ? file.name : 'Seleccionar archivo .zip o .txt'}</p>
                        <input id="rips-input" type="file" hidden onChange={handleUpload} />
                    </div>

                    <div className="rules-preview">
                        <h4>Reglas Activas (JSON/2275):</h4>
                        <ul>
                            <li>Estructura de archivos US, AC, AP, AM, AT</li>
                            <li>Consistencia de Cédula vs DX</li>
                            <li>Formatos de Fecha (YYYY-MM-DD)</li>
                            <li>Validación de CUPS y CIE-10</li>
                        </ul>
                    </div>

                    <button
                        className="btn-secondary btn-full"
                        disabled={!file || validating}
                        onClick={runValidation}
                    >
                        {validating ? 'Validando...' : 'Iniciar Validación Técnica'}
                    </button>
                </div>

                <div className="results-card glass">
                    <h3>Resultados de la Validación</h3>

                    {results.status === 'PENDING' && !validating && (
                        <div className="empty-results">
                            <p>Cargue un archivo para ver los resultados.</p>
                        </div>
                    )}

                    {validating && (
                        <div className="loading-results">
                            <div className="spinner"></div>
                            <p>Analizando reglas de negocio...</p>
                        </div>
                    )}

                    {results.status !== 'PENDING' && !validating && (
                        <div className="results-content animate-fade-in">
                            <div className={`status-summary ${results.status.toLowerCase()}`}>
                                <span className="status-title">RIPS {results.status === 'PASS' ? 'VÁLIDO' : 'CON ERRORES'}</span>
                                <span className="status-meta">{results.errors.length} errores críticos, {results.warnings.length} advertencias.</span>
                            </div>

                            <div className="result-section">
                                <h4>Errores Críticos ({results.errors.length})</h4>
                                <div className="error-list">
                                    {results.errors.map((e, i) => (
                                        <div key={i} className="error-item">
                                            <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 8v4M12 16h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {e}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="result-section">
                                <h4>Advertencias ({results.warnings.length})</h4>
                                <div className="warning-list">
                                    {results.warnings.map((w, i) => (
                                        <div key={i} className="warning-item">
                                            <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {w}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .rips-validator-container { display: flex; flex-direction: column; gap: 1.5rem; }
                .rips-header { padding: 1.5rem 2rem; }
                .rips-header h2 { margin: 0; color: var(--neutral-900); }
                .rips-header p { margin: 4px 0 0; color: var(--neutral-500); }

                .validator-grid { display: grid; grid-template-columns: 350px 1fr; gap: 1.5rem; }
                .upload-card, .results-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .upload-card h3, .results-card h3 { margin: 0; font-size: 1.125rem; color: var(--neutral-800); }

                .drop-zone {
                    height: 120px;
                    border: 2px dashed var(--neutral-200);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--neutral-400);
                }
                .drop-zone:hover { border-color: var(--primary-400); background: var(--primary-50); color: var(--primary-600); }
                .drop-zone svg { width: 32px; height: 32px; }
                .drop-zone p { margin: 0; font-size: 0.875rem; font-weight: 600; text-align: center; padding: 0 1rem; }

                .rules-preview { background: var(--neutral-50); padding: 1rem; border-radius: var(--radius-md); }
                .rules-preview h4 { margin: 0 0 0.75rem 0; font-size: 0.75rem; font-weight: 700; color: var(--neutral-500); text-transform: uppercase; }
                .rules-preview ul { margin: 0; padding-left: 1.25rem; font-size: 0.8rem; color: var(--neutral-600); display: flex; flex-direction: column; gap: 4px; }

                .btn-full { width: 100%; justify-content: center; height: 3rem; }

                .empty-results, .loading-results {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--neutral-400);
                    padding: 4rem 2rem;
                }

                .spinner {
                    width: 40px; height: 40px;
                    border: 4px solid var(--neutral-100);
                    border-top-color: var(--primary-500);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .status-summary {
                    padding: 1rem 1.5rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .status-summary.fail { background: #fee2e2; border-left: 4px solid #ef4444; }
                .status-summary.pass { background: #dcfce7; border-left: 4px solid #10b981; }
                .status-title { font-weight: 800; font-size: 1.125rem; }
                .status-meta { font-size: 0.85rem; font-weight: 600; }

                .result-section { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
                .result-section h4 { margin: 0; font-size: 0.875rem; color: var(--neutral-700); border-bottom: 1px solid var(--neutral-100); padding-bottom: 0.5rem; }

                .error-list, .warning-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .error-item, .warning-item {
                    display: flex;
                    gap: 0.75rem;
                    font-size: 0.875rem;
                    padding: 0.75rem;
                    border-radius: 6px;
                    align-items: flex-start;
                }
                .error-item { background: #fff1f2; color: #9f1239; }
                .warning-item { background: #fffbeb; color: #92400e; }
                .error-item .icon, .warning-item .icon { width: 18px; height: 18px; flex-shrink: 0; }

                .glass {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                    border-radius: var(--radius-xl);
                }

                @media (max-width: 1024px) { .validator-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
};

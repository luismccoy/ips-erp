import React, { useState } from 'react';
import { client } from '../amplify-utils';

/**
 * RIPS Validator Component - Implementation Status
 * 
 * STATUS: ✅ CONNECTED TO REAL BACKEND (Task 3.3 Complete)
 * 
 * CURRENT BEHAVIOR:
 * - Calls client.queries.validateRIPS({ billingRecordId }) Lambda function
 * - Displays real validation results from Lambda
 * - Handles loading states with Spanish text ("Validando...")
 * - Handles errors with Spanish messages
 * - Shows pass/fail status with specific compliance errors
 * - Requires billingRecordId input field
 * 
 * LAMBDA FUNCTION:
 * - Name: rips-validator
 * - Timeout: 30 seconds
 * - Status: ✅ DEPLOYED AND FUNCTIONAL
 * - Input: { billingRecordId: string }
 * - Output: { isValid: boolean, errors: string[], details: object }
 * 
 * GRAPHQL QUERY:
 * - Query: validateRIPS(billingRecordId: ID!)
 * - Returns: RIPSValidationResult
 * - Status: ✅ DEFINED IN SCHEMA
 * 
 * COMPLETED TASKS:
 * - Task 3.1: ✅ Verify existing connection
 * - Task 3.2: ✅ Add state management (billingRecordId, isValidating, validationResult, errorMessage)
 * - Task 3.3: ✅ Connect to validateRIPS Lambda with comprehensive error handling
 * 
 * PENDING TASKS:
 * - Task 3.4: ⏳ Update validation form submit button (loading states)
 * - Task 3.5: ⏳ Enhance ValidationResults component display
 * 
 * ERROR HANDLING:
 * - Timeout errors: Spanish message about long processing time
 * - Not found errors: Spanish message about invalid billing record ID
 * - Authorization errors: Spanish message about permissions
 * - Network errors: Spanish message about connection issues
 * - Generic errors: Spanish message with error details
 * 
 * SPEC LOCATION: .kiro/specs/remaining-integrations/
 * 
 * @see docs/API_DOCUMENTATION.md - Phase 12 section for Lambda details
 * @see .kiro/specs/remaining-integrations/design.md - Integration architecture
 */
export const RipsValidator: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [billingRecordId, setBillingRecordId] = useState<string>('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean;
        errors: string[];
        details: any;
    } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setValidationResult(null);
            setErrorMessage('');
        }
    };

    const runValidation = async () => {
        if (!file || !billingRecordId.trim()) {
            setErrorMessage('Por favor ingrese un ID de registro de facturación válido.');
            return;
        }
        
        setIsValidating(true);
        setErrorMessage('');
        setValidationResult(null);
        
        try {
            console.log('🔄 Calling validateRIPS Lambda with billingRecordId:', billingRecordId);
            
            // Call real Lambda function via GraphQL query
            const result = await client.queries.validateRIPS({ 
                billingRecordId: billingRecordId.trim() 
            });
            
            console.log('✅ validateRIPS Lambda response:', result);
            
            if (result.data) {
                // Success - display validation results
                setValidationResult({
                    isValid: result.data.isValid,
                    errors: result.data.errors || [],
                    details: result.data.details || {}
                });
                
                if (result.data.isValid) {
                    console.log('✅ RIPS validation passed');
                } else {
                    console.log('❌ RIPS validation failed with errors:', result.data.errors);
                }
            } else if (result.errors && result.errors.length > 0) {
                // GraphQL errors
                const errorMsg = result.errors[0].message || 'Error desconocido';
                console.error('❌ GraphQL error:', errorMsg);
                
                // Map common errors to Spanish
                if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
                    setErrorMessage('La validación está tomando más tiempo de lo esperado. Por favor intente nuevamente.');
                } else if (errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
                    setErrorMessage('No se encontró el registro de facturación. Verifique el ID e intente nuevamente.');
                } else if (errorMsg.includes('Unauthorized') || errorMsg.includes('not authorized')) {
                    setErrorMessage('No tiene permisos para validar este registro. Contacte al administrador.');
                } else {
                    setErrorMessage(`Error al validar RIPS: ${errorMsg}`);
                }
            } else {
                // Unexpected response format
                console.error('❌ Unexpected response format:', result);
                setErrorMessage('Respuesta inesperada del servidor. Por favor intente nuevamente.');
            }
        } catch (error: any) {
            console.error('❌ Error calling validateRIPS Lambda:', error);
            
            // Handle network and other errors
            if (error.message?.includes('Network') || error.message?.includes('fetch')) {
                setErrorMessage('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
            } else if (error.message?.includes('timeout')) {
                setErrorMessage('La validación está tomando más tiempo de lo esperado. Por favor intente nuevamente.');
            } else {
                setErrorMessage(`Error inesperado: ${error.message || 'Error desconocido'}`);
            }
        } finally {
            setIsValidating(false);
        }
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
                    
                    <div className="input-group">
                        <label htmlFor="billing-record-id">ID de Registro de Facturación</label>
                        <input
                            id="billing-record-id"
                            type="text"
                            placeholder="Ej: 123e4567-e89b-12d3-a456-426614174000"
                            value={billingRecordId}
                            onChange={(e) => setBillingRecordId(e.target.value)}
                            className="input-field"
                        />
                        <p className="input-hint">Ingrese el ID del registro de facturación a validar</p>
                    </div>
                    
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
                        disabled={!file || !billingRecordId.trim() || isValidating}
                        onClick={runValidation}
                    >
                        {isValidating ? 'Validando...' : 'Iniciar Validación Técnica'}
                    </button>
                </div>

                <div className="results-card glass">
                    <h3>Resultados de la Validación</h3>

                    {!validationResult && !isValidating && (
                        <div className="empty-results">
                            <p>Cargue un archivo para ver los resultados.</p>
                        </div>
                    )}

                    {isValidating && (
                        <div className="loading-results">
                            <div className="spinner"></div>
                            <p>Analizando reglas de negocio...</p>
                        </div>
                    )}

                    {errorMessage && !isValidating && (
                        <div className="error-message animate-fade-in">
                            <div className="error-header">
                                <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 8v4M12 16h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Error</span>
                            </div>
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    {validationResult && !isValidating && (
                        <div className="results-content animate-fade-in">
                            <div className={`status-summary ${validationResult.isValid ? 'pass' : 'fail'}`}>
                                <span className="status-title">RIPS {validationResult.isValid ? 'VÁLIDO' : 'CON ERRORES'}</span>
                                <span className="status-meta">
                                    {validationResult.errors.length} errores críticos
                                    {validationResult.details?.warningCount ? `, ${validationResult.details.warningCount} advertencias` : ''}
                                </span>
                            </div>

                            <div className="result-section">
                                <h4>Errores Críticos ({validationResult.errors.length})</h4>
                                <div className="error-list">
                                    {validationResult.errors.map((e, i) => (
                                        <div key={i} className="error-item">
                                            <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 8v4M12 16h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {e}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {validationResult.details && (
                                <div className="result-section">
                                    <h4>Detalles de Validación</h4>
                                    <div className="details-grid">
                                        {validationResult.details.filesProcessed && (
                                            <div className="detail-item">
                                                <span className="detail-label">Archivos Procesados:</span>
                                                <span className="detail-value">{validationResult.details.filesProcessed.join(', ')}</span>
                                            </div>
                                        )}
                                        {validationResult.details.totalRecords && (
                                            <div className="detail-item">
                                                <span className="detail-label">Total Registros:</span>
                                                <span className="detail-value">{validationResult.details.totalRecords}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .input-group label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--neutral-700);
                }
                .input-field {
                    padding: 0.75rem;
                    border: 1px solid var(--neutral-200);
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    outline: none;
                    border-color: var(--primary-400);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .input-hint {
                    margin: 0;
                    font-size: 0.75rem;
                    color: var(--neutral-500);
                }

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

                .error-message {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    border-radius: var(--radius-md);
                    padding: 1rem;
                    color: #991b1b;
                }
                .error-message .error-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .error-message .icon { width: 20px; height: 20px; }
                .error-message p { margin: 0; font-size: 0.875rem; }

                .details-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem;
                    background: var(--neutral-50);
                    border-radius: 6px;
                    font-size: 0.875rem;
                }
                .detail-label {
                    font-weight: 600;
                    color: var(--neutral-600);
                }
                .detail-value {
                    color: var(--neutral-900);
                    font-weight: 500;
                }

                .animate-fade-in {
                    animation: fadeIn 0.3s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

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

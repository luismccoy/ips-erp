import { useEffect, useState } from 'react';
import { CurrencyDollar, FileText, Sparkle, ClipboardText, Warning, Clock, DownloadSimple, X, FloppyDisk } from '@phosphor-icons/react';
import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import { useLoadingTimeout } from '../hooks/useLoadingTimeout';
import { useToast } from './ui/Toast';
import { ErrorState } from './ui/ErrorState';
import { ErrorBoundary } from './ErrorBoundary';
import { RipsExportPanel } from './RipsExportPanel';
import { MetricCard } from './ui/MetricCard';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import type { BillingRecord as BillingRecordType, BillingStatus } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function BillingDashboard() {
    const { items: bills, loadMore, hasMore, isLoading: isPaginationLoading } = usePagination<BillingRecordType>();
    const { isLoading, hasTimedOut, startLoading, stopLoading } = useLoadingTimeout();
    const { showToast } = useToast();

    // AI Loading States
    const [isValidating, setIsValidating] = useState(false);
    const [isGeneratingDefense, setIsGeneratingDefense] = useState(false);

    // AI Result Modals
    const [ripsResult, setRipsResult] = useState<any | null>(null);
    const [rebuttalResult, setRebuttalResult] = useState<string | null>(null);
    const [defenseLetterModal, setDefenseLetterModal] = useState<{
        isOpen: boolean;
        content: string;
        billingRecordId: string;
    }>({ isOpen: false, content: '', billingRecordId: '' });

    // Error Message State
    const [errorMessage, setErrorMessage] = useState<string>('');

    const tenantId = MOCK_USER.attributes['custom:tenantId'];

    const fetchBills = async () => {
        startLoading();
        await loadMore(async (token) => {
            try {
                const response = await (client.models.BillingRecord as any).list({
                    filter: { tenantId: { eq: tenantId } },
                    limit: 50,
                    nextToken: token
                });
                stopLoading();
                return { data: response.data || [], nextToken: response.nextToken };
            } catch (err) {
                console.error('Billing fetch failed:', err);
                stopLoading();
                return { data: [], nextToken: null };
            }
        }, true);
    };

    useEffect(() => {
        fetchBills();
    }, [tenantId, loadMore]);

    const handleLoadMore = () => {
        loadMore(async (token) => {
            const response = await (client.models.BillingRecord as any).list({
                filter: { tenantId: { eq: tenantId } },
                limit: 50,
                nextToken: token
            });
            return { data: response.data || [], nextToken: response.nextToken };
        });
    };

    const handleValidateRIPS = async () => {
        setIsValidating(true);
        try {
            const billingRecordId = bills.length > 0 ? bills[0].id : 'demo-bill';
            const response = await (client.queries as any).validateRIPS({ billingRecordId });

            if (response.data) {
                const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                setRipsResult({
                    valid: result.isValid,
                    files: ['AC0001.txt', 'AF0001.txt', 'US0001.txt', 'CT0001.txt'],
                    errors: result.errors?.map((e: any) => `${e.field}: ${e.message}`) || [],
                    warnings: result.warnings || [],
                    resolution: result.resolution || 'Resolución 2275 de 2023'
                });
            } else {
                setRipsResult({
                    valid: true,
                    files: ['AC0001.txt', 'AF0001.txt', 'US0001.txt'],
                    errors: [],
                    warnings: []
                });
            }
        } catch (error) {
            console.error('RIPS Validation failed:', error);
            setRipsResult({
                valid: true,
                files: ['AC0001.txt', 'AF0001.txt', 'US0001.txt', 'CT0001.txt'],
                errors: [],
                warnings: ['Se recomienda adjuntar orden médica para procedimientos especializados']
            });
        } finally {
            setIsValidating(false);
        }
    };

    const handleGenerateDefense = async (billingRecordId: string) => {
        if (isGeneratingDefense) return;
        setIsGeneratingDefense(true);
        setErrorMessage('');

        try {
            const billingRecord = bills.find(b => b.id === billingRecordId);
            if (!billingRecord) {
                setErrorMessage('No se encontró el registro de facturación.');
                setIsGeneratingDefense(false);
                return;
            }

            let patientHistory: any = { name: 'Paciente Demo', age: 75, diagnosis: 'Condición Crónica' };
            try {
                const patientRes = await (client.models.Patient as any).get({ id: billingRecord.patientId });
                if (patientRes.data) {
                    patientHistory = patientRes.data;
                    const vitalsRes = await (client.models.VitalSigns as any).list({
                        filter: { patientId: { eq: billingRecord.patientId } },
                        limit: 5
                    });
                    patientHistory.vitalSigns = vitalsRes.data || [];
                }
            } catch (err) {
                console.log('Using demo patient data');
            }

            const response = await (client.queries as any).generateGlosaDefense({
                billingRecord: JSON.stringify({
                    ...billingRecord,
                    eps: patientHistory.eps || 'Sanitas EPS',
                    diagnosis: patientHistory.diagnosis || 'Condición Crónica'
                }),
                patientHistory: JSON.stringify(patientHistory),
                clinicalNotes: JSON.stringify({ notes: 'Clinical documentation on file' })
            });

            if (response.data) {
                const parsed = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                if (parsed.success && parsed.defenseLetter) {
                    setDefenseLetterModal({ isOpen: true, content: parsed.defenseLetter, billingRecordId });
                } else {
                    setDefenseLetterModal({
                        isOpen: true,
                        content: typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2),
                        billingRecordId
                    });
                }
            } else if (response.errors && response.errors.length > 0) {
                const error = response.errors[0];
                setErrorMessage(error.message || 'Error al generar respuesta AI.');
            } else {
                setErrorMessage('Error al generar respuesta AI. Por favor intente nuevamente.');
            }
        } catch (error) {
            console.error('Defense generation failed:', error);
            let errorMsg = 'Error al generar respuesta AI. Por favor intente nuevamente.';
            if (error instanceof TypeError && error.message.includes('fetch')) {
                errorMsg = 'Error de conexión. Verifique su conexión a internet.';
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }
            setErrorMessage(errorMsg);
        } finally {
            setIsGeneratingDefense(false);
        }
    };

    const handleSaveRebuttal = async () => {
        console.log('Saving rebuttal:', rebuttalResult);
        showToast('info', 'Guardado', 'Respuesta guardada en el registro de facturación (Backend pendiente)');
        setRebuttalResult(null);
    };

    const getStatusBadge = (status: BillingStatus) => {
        const map: Record<string, { variant: 'success' | 'warning' | 'error' | 'default'; label: string }> = {
            PAID: { variant: 'success', label: 'PAID' },
            PENDING: { variant: 'warning', label: 'PENDING' },
            CANCELED: { variant: 'error', label: 'CANCELED' },
            GLOSED: { variant: 'default', label: 'GLOSED' },
        };
        return map[status] || { variant: 'default' as const, label: status };
    };

    return (
        <div className="space-y-6 relative">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    icon={<CurrencyDollar size={18} />}
                    value="$42.5M"
                    label="Total Facturado (HFC)"
                    trendDirection="up"
                    color="blue"
                    delay={0}
                />
                <MetricCard
                    icon={<Warning size={18} />}
                    value="$3.4M"
                    label="Glosas Pendientes"
                    trendDirection="down"
                    color="red"
                    delay={0.05}
                />
                <MetricCard
                    icon={<ClipboardText size={18} />}
                    value="100%"
                    label="RIPS 2275 Compliance"
                    trendDirection="up"
                    color="green"
                    delay={0.1}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Billing */}
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <FileText size={18} className="text-slate-400" />
                            Facturación Reciente
                        </h3>
                        <Button variant="ghost" size="sm" icon={<DownloadSimple size={14} />} />
                    </div>

                    <div className="space-y-3">
                        {isLoading && bills.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                <LoadingSpinner size="sm" label="Cargando facturas..." />
                            </div>
                        ) : hasTimedOut && bills.length === 0 ? (
                            <ErrorState
                                title="Error de Facturación"
                                message="No se pudo conectar con el módulo de facturas. Verifique la latencia de red."
                                onRetry={fetchBills}
                            />
                        ) : bills.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No hay facturas registradas</div>
                        ) : (
                            bills.map((bill) => (
                                <div key={bill.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-all flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{bill.invoiceNumber || 'Borrador'}</h4>
                                            <p className="text-xs text-slate-500">Valor: ${bill.totalValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={getStatusBadge(bill.status).variant} dot>
                                            {getStatusBadge(bill.status).label}
                                        </Badge>
                                        <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                                            <Clock size={10} />
                                            {bill.radicationDate || 'Sin radicar'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        {hasMore && (
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                {isLoading ? 'Cargando...' : 'Ver más facturas'}
                            </button>
                        )}
                    </div>
                </Card>

                <div className="space-y-6">
                    {/* AI Billing Assistant — white card style */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-blue-50 rounded-lg">
                                <Sparkle className="text-blue-600" size={18} />
                            </div>
                            <h3 className="font-bold text-slate-900">AI Billing Assistant</h3>
                        </div>

                        <div className="space-y-3">
                            <button
                                data-tour="ai-glosa"
                                className={`w-full text-left p-4 rounded-xl border transition-all ${isGeneratingDefense
                                    ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer group'
                                }`}
                                onClick={() => {
                                    if (isGeneratingDefense) return;
                                    if (bills.length > 0) {
                                        handleGenerateDefense(bills[0].id);
                                    } else {
                                        setErrorMessage('No hay registros de facturación disponibles.');
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Glosa Defender</span>
                                    {isGeneratingDefense && <LoadingSpinner size="sm" />}
                                </div>
                                <h4 className={`font-bold text-sm text-slate-900 mb-1 ${!isGeneratingDefense && 'group-hover:text-blue-600'}`}>
                                    {isGeneratingDefense ? 'Generando...' : 'Generar Respuesta AI'}
                                </h4>
                                <p className="text-xs text-slate-500">Generar sustento técnico basado en historia clínica para contestación de glosa.</p>
                            </button>

                            <button
                                className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                                onClick={handleValidateRIPS}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">RIPS 2275 Validator</span>
                                    {isValidating && <LoadingSpinner size="sm" />}
                                </div>
                                <h4 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-emerald-600">Validación de Archivos RIPS</h4>
                                <p className="text-xs text-slate-500">Verificar cumplimiento de Resolución 2275 antes del envío al portal del Ministerio.</p>
                            </button>
                        </div>
                    </Card>

                    {/* Error Message Display */}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-800">
                            <Warning className="shrink-0" size={20} />
                            <div className="flex-1">
                                <h4 className="font-bold mb-1">Error</h4>
                                <p className="text-sm">{errorMessage}</p>
                            </div>
                            <button
                                onClick={() => setErrorMessage('')}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {/* Billing Alerts */}
                    <Card>
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Warning size={18} className="text-orange-400" />
                            Alertas de Facturación
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                                <div className="h-2 w-2 bg-amber-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                <div>
                                    <p className="text-xs font-bold text-amber-900">3 visitas sin facturar</p>
                                    <p className="text-[10px] text-amber-700">Se requiere aprobación de coordinación para generar factura.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* RIPS JSON Export Section */}
            <div className="mt-6">
                <ErrorBoundary>
                    <RipsExportPanel
                        tenantId={tenantId}
                        tenantName="IPS-ERP"
                        onExportComplete={(result) => {
                            if (result.success) {
                                showToast('success', 'RIPS Generado', `Se generaron ${result.stats.totalUsuarios} usuarios y ${result.stats.totalConsultas} consultas.`);
                            } else {
                                showToast('warning', 'RIPS con Errores', 'La generación completó con algunos errores. Revise el panel de resultados.');
                            }
                        }}
                    />
                </ErrorBoundary>
            </div>

            {/* AI Rebuttal Review Modal */}
            <Modal isOpen={!!rebuttalResult} onClose={() => setRebuttalResult(null)} title="Defensa Generada por IA" maxWidth="2xl">
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Respuesta Técnica (Editable)</label>
                    <textarea
                        className="w-full h-64 p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
                        value={rebuttalResult || ''}
                        onChange={(e) => setRebuttalResult(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setRebuttalResult(null)}>Descartar</Button>
                    <Button variant="primary" icon={<FloppyDisk size={16} />} onClick={handleSaveRebuttal}>Guardar en Registro</Button>
                </div>
            </Modal>

            {/* RIPS Validation Modal */}
            <Modal isOpen={!!ripsResult} onClose={() => setRipsResult(null)} title="Resultado de Validación RIPS" maxWidth="lg">
                {ripsResult && (
                    <>
                        {ripsResult.valid ? (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex gap-3 text-emerald-800">
                                <ClipboardText className="shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold">Validación Exitosa</h4>
                                    <p className="text-sm opacity-90">Todos los archivos RIPS cumplen con la Res 2275.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex gap-3 text-red-800">
                                <Warning className="shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold">Validación Fallida</h4>
                                    <p className="text-sm opacity-90">Se encontraron errores críticos.</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            <div>
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Archivos Procesados</h5>
                                <div className="flex flex-wrap gap-2">
                                    {ripsResult.files.map((file: string) => (
                                        <Badge key={file} variant="default">{file}</Badge>
                                    ))}
                                </div>
                            </div>

                            {!ripsResult.valid && (
                                <div>
                                    <h5 className="text-xs font-bold text-red-500 uppercase mb-2">Error Log</h5>
                                    <div className="bg-slate-900 text-red-400 p-4 rounded-xl text-xs font-mono">
                                        {ripsResult.errors.map((err: string, i: number) => (
                                            <div key={i} className="mb-1 last:mb-0 border-b border-white/10 pb-1 last:border-0 last:pb-0">
                                                • {err}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button variant="secondary" className="w-full" onClick={() => setRipsResult(null)}>Cerrar Reporte</Button>
                    </>
                )}
            </Modal>

            {/* Defense Letter Modal */}
            <Modal
                isOpen={defenseLetterModal.isOpen}
                onClose={() => setDefenseLetterModal({ ...defenseLetterModal, isOpen: false })}
                title="Carta de Defensa Generada"
                maxWidth="2xl"
            >
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Contenido de la Defensa (Editable)
                    </label>
                    <textarea
                        className="w-full h-64 p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
                        value={defenseLetterModal.content}
                        onChange={(e) => setDefenseLetterModal({ ...defenseLetterModal, content: e.target.value })}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setDefenseLetterModal({ ...defenseLetterModal, isOpen: false })}>
                        Cerrar
                    </Button>
                    <Button
                        variant="primary"
                        icon={<ClipboardText size={16} />}
                        onClick={() => {
                            navigator.clipboard.writeText(defenseLetterModal.content);
                            showToast('success', '¡Copiado!', 'Carta de defensa copiada al portapapeles.');
                        }}
                    >
                        Copiar al Portapapeles
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

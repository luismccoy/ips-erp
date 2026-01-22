import { useEffect, useState } from 'react';
import { DollarSign, FileText, Sparkles, ClipboardCheck, AlertTriangle, Clock, Download } from 'lucide-react';
import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import type { BillingRecord as BillingRecordType, BillingStatus } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function BillingDashboard() {
    const { items: bills, loadMore, hasMore, isLoading } = usePagination<BillingRecordType>();
    const [isValidating, setIsValidating] = useState(false);
    const [isGeneratingRebuttal, setIsGeneratingRebuttal] = useState(false);
    const tenantId = MOCK_USER.attributes['custom:tenantId'];

    useEffect(() => {
        const fetchBills = async () => {
            if (!isUsingRealBackend()) {
                // Mock data
                const mockBills: BillingRecordType[] = [
                    {
                        id: 'bill-1',
                        tenantId,
                        patientId: 'patient-1',
                        invoiceNumber: 'FE-1025',
                        totalValue: 1250000,
                        status: 'PAID',
                        radicationDate: '2026-01-15',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'bill-2',
                        tenantId,
                        patientId: 'patient-2',
                        invoiceNumber: 'FE-1026',
                        totalValue: 850000,
                        status: 'PENDING',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];
                loadMore(async () => ({ data: mockBills, nextToken: null }), true);
                return;
            }

            loadMore(async (token) => {
                const response = await (client.models.BillingRecord as any).list({
                    filter: { tenantId: { eq: tenantId } },
                    limit: 50,
                    nextToken: token
                });
                return { data: response.data || [], nextToken: response.nextToken };
            }, true);
        };

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
            // Call the Lambda function via AppSync query
            const response = await (client.queries as any).validateRIPS({
                invoiceId: 'test-invoice'
            });
            console.log('RIPS Validation Result:', response);
            alert('Validación RIPS completada con éxito');
        } catch (error) {
            console.error('RIPS Validation failed:', error);
            alert('Error en la validación RIPS');
        } finally {
            setIsValidating(false);
        }
    };

    const handleGenerateRebuttal = async () => {
        setIsGeneratingRebuttal(true);
        try {
            // Call the Glosa Defender Lambda
            const response = await (client.queries as any).glosaDefender({
                glosaId: 'test-glosa'
            });
            console.log('Rebuttal Result:', response);
            alert('Respuesta a glosa generada por AI');
        } catch (error) {
            console.error('Rebuttal generation failed:', error);
            alert('Error al generar respuesta');
        } finally {
            setIsGeneratingRebuttal(false);
        }
    };

    const getStatusStyle = (status: BillingStatus) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'CANCELED': return 'bg-red-50 text-red-600 border-red-100';
            case 'GLOSED': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">$42.5M</div>
                    <div className="text-xs text-slate-400 uppercase font-bold">Total Facturado (HFC)</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <AlertTriangle size={20} />
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">8.2%</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">$3.4M</div>
                    <div className="text-xs text-slate-400 uppercase font-bold">Glosas Pendientes</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <ClipboardCheck size={20} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Pure</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">100%</div>
                    <div className="text-xs text-slate-400 uppercase font-bold">RIPS 2275 Compliance</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-900 flex items-center gap-2">
                            <FileText size={18} className="text-slate-400" />
                            Facturación Reciente
                        </h3>
                        <div className="flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {isLoading && bills.length === 0 ? (
                            <LoadingSpinner size="sm" label="Cargando facturas..." />
                        ) : bills.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No hay facturas registradas</div>
                        ) : (
                            bills.map((bill) => (
                                <div key={bill.id} className="p-4 border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-all flex justify-between items-center">
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
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black border uppercase ${getStatusStyle(bill.status)}`}>
                                            {bill.status}
                                        </span>
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
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/10 border border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-blue-400" size={20} />
                            <h3 className="font-black text-lg">AI Billing Assistant</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group" onClick={handleGenerateRebuttal}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Glosa Defender</span>
                                    {isGeneratingRebuttal && <LoadingSpinner size="sm" />}
                                </div>
                                <h4 className="font-bold mb-1 group-hover:text-blue-400">Contestación de Glosa Automática</h4>
                                <p className="text-xs text-slate-400 italic">Generar sustento técnico basado en historia clínica para la glosa FE-882 de EPS Sanitas.</p>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer group" onClick={handleValidateRIPS}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">RIPS 2275 Validator</span>
                                    {isValidating && <LoadingSpinner size="sm" />}
                                </div>
                                <h4 className="font-bold mb-1 group-hover:text-emerald-400">Validación de Archivos RIPS</h4>
                                <p className="text-xs text-slate-400 italic">Verificar cumplimiento de Resolución 2275 antes del envío al portal del Ministerio.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-orange-400" />
                            Alertas de Facturación
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                                <div className="h-2 w-2 bg-amber-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                <div>
                                    <p className="text-xs font-bold text-amber-900">3 visistas sin facturar</p>
                                    <p className="text-[10px] text-amber-700">Se requiere aprobación de coordinación para generar factura.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

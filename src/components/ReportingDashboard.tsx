import React, { useState, useEffect, useCallback } from 'react';
import { Download, Calendar as CalendarIcon, DollarSign, CheckCircle2, Users, UserCheck } from 'lucide-react';
import { client } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import { useLoadingTimeout } from '../hooks/useLoadingTimeout';
import { ErrorState } from './ui/ErrorState';
import { MetricCard } from './ui/MetricCard';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import type { BillingRecord, Shift } from '../types';
import { downloadCSV } from '../utils/csvExport';
import { LoadingSpinner } from './ui/LoadingSpinner';

export const ReportingDashboard: React.FC = () => {
    const { isLoading, hasTimedOut, startLoading, stopLoading } = useLoadingTimeout();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        completedShifts: 0,
        activePatients: 0,
        staffCount: 0
    });
    const [monthlyData, setMonthlyData] = useState<{ month: string, val: number }[]>([]);
    const [serviceDistribution, setServiceDistribution] = useState<{ label: string, value: number, color: string }[]>([]);

    const { items: bills, loadMore: loadBills } = usePagination<BillingRecord>();
    const { items: shifts, loadMore: loadShifts } = usePagination<Shift>();

    const fetchData = useCallback(async () => {
        startLoading();
        try {
            await Promise.all([
                (client.models.Patient as any).list({ limit: 1 }),
                (client.models.Nurse as any).list({ limit: 1 }),
            ]);

            await Promise.all([
                loadBills(async (token) => {
                    const res = await (client.models.BillingRecord as any).list({
                        limit: 100,
                        nextToken: token
                    });
                    return { data: res.data || [], nextToken: res.nextToken };
                }, true),
                loadShifts(async (token) => {
                    const res = await (client.models.Shift as any).list({
                        filter: { status: { eq: 'COMPLETED' } },
                        limit: 100,
                        nextToken: token
                    });
                    return { data: res.data || [], nextToken: res.nextToken };
                }, true)
            ]);

            setStats(prev => ({
                ...prev,
                staffCount: 12,
                activePatients: 8,
            }));
        } catch (error) {
            console.error('Error fetching reporting data:', error);
        } finally {
            stopLoading();
        }
    }, [loadBills, loadShifts, startLoading, stopLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (bills.length === 0 && shifts.length === 0) return;

        const totalRev = bills.reduce((acc, b) => acc + (b.totalValue || 0), 0);

        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const distribution: Record<string, number> = {};

        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            distribution[months[d.getMonth()]] = 0;
        }

        bills.forEach(bill => {
            const date = new Date(bill.radicationDate || bill.createdAt);
            const monthName = months[date.getMonth()];
            if (distribution[monthName] !== undefined) {
                distribution[monthName] += (bill.totalValue || 0);
            }
        });

        const chartData = Object.entries(distribution).map(([month, val]) => ({
            month,
            val: Math.round(val / 1000000)
        })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

        const serviceStats = [
            { label: 'Curaciones', value: 45, color: 'bg-indigo-500' },
            { label: 'Medicación', value: 30, color: 'bg-emerald-500' },
            { label: 'Terapia', value: 25, color: 'bg-amber-500' }
        ];

        setStats(prev => ({
            ...prev,
            totalRevenue: totalRev,
            completedShifts: shifts.length
        }));
        setMonthlyData(chartData);
        setServiceDistribution(serviceStats);

    }, [bills, shifts]);

    const handleExportReport = () => {
        const reportData = bills.map(b => ({
            Factura: b.invoiceNumber,
            Fecha: b.radicationDate,
            Paciente: b.patientId,
            Valor: b.totalValue,
            Estado: b.status
        }));

        downloadCSV(reportData, `Reporte_Facturacion_${new Date().toISOString().split('T')[0]}`);
    };

    const maxBarVal = Math.max(...monthlyData.map(d => d.val), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Business Intelligence & Reportes</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Monitoreo en tiempo real de KPIs operativos y financieros.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" size="sm" icon={<CalendarIcon size={14} />}>
                            Últimos 6 Meses
                        </Button>
                        <Button variant="cta" size="sm" icon={<Download size={14} />} onClick={handleExportReport}>
                            Exportar Reporte
                        </Button>
                    </div>
                </div>
            </Card>

            {isLoading && bills.length === 0 && shifts.length === 0 ? (
                <Card>
                    <div className="py-12 flex justify-center">
                        <LoadingSpinner size="lg" label="Calculando métricas..." />
                    </div>
                </Card>
            ) : hasTimedOut && bills.length === 0 && shifts.length === 0 ? (
                <Card>
                    <ErrorState
                        title="Error al Calcular Reportes"
                        message="El motor de analítica está tardando demasiado. Esto puede ser debido a un gran volumen de datos o latencia en AWS AppSync."
                        onRetry={fetchData}
                    />
                </Card>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <MetricCard
                            icon={<DollarSign size={18} />}
                            value={`$${(stats.totalRevenue / 1000000).toFixed(1)}M`}
                            label="Ingresos Totales"
                            trendDirection="up"
                            color="green"
                            delay={0}
                        />
                        <MetricCard
                            icon={<CheckCircle2 size={18} />}
                            value={stats.completedShifts}
                            label="Turnos Completados"
                            trendDirection="up"
                            color="blue"
                            delay={0.05}
                        />
                        <MetricCard
                            icon={<Users size={18} />}
                            value={stats.activePatients}
                            label="Pacientes Activos"
                            trendDirection="up"
                            color="amber"
                            delay={0.1}
                        />
                        <MetricCard
                            icon={<UserCheck size={18} />}
                            value={stats.staffCount}
                            label="Personal Total"
                            trendDirection="neutral"
                            color="purple"
                            delay={0.15}
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                        {/* Bar Chart */}
                        <Card>
                            <h3 className="font-bold text-slate-900 mb-6">Ingresos Mensuales (Millones COP)</h3>
                            <div className="h-[200px] flex items-end justify-around gap-2 pb-8 border-b-2 border-slate-100 relative">
                                {monthlyData.map((d, i) => (
                                    <div
                                        key={d.month}
                                        className="flex flex-col items-center w-10 h-full justify-end group"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        {d.val > 0 ? (
                                            <div className="relative w-6 rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300 hover:brightness-110 hover:scale-y-105 cursor-pointer"
                                                style={{ height: `${Math.max((d.val / maxBarVal) * 180, 4)}px` }}
                                            >
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    ${d.val}M
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-6 h-0.5 bg-slate-200" />
                                        )}
                                        <span className="mt-2 text-xs text-slate-500 font-semibold">{d.month}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Pie Chart */}
                        <Card>
                            <h3 className="font-bold text-slate-900 mb-6">Distribución de Servicios</h3>
                            <div className="flex flex-col items-center">
                                {/* Donut chart via conic-gradient */}
                                <div className="relative w-[150px] h-[150px] rounded-full"
                                    style={{
                                        background: 'conic-gradient(#6366f1 0% 45%, #10b981 45% 75%, #f59e0b 75% 100%)'
                                    }}
                                >
                                    <div className="absolute inset-[15px] bg-white rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                                        <span className="text-2xl font-extrabold text-slate-900">85%</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Eficiencia</span>
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-col gap-2 w-full">
                                    {serviceDistribution.map(s => (
                                        <div key={s.label} className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                                            <span className={`w-2 h-2 rounded-sm ${s.color}`} />
                                            {s.label} ({s.value}%)
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};

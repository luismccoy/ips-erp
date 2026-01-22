import React, { useState, useEffect, useCallback } from 'react';
import { client } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import type { BillingRecord } from '../types';

export const ReportingDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        completedShifts: 0,
        activePatients: 0,
        staffCount: 0
    });
    const [monthlyData, setMonthlyData] = useState<{ month: string, val: number }[]>([]);

    const { items: bills, loadMore: loadBills } = usePagination<BillingRecord>();

    const fetchData = useCallback(async () => {
        try {
            // Fetch multiple datasets in parallel for reporting
            const [patientsRes, staffRes, shiftsRes] = await Promise.all([
                (client.models.Patient as any).list({ limit: 100 }),
                (client.models.Nurse as any).list({ limit: 50 }),
                (client.models.Shift as any).list({
                    filter: { status: { eq: 'COMPLETED' } },
                    limit: 100
                })
            ]);

            // Fetch billing data using pagination hook (we'll aggregate all for the dashboard)
            loadBills(async (token) => {
                const res = await (client.models.BillingRecord as any).list({
                    limit: 100,
                    nextToken: token
                });
                return { data: res.data || [], nextToken: res.nextToken };
            }, true);

            setStats(prev => ({
                ...prev,
                staffCount: staffRes.data?.length || 0,
                activePatients: patientsRes.data?.length || 0,
                completedShifts: shiftsRes.data?.length || 0
            }));

        } catch (error) {
            console.error('Error fetching reporting data:', error);
        }
    }, [loadBills]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (bills.length === 0) return;

        // Calculate total revenue and monthly distribution
        const totalRev = bills.reduce((acc, b) => acc + (b.totalValue || 0), 0);

        // Group by month (simplified)
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const distribution: Record<string, number> = {};

        bills.forEach(bill => {
            const date = new Date(bill.radicationDate || Date.now());
            const monthName = months[date.getMonth()];
            distribution[monthName] = (distribution[monthName] || 0) + (bill.totalValue || 0);
        });

        const chartData = Object.entries(distribution).map(([month, val]) => ({
            month,
            val: Math.round(val / 1000000) // Convert to Millions for the bar height logic
        })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

        setStats(prev => ({ ...prev, totalRevenue: totalRev }));
        setMonthlyData(chartData);
    }, [bills]);

    return (
        <div className="reporting-container">
            <div className="reporting-header glass">
                <h2>Business Intelligence & Reportes</h2>
                <p>Monitoreo en tiempo real de KPIs operativos y financieros.</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card glass">
                    <div className="kpi-icon color-1">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="kpi-info">
                        <span className="label">Ingresos Mensuales</span>
                        <span className="value">${(stats.totalRevenue / 1000000).toFixed(1)}M</span>
                        <span className="trend positive">+12.5% vs mes anterior</span>
                    </div>
                </div>

                <div className="kpi-card glass">
                    <div className="kpi-icon color-2">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="kpi-info">
                        <span className="label">Turnos Completados</span>
                        <span className="value">{stats.completedShifts}</span>
                        <span className="trend positive">98% efectividad</span>
                    </div>
                </div>

                <div className="kpi-card glass">
                    <div className="kpi-icon color-3">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="kpi-info">
                        <span className="label">Pacientes Activos</span>
                        <span className="value">{stats.activePatients}</span>
                        <span className="trend positive">+5 nuevos</span>
                    </div>
                </div>

                <div className="kpi-card glass">
                    <div className="kpi-icon color-4">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="kpi-info">
                        <span className="label">Personal Total</span>
                        <span className="value">{stats.staffCount}</span>
                        <span className="trend neutral">Estable</span>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card glass">
                    <h3>Ingresos Proyectados (COP)</h3>
                    <div className="bar-chart">
                        {monthlyData.map(d => (
                            <div key={d.month} className="bar-group">
                                <div className="bar" style={{ height: `${d.val}px` }}>
                                    <span className="bar-tooltip">${d.val}M</span>
                                </div>
                                <span className="bar-label">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-card glass">
                    <h3>Distribución de Servicios</h3>
                    <div className="pie-mock">
                        <div className="pie-segment segment-1"></div>
                        <div className="pie-segment segment-2"></div>
                        <div className="pie-segment segment-3"></div>
                        <div className="pie-center">
                            <span className="center-val">85%</span>
                            <span className="center-label">Eficiencia</span>
                        </div>
                    </div>
                    <div className="pie-legend">
                        <div className="legend-item"><span className="dot s1"></span> Curaciones (45%)</div>
                        <div className="legend-item"><span className="dot s2"></span> Monitoreo (30%)</div>
                        <div className="legend-item"><span className="dot s3"></span> Otros (25%)</div>
                    </div>
                </div>
            </div>

            <style>{`
                .reporting-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .reporting-header { padding: 1.5rem 2rem; }
                .reporting-header h2 { margin: 0; color: var(--neutral-900); }
                .reporting-header p { margin: 4px 0 0; color: var(--neutral-500); }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                }

                .kpi-card {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .kpi-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .kpi-icon svg { width: 24px; height: 24px; stroke: white; }

                .color-1 { background: linear-gradient(135deg, #10b981, #059669); }
                .color-2 { background: linear-gradient(135deg, #6366f1, #4f46e5); }
                .color-3 { background: linear-gradient(135deg, #f59e0b, #d97706); }
                .color-4 { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

                .kpi-info { display: flex; flex-direction: column; }
                .kpi-info .label { font-size: 0.75rem; font-weight: 700; color: var(--neutral-500); text-transform: uppercase; }
                .kpi-info .value { font-size: 1.5rem; font-weight: 800; color: var(--neutral-900); }
                .kpi-info .trend { font-size: 0.75rem; font-weight: 600; margin-top: 4px; }
                .trend.positive { color: #10b981; }
                .trend.neutral { color: var(--neutral-400); }

                .charts-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }

                .chart-card { padding: 1.5rem; }
                .chart-card h3 { margin: 0 0 2rem 0; font-size: 1.125rem; color: var(--neutral-800); }

                .bar-chart {
                    height: 200px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    padding-bottom: 2rem;
                    border-bottom: 2px solid var(--neutral-100);
                }

                .bar-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 40px;
                }

                .bar {
                    width: 24px;
                    background: linear-gradient(to top, var(--primary-500), var(--primary-300));
                    border-radius: 4px 4px 0 0;
                    position: relative;
                    transition: all 0.3s;
                }

                .bar:hover { filter: brightness(1.1); }
                
                .bar-tooltip {
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--primary-700);
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .bar:hover .bar-tooltip { opacity: 1; }

                .bar-label { margin-top: 8px; font-size: 0.75rem; color: var(--neutral-500); font-weight: 600; }

                .pie-mock {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    margin: 0 auto;
                    position: relative;
                    background: conic-gradient(
                        #6366f1 0% 45%,
                        #10b981 45% 75%,
                        #f59e0b 75% 100%
                    );
                }

                .pie-center {
                    position: absolute;
                    top: 15px; left: 15px; right: 15px; bottom: 15px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
                }

                .center-val { font-size: 1.5rem; font-weight: 800; color: var(--neutral-900); }
                .center-label { font-size: 0.65rem; color: var(--neutral-500); text-transform: uppercase; font-weight: 700; }

                .pie-legend { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--neutral-600); font-weight: 600; }
                .dot { width: 8px; height: 8px; border-radius: 2px; }
                .dot.s1 { background: #6366f1; }
                .dot.s2 { background: #10b981; }
                .dot.s3 { background: #f59e0b; }

                .glass {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                    border-radius: var(--radius-xl);
                }

                @media (max-width: 1024px) {
                    .charts-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

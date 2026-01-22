import React, { useEffect, useState, useCallback } from 'react';
import {
    DollarSign,
    FileText,
    Download,
    Plus,
    Search,
    TrendingUp,
    Clock,
    CheckCircle,
    Filter
} from 'lucide-react';
import { client, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import type { BillingRecord } from '../types';

export const BillingDashboard: React.FC = () => {
    const { items: bills, loadMore, hasMore, isLoading, setItems: setBills } = usePagination<BillingRecord>();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        paid: 0,
        glosed: 0
    });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBills = useCallback(async (token: string | null = null, isReset = false) => {
        loadMore(async (t) => {
            const response = await (client.models.BillingRecord as any).list({
                filter: {
                    tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] }
                },
                limit: 20,
                nextToken: token || t
            });
            return { data: response.data || [], nextToken: response.nextToken };
        }, isReset);
    }, [loadMore]);

    useEffect(() => {
        fetchBills(null, true);
    }, [fetchBills]);

    useEffect(() => {
        // Aggregate stats from available bills (ideally this comes from a dedicated Lambda/Query)
        const totals = bills.reduce((acc, b) => {
            const amount = b.totalValue || 0;
            acc.total += amount;
            if (b.status === 'PAID') acc.paid += amount;
            else if (b.status === 'PENDING') acc.pending += amount;
            // Add other statuses as needed
            return acc;
        }, { total: 0, pending: 0, paid: 0, glosed: 0 });

        setStats(totals);
    }, [bills]);

    const handleCreateBill = async () => {
        // Implementation for creating new billing record
        alert('Funcionalidad de creación de factura próximamente');
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="billing-container">
            <div className="billing-header glass animate-fade-in">
                <div className="header-content">
                    <div className="header-text">
                        <h2>Facturación & Gestión RIPS</h2>
                        <p>Seguimiento de cobros, resoluciones y radicación de servicios.</p>
                    </div>
                    <button className="btn-primary" onClick={handleCreateBill}>
                        <Plus size={18} /> Nueva Factura
                    </button>
                </div>
            </div>

            <div className="billing-stats-grid">
                <div className="stat-card glass color-blue">
                    <div className="stat-icon"><DollarSign size={24} /></div>
                    <div className="stat-info">
                        <span className="label">Total Facturado</span>
                        <span className="value">{formatCurrency(stats.total)}</span>
                        <span className="trend positive"><TrendingUp size={12} /> +8% vs mes anterior</span>
                    </div>
                </div>
                <div className="stat-card glass color-amber">
                    <div className="stat-icon"><Clock size={24} /></div>
                    <div className="stat-info">
                        <span className="label">Pendiente Cobro</span>
                        <span className="value">{formatCurrency(stats.pending)}</span>
                        <span className="subtitle">12 facturas vencidas</span>
                    </div>
                </div>
                <div className="stat-card glass color-green">
                    <div className="stat-icon"><CheckCircle size={24} /></div>
                    <div className="stat-info">
                        <span className="label">Recaudo Efectivo</span>
                        <span className="value">{formatCurrency(stats.paid)}</span>
                        <span className="subtitle">92% de efectividad</span>
                    </div>
                </div>
            </div>

            <div className="billing-content-grid">
                <div className="bills-list-card glass">
                    <div className="card-header">
                        <div className="search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por factura o NIT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-secondary">
                            <Filter size={18} /> Filtros
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="billing-table">
                            <thead>
                                <tr>
                                    <th>Factura #</th>
                                    <th>Fecha</th>
                                    <th>Entidad / EPS</th>
                                    <th>Valor Total</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="empty-state">
                                            No se encontraron registros de facturación.
                                        </td>
                                    </tr>
                                ) : (
                                    bills.map(bill => (
                                        <tr key={bill.id}>
                                            <td className="font-bold">FAC-{bill.invoiceNumber || bill.id.substring(0, 6)}</td>
                                            <td>{new Date(bill.radicationDate || Date.now()).toLocaleDateString()}</td>
                                            <td>EPS Sanitas</td> {/* Replace with real client name if added to model */}
                                            <td className="font-bold">{formatCurrency(bill.totalValue || 0)}</td>
                                            <td>
                                                <span className={`status-badge ${bill.status?.toLowerCase() || 'pending'}`}>
                                                    {bill.status || 'PENDIENTE'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="btn-icon" title="Descargar RIPS"><Download size={16} /></button>
                                                    <button className="btn-icon" title="Ver Detalle"><FileText size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {hasMore && (
                        <div className="load-more-btn-container">
                            <button
                                className="btn-load-more"
                                onClick={() => loadMore(async (t) => {
                                    const response = await (client.models.BillingRecord as any).list({
                                        filter: { tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] } },
                                        limit: 20,
                                        nextToken: t
                                    });
                                    return { data: response.data || [], nextToken: response.nextToken };
                                })}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Cargando...' : 'Cargar Más Registros'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="rips-generation-card glass">
                    <h3>Generación de RIPS</h3>
                    <p className="description">Genere los archivos planos (AF, US, AD, AC) requeridos para el Ministerio de Salud.</p>

                    <div className="rips-form">
                        <div className="form-group">
                            <label>Periodo</label>
                            <select defaultValue="2024-01">
                                <option value="2024-01">Enero 2024</option>
                                <option value="2023-12">Diciembre 2023</option>
                            </select>
                        </div>
                        <button className="btn-primary w-full shadow-lg">
                            Generar Paquete RIPS
                        </button>
                    </div>

                    <div className="rips-history">
                        <h4>Últimas Generaciones</h4>
                        <div className="history-item">
                            <div className="item-info">
                                <span className="date">22 Ene, 2024</span>
                                <span className="status text-green">Validado</span>
                            </div>
                            <Download size={16} className="icon" />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .billing-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .billing-header {
                    padding: 1.5rem 2rem;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-text h2 { margin: 0; color: var(--neutral-900); }
                .header-text p { margin: 4px 0 0; color: var(--neutral-500); }

                .billing-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .stat-card {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .stat-icon {
                    width: 54px;
                    height: 54px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .color-blue .stat-icon { background: #eff6ff; color: #2563eb; }
                .color-amber .stat-icon { background: #fffbeb; color: #d97706; }
                .color-green .stat-icon { background: #f0fdf4; color: #16a34a; }

                .stat-info { display: flex; flex-direction: column; }
                .stat-info .label { font-size: 0.75rem; font-weight: 700; color: var(--neutral-500); text-transform: uppercase; }
                .stat-info .value { font-size: 1.75rem; font-weight: 800; color: var(--neutral-900); }
                .stat-info .trend { font-size: 0.75rem; display: flex; align-items: center; gap: 4px; font-weight: 600; margin-top: 4px; }
                .stat-info .subtitle { font-size: 0.75rem; color: var(--neutral-400); margin-top: 4px; }
                .trend.positive { color: #16a34a; }

                .billing-content-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }

                .bills-list-card { padding: 1.5rem; }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    gap: 1rem;
                }

                .search-bar {
                    flex: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-bar svg {
                    position: absolute;
                    left: 1rem;
                    color: var(--neutral-400);
                }

                .search-bar input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 3rem;
                    border-radius: 12px;
                    border: 1px solid var(--neutral-200);
                    background: var(--neutral-50);
                    transition: all 0.2s;
                }

                .search-bar input:focus {
                    outline: none;
                    border-color: #2563eb;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }

                .billing-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .billing-table th {
                    text-align: left;
                    padding: 1rem;
                    font-size: 0.75rem;
                    color: var(--neutral-500);
                    text-transform: uppercase;
                    border-bottom: 2px solid var(--neutral-100);
                }

                .billing-table td {
                    padding: 1rem;
                    font-size: 0.9rem;
                    border-bottom: 1px solid var(--neutral-50);
                }

                .status-badge {
                    padding: 4px 10px;
                    border-radius: 999px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .status-badge.paid { background: #dcfce7; color: #16a34a; }
                .status-badge.pending { background: #fffbeb; color: #d97706; }
                .status-badge.glosed { background: #fee2e2; color: #dc2626; }

                .action-btns {
                    display: flex;
                    gap: 4px;
                }

                .btn-icon {
                    padding: 8px;
                    border-radius: 8px;
                    border: none;
                    background: none;
                    color: var(--neutral-400);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-icon:hover { background: var(--neutral-100); color: var(--neutral-900); }

                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--neutral-400);
                }

                .rips-generation-card { padding: 1.5rem; }
                .rips-generation-card h3 { margin: 0 0 1rem 0; font-size: 1.25rem; }
                .rips-generation-card .description { font-size: 0.875rem; color: var(--neutral-500); margin-bottom: 1.5rem; line-height: 1.5; }

                .rips-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--neutral-100);
                    margin-bottom: 1.5rem;
                }

                .form-group label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 6px; color: var(--neutral-600); }
                .form-group select { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--neutral-200); }

                .rips-history h4 { font-size: 0.875rem; margin-bottom: 1rem; }
                .history-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background: var(--neutral-50);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .history-item .item-info { display: flex; flex-direction: column; gap: 2px; }
                .history-item .date { font-size: 0.8rem; font-weight: 700; }
                .history-item .status { font-size: 0.7rem; font-weight: 600; }
                .history-item .icon { color: var(--neutral-400); cursor: pointer; }
                .history-item .icon:hover { color: var(--neutral-900); }

                .glass {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                    border-radius: var(--radius-xl);
                }

                .btn-load-more {
                    width: 100%;
                    padding: 0.75rem;
                    border: none;
                    background: var(--neutral-50);
                    color: var(--neutral-600);
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    border-radius: 12px;
                    margin-top: 1rem;
                }

                .btn-load-more:hover { background: var(--neutral-100); }

                @media (max-width: 1024px) {
                    .billing-content-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

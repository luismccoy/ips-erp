import React, { useEffect, useState } from 'react';
import { client, MOCK_USER } from '../amplify-utils';
import { type InventoryItem } from '../types';
import { useApiCall } from '../hooks/useApiCall';
import { ErrorAlert } from './ui/ErrorAlert';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { useForm } from '../hooks/useForm';
import styles from './InventoryDashboard.module.css';

type BadgeVariant = 'success' | 'warning' | 'error' | 'default';

interface ItemFormState {
    name: string;
    stockCount: number;
    threshold: number;
    expiry: string;
}

export const InventoryDashboard: React.FC = () => {
    const api = useApiCall();
    const [items, setItems] = useState<InventoryItem[]>([]);

    useEffect(() => {
        const query = client.models.InventoryItem.observeQuery({
            filter: {
                tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] }
            }
        });
        
        const sub = (query as any).subscribe({
            next: (data: any) => setItems([...data.items]),
            error: (err: Error) => console.error('Inventory sub error:', err)
        });

        return () => sub.unsubscribe();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const { values, errors, handleChange, validate, reset } = useForm<ItemFormState>(
        {
            name: '',
            stockCount: 0,
            threshold: 10,
            expiry: '2026-01-01'
        },
        {
            name: (val) => !val ? 'Item name is required' : null,
            stockCount: (val) => val < 0 ? 'Stock cannot be negative' : null,
            threshold: (val) => val < 0 ? 'Threshold cannot be negative' : null,
            expiry: (val) => !val ? 'Expiry date is required' : null
        }
    );

    const handleAddItem = async () => {
        if (!validate()) return;

        try {
            await api.execute(client.models.InventoryItem.create({
                tenantId: MOCK_USER.attributes['custom:tenantId'],
                name: values.name,
                sku: `SKU-${Date.now().toString().slice(-6)}`,
                stockCount: values.stockCount,
                unit: 'Unidad',
                reorderThreshold: values.threshold,
                expiryDate: values.expiry
            }));
            setIsModalOpen(false);
            reset();
        } catch (err) {
            console.error('Failed to add item:', err);
        }
    };

    const getStockStatus = (item: InventoryItem) => {
        const count = item.stockCount || 0;
        const threshold = item.reorderThreshold || 20;
        if (count === 0) return 'out-of-stock';
        if (count <= threshold) return 'low-stock';
        return 'in-stock';
    };

    const getStatusBadgeVariant = (status: string): BadgeVariant => {
        switch (status) {
            case 'in-stock': return 'success';
            case 'low-stock': return 'warning';
            case 'out-of-stock': return 'error';
            default: return 'default';
        }
    };

    const isExpiringSoon = (date: string | null | undefined) => {
        if (!date) return false;
        const expiryDate = new Date(date);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 90; // Warn if < 3 months
    };

    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + (item.stockCount || 0), 0);
    const lowStockItems = items.filter(item => getStockStatus(item) !== 'in-stock').length;
    const expiringSoonCount = items.filter(item => isExpiringSoon(item.expiryDate)).length;

    return (
        <div className={styles.inventoryDashboard}>
            <Card className={styles.inventoryCard} noPadding>
                <div style={{ padding: '2rem' }}>
                    {api.error && (
                        <ErrorAlert message={api.error.message} className="mb-4" onDismiss={api.reset} />
                    )}
                    <div className={styles.inventoryHeader}>
                        <div className={styles.headerIcon}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21M4 7H20M6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V9C20 8.46957 19.7893 7.96086 19.4142 7.58579C19.0391 7.21071 18.5304 7 18 7H6C5.46957 7 4.96086 7.21071 4.58579 7.58579C4.21071 7.96086 4 8.46957 4 9V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className={styles.headerText}>
                            <h2>Farmacia / Inventory</h2>
                            <p>Gestión de insumos y equipos médicos</p>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }>
                            Nuevo Insumo
                        </Button>
                    </div>

                    <div className={styles.statsGrid}>
                        <Card className={styles.statCard} noPadding>
                            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className={styles.statDetails}>
                                <div className={styles.statValue}>{totalItems}</div>
                                <div className={styles.statLabel}>Insumos</div>
                            </div>
                        </Card>

                        <Card className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.27002 6.96L12 12.01L20.73 6.96" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 22.08V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className={styles.statDetails}>
                                <div className={styles.statValue}>{totalStock}</div>
                                <div className={styles.statLabel}>Unidades</div>
                            </div>
                        </Card>

                        <Card className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 9V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 18H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10.29 3.86L1.82 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53002 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5318 3.56611 13.2807 3.32313 12.9812 3.15449C12.6817 2.98585 12.3438 2.89726 12 2.89726C11.6562 2.89726 11.3183 2.98585 11.0188 3.15449C10.7193 3.32313 10.4682 3.56611 10.29 3.86Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className={styles.statDetails}>
                                <div className={styles.statValue}>{lowStockItems}</div>
                                <div className={styles.statLabel}>Stock Crítico</div>
                            </div>
                        </Card>

                        <Card className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className={styles.statDetails}>
                                <div className={styles.statValue}>{expiringSoonCount}</div>
                                <div className={styles.statLabel}>Por Vencer</div>
                            </div>
                        </Card>
                    </div>

                    {items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21M4 7H20M6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V9C20 8.46957 19.7893 7.96086 19.4142 7.58579C19.0391 7.21071 18.5304 7 18 7H6C5.46957 7 4.96086 7.21071 4.58579 7.58579C4.21071 7.96086 4 8.46957 4 9V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <h4>No hay insumos</h4>
                            <p>Comienza agregando el primer ítem al inventario.</p>
                        </div>
                    ) : (
                        <Card className={`${styles.tableContainer} shadow-sm profile-border`} noPadding>
                            <table>
                                <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>Nombre del Ítem</th>
                                        <th>Cantiad</th>
                                        <th>Umbral</th>
                                        <th>Vencimiento</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const status = getStockStatus(item);
                                        const expiringSoon = isExpiringSoon(item.expiryDate);
                                        return (
                                            <tr key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                                <td>
                                                    <code className={styles.skuCode}>{item.sku}</code>
                                                </td>
                                                <td className={styles.itemName}>
                                                    <svg className={styles.itemIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    {item.name}
                                                </td>
                                                <td>
                                                    <strong>{item.stockCount}</strong> {item.unit}
                                                </td>
                                                <td>
                                                    <span className={styles.thresholdVal}>{item.reorderThreshold}</span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.expiryVal} ${expiringSoon ? styles.expiring : ''}`}>
                                                        {item.expiryDate || 'N/A'}
                                                        {expiringSoon && (
                                                            <svg className={styles.warnIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M12 9V14M12 18H12.01M10.29 3.86L1.82 18C1.55 18.3 1.55 18.64 1.81 18.99C1.98 19.34 2.23 19.68 2.53 19.99C2.83 20.29 3.18 20.47 3.53 20.47H20.47C20.81 20.47 21.16 20.29 21.46 19.99C21.76 19.68 22 19.34 22.18 18.99C22.35 18.64 22.44 18.3 22.18 18L13.71 3.86C13.53 3.56 13.28 3.32 12.98 3.15C12.68 2.98 12.34 2.89 12 2.89C11.65 2.89 11.31 2.98 11.01 3.15C10.71 3.32 10.46 3.56 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Badge variant={getStatusBadgeVariant(status)}>
                                                        {status === 'in-stock' && 'En Stock'}
                                                        {status === 'low-stock' && 'Stock Bajo'}
                                                        {status === 'out-of-stock' && 'Agotado'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Card>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Inventory Item"
            >
                <div className="space-y-4">
                    <Input
                        name="name"
                        label="Item Name"
                        placeholder="e.g. Surgical Gloves"
                        value={values.name}
                        onChange={handleChange}
                        error={errors.name}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            name="stockCount"
                            label="Initial Stock"
                            type="number"
                            value={values.stockCount}
                            onChange={handleChange}
                            error={errors.stockCount}
                        />
                        <Input
                            name="threshold"
                            label="Reorder Threshold"
                            type="number"
                            value={values.threshold}
                            onChange={handleChange}
                            error={errors.threshold}
                        />
                    </div>
                    <Input
                        name="expiry"
                        label="Expiry Date"
                        type="date"
                        value={values.expiry}
                        onChange={handleChange}
                        error={errors.expiry}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddItem} disabled={api.loading}>
                            {api.loading ? 'Adding...' : 'Add Item'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { client, MOCK_USER } from '../amplify-utils';
import { type Schema } from '../../amplify/data/resource';

type InventoryItem = Schema['Inventory']['type'];

export const InventoryDashboard: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);

    useEffect(() => {
        const sub = client.models.Inventory.observeQuery({
            filter: {
                tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] }
            }
        }).subscribe({
            next: (data) => setItems([...data.items]),
            error: (err) => console.error('Inventory sub error:', err)
        });

        return () => sub.unsubscribe();
    }, []);

    const handleAddItem = async () => {
        const name = prompt("Item Name (e.g., Syringes):");
        if (!name) return;

        await client.models.Inventory.create({
            tenantId: MOCK_USER.attributes['custom:tenantId'],
            name,
            sku: `SKU-${Date.now()}`,
            stockCount: 100,
            unit: 'Box'
        });
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h2>Farmacia / Inventory</h2>
            <button onClick={handleAddItem} style={{ marginBottom: '10px' }}>+ Receive Stock</button>

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ padding: '8px' }}>SKU</th>
                        <th style={{ padding: '8px' }}>Name</th>
                        <th style={{ padding: '8px' }}>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '8px' }}>{item.sku}</td>
                            <td style={{ padding: '8px' }}>{item.name}</td>
                            <td style={{ padding: '8px' }}>{item.stockCount} {item.unit}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {items.length === 0 && <p>No inventory items.</p>}
        </div>
    );
};

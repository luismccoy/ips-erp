// import { type Schema } from '../amplify/data/resource';
import type { Shift, Nurse, InventoryItem, Patient, Medication, Task } from './types';

// Simple In-Memory Store
interface StoreType {
    Shift: Shift[];
    Nurse: Nurse[];
    Inventory: InventoryItem[];
    Patient: Patient[];
    Medication: Medication[];
    Task: Task[];
    [key: string]: any[];
}

const STORE: StoreType = {
    Shift: [
        { id: 'shift-101', patientId: 'p1', patientName: 'Juan Manuel Santos', status: 'PENDING', nurseId: 'UNASSIGNED', nurseName: 'Unassigned', location: 'Calle 100 #7-15, Bogotá', requiredSkill: 'Artritis', scheduledTime: new Date(Date.now() + 86400000).toISOString(), tenantId: 'tenant-bogota-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'shift-102', patientId: 'p1', patientName: 'Juan Manuel Santos', status: 'PENDING', nurseId: 'UNASSIGNED', nurseName: 'Unassigned', location: 'Calle 100 #7-15, Bogotá', requiredSkill: 'Signos Vitales', scheduledTime: new Date(Date.now() + 172800000).toISOString(), tenantId: 'tenant-bogota-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    Nurse: [
        { id: 'nurse-maria', name: 'Maria Rodriguez', email: 'maria@example.com', role: 'NURSE', skills: ['Wound Care', 'Signos Vitales'], locationLat: 4.609, locationLng: -74.08, tenantId: 'tenant-bogota-01' },
        { id: 'nurse-pedro', name: 'Pedro Claver', email: 'pedro@example.com', role: 'ADMIN', skills: ['Artritis', 'Palliativos'], locationLat: 4.612, locationLng: -74.07, tenantId: 'tenant-bogota-01' }
    ],
    Inventory: [
        { id: '1', sku: 'SKU-GLOVE-01', name: 'Surgical Gloves', quantity: 50, stockCount: 50, unit: 'Box', reorderLevel: 20, reorderThreshold: 20, expiryDate: '2026-12-31', tenantId: 'tenant-bogota-01', status: 'in-stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', sku: 'SKU-SYR-05', name: 'Syringe 5ml', quantity: 15, stockCount: 15, unit: 'Unidad', reorderLevel: 30, reorderThreshold: 30, expiryDate: '2025-06-15', tenantId: 'tenant-bogota-01', status: 'low-stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '3', sku: 'SKU-MASK-N95', name: 'N95 Masks', quantity: 5, stockCount: 5, unit: 'Box', reorderLevel: 10, reorderThreshold: 10, expiryDate: '2027-01-01', tenantId: 'tenant-bogota-01', status: 'out-of-stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    Patient: [
        { id: 'p1', name: 'Juan Manuel Santos', documentId: '12345678', age: 72, address: 'Calle 100 #7-15, Bogotá', diagnosis: 'Artritis Reumatoide', tenantId: 'tenant-bogota-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    Medication: [
        { id: 'm1', patientId: 'p1', name: 'Metotrexato', dosage: '15mg', frequency: 'Semanal', status: 'ACTIVE' },
        { id: 'm2', patientId: 'p1', name: 'Ácido Fólico', dosage: '5mg', frequency: 'Diario', status: 'ACTIVE' }
    ],
    Task: [
        { id: 't1', patientId: 'p1', description: 'Revisión de signos vitales', isCompleted: false, dueDate: new Date().toISOString() },
        { id: 't2', patientId: 'p1', description: 'Curación de herida en mano derecha', isCompleted: false, dueDate: new Date().toISOString() }
    ]
};

const LISTENERS: Record<string, Function[]> = {
    Shift: [],
    Nurse: [],
    Inventory: [],
    Patient: [],
    Medication: [],
    Task: []
};

function notify(model: string) {
    if (LISTENERS[model]) {
        LISTENERS[model].forEach((cb) => cb({ items: STORE[model] }));
    }
}

interface MockModelClient<T> {
    observeQuery: (options?: any) => {
        subscribe: (observer: { next: (data: { items: T[] }) => void; error?: (err: Error) => void }) => { unsubscribe: () => void };
    };
    create: (item: Partial<T>) => Promise<{ data: T }>;
    update: (item: Partial<T>) => Promise<{ data: T }>;
    delete: (item: { id: string }) => Promise<{ data: T | null }>;
}

export interface MockClient {
    models: {
        Shift: MockModelClient<Shift>;
        Nurse: MockModelClient<Nurse>;
        Inventory: MockModelClient<InventoryItem>;
        Patient: MockModelClient<Patient>;
        Medication: MockModelClient<Medication>;
        Task: MockModelClient<Task>;
    };
    queries: {
        generateRoster: (args: { nurses: string; unassignedShifts: string }) => Promise<{ data: string; errors?: any[] }>;
    };
}

export function generateMockClient(): MockClient {
    const createModelHandlers = <T extends { id: string }>(model: string): MockModelClient<T> => ({
        observeQuery: () => ({
            subscribe: ({ next }: any) => {
                LISTENERS[model].push(next);
                next({ items: STORE[model] });
                return { unsubscribe: () => { } };
            }
        }),
        create: async (item: Partial<T>) => {
            const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) } as T;
            STORE[model].push(newItem);
            notify(model);
            return { data: newItem };
        },
        update: async (item: Partial<T>) => {
            const index = STORE[model].findIndex((i: any) => i.id === item.id);
            if (index !== -1) {
                STORE[model][index] = { ...STORE[model][index], ...item };
                notify(model);
            }
            return { data: STORE[model][index] };
        },
        delete: async (item: { id: string }) => {
            const index = STORE[model].findIndex((i: any) => i.id === item.id);
            if (index !== -1) {
                const deleted = STORE[model].splice(index, 1)[0];
                notify(model);
                return { data: deleted };
            }
            return { data: null };
        }
    });

    return {
        models: {
            Shift: createModelHandlers<Shift>('Shift'),
            Nurse: createModelHandlers<Nurse>('Nurse'),
            Inventory: createModelHandlers<InventoryItem>('Inventory'),
            Patient: createModelHandlers<Patient>('Patient'),
            Medication: createModelHandlers<Medication>('Medication'),
            Task: createModelHandlers<Task>('Task')
        },
        queries: {
            generateRoster: async (args: { nurses: string; unassignedShifts: string }) => {
                const nurses = JSON.parse(args.nurses);
                const shifts = JSON.parse(args.unassignedShifts);

                // Simple logic: Match by first skill overlap
                const assignments = shifts.map((s: any) => {
                    const nurse = nurses.find((n: any) =>
                        n.skills.some((sk: string) => s.requiredSkill === sk)
                    );
                    return { shiftId: s.id, nurseId: nurse ? nurse.id : 'UNASSIGNED', nurseName: nurse ? nurse.name : null };
                });

                await new Promise(r => setTimeout(r, 2000));
                return {
                    data: JSON.stringify({ assignments })
                };
            }
        }
    };
}


// import { type Schema } from '../amplify/data/resource';
import type { Shift, Nurse, InventoryItem, Patient, Medication, Task, VitalSigns, AuditLog, BillingRecord } from './types';
import type { Visit, NotificationItem } from './types/workflow';

// Simple In-Memory Store
interface StoreType {
    Shift: Shift[];
    Nurse: Nurse[];
    Inventory: InventoryItem[];
    Patient: Patient[];
    Medication: Medication[];
    Task: Task[];
    VitalSigns: VitalSigns[];
    Visit: Visit[];
    AuditLog: AuditLog[];
    BillingRecord: BillingRecord[];
    Notification: NotificationItem[];

    [key: string]: unknown[];
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
        { id: 't1', patientId: 'p1', description: 'Revisión de signos vitales', completed: false, dueDate: new Date().toISOString() },
        { id: 't2', patientId: 'p1', description: 'Curación de herida en mano derecha', completed: false, dueDate: new Date().toISOString() }
    ],
    VitalSigns: [
        { id: 'v1', tenantId: 'tenant-bogota-01', patientId: 'p1', date: '2026-01-20', sys: 145, dia: 90, spo2: 95, hr: 78, note: 'Paciente estable con medicación ajustada', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'v2', tenantId: 'tenant-bogota-01', patientId: 'p1', date: '2026-01-18', sys: 150, dia: 95, spo2: 94, hr: 82, note: 'Presión arterial ligeramente elevada', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    Visit: [],
    AuditLog: [],
    BillingRecord: [],
    Notification: []
};

// Properly type LISTENERS using a generic function type or unknown
type ListenerCallback<T> = (data: { items: T[] }) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LISTENERS: Record<string, ListenerCallback<any>[]> = {
    Shift: [],
    Nurse: [],
    Inventory: [],
    Patient: [],
    Medication: [],
    Task: [],
    VitalSigns: [],
    Visit: [],
    AuditLog: [],
    BillingRecord: [],
    Notification: []
};

function notify<T>(model: keyof StoreType) {
    if (LISTENERS[model as string]) {
        LISTENERS[model as string].forEach((cb) => cb({ items: STORE[model] as T[] }));
    }
}

interface MockModelClient<T> {
    observeQuery: (options?: unknown) => {
        subscribe: (observer: { next: (data: { items: T[] }) => void; error?: (err: Error) => void }) => { unsubscribe: () => void };
    };
    list: (args?: { filter?: any; limit?: number; nextToken?: string | null }) => Promise<{ data: T[]; nextToken: string | null }>;
    get: (args: { id: string }) => Promise<{ data: T | null }>;
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
        VitalSigns: MockModelClient<VitalSigns>;
        Visit: MockModelClient<Visit>;
        AuditLog: MockModelClient<AuditLog>;
        BillingRecord: MockModelClient<BillingRecord>;
        Notification: MockModelClient<NotificationItem>;

    };
    queries: {
        generateRoster: (args: { nurses: string; unassignedShifts: string }) => Promise<{ data: string; errors?: Error[] }>;
        listApprovedVisitSummariesForFamily: (args: { patientId: string }) => Promise<{ data: string; errors?: Error[] }>;
        validateRIPS: (args: { invoiceId: string }) => Promise<{ data: string; errors?: Error[] }>;
        glosaDefender: (args: { glosaId: string }) => Promise<{ data: string; errors?: Error[] }>;
    };
    mutations: {
        createVisitDraftFromShift: (args: { shiftId: string }) => Promise<{ data: string; errors?: Error[] }>;
        submitVisit: (args: { shiftId: string }) => Promise<{ data: string; errors?: Error[] }>;
        approveVisit: (args: { shiftId: string }) => Promise<{ data: string; errors?: Error[] }>;
        rejectVisit: (args: { shiftId: string; reason: string }) => Promise<{ data: string; errors?: Error[] }>;
    };
}

export function generateMockClient(): MockClient {
    const createModelHandlers = <T extends { id: string }>(model: keyof StoreType): MockModelClient<T> => ({
        observeQuery: () => ({
            subscribe: ({ next }: { next: (data: { items: T[] }) => void }) => {
                LISTENERS[model as string].push(next);
                next({ items: STORE[model] as T[] });
                return { unsubscribe: () => { /* No-op */ } };
            }
        }),
        list: async (args) => {
            let items = [...(STORE[model] as T[])];
            if (args?.filter) {
                // Simplified mock filter: only handles eq for status or tenantId
                if (args.filter.status?.eq) items = items.filter((i: any) => i.status === args.filter.status.eq);
                if (args.filter.tenantId?.eq) items = items.filter((i: any) => i.tenantId === args.filter.tenantId.eq);
            }
            const limit = args?.limit || 50;
            const start = args?.nextToken ? parseInt(args.nextToken) : 0;
            const paginated = items.slice(start, start + limit);
            const nextToken = start + limit < items.length ? (start + limit).toString() : null;
            return { data: paginated, nextToken };
        },
        get: async ({ id }) => {
            const item = (STORE[model] as T[]).find(i => i.id === id);
            return { data: item || null };
        },
        create: async (item: Partial<T>) => {
            const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) } as T;
            (STORE[model] as T[]).push(newItem);
            notify<T>(model);
            return { data: newItem };
        },
        update: async (item: Partial<T>) => {
            const list = STORE[model] as T[];
            const index = list.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                list[index] = { ...list[index], ...item };
                notify<T>(model);
                return { data: list[index] };
            }
            // Fallback if not found, though in mock env we usually assume it exists
            return { data: item as T };
        },
        delete: async (item: { id: string }) => {
            const list = STORE[model] as T[];
            const index = list.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                const deleted = list.splice(index, 1)[0];
                notify<T>(model);
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
            Task: createModelHandlers<Task>('Task'),
            VitalSigns: createModelHandlers<VitalSigns>('VitalSigns'),
            Visit: createModelHandlers<Visit>('Visit'),
            AuditLog: createModelHandlers<AuditLog>('AuditLog'),
            BillingRecord: createModelHandlers<BillingRecord>('BillingRecord'),
            Notification: createModelHandlers<NotificationItem>('Notification')

        },
        queries: {

            generateRoster: async (args: { nurses: string; unassignedShifts: string }) => {
                const nurses = JSON.parse(args.nurses) as Nurse[];
                const shifts = JSON.parse(args.unassignedShifts) as Shift[];

                // Simple logic: Match by first skill overlap
                const assignments = shifts.map((s) => {
                    const nurse = nurses.find((n) =>
                        n.skills?.some((sk: string) => s.requiredSkill === sk)
                    );
                    return {
                        shiftId: s.id,
                        nurseId: nurse ? nurse.id : 'UNASSIGNED',
                        nurseName: nurse ? nurse.name : undefined
                    };
                });

                await new Promise(r => setTimeout(r, 2000));
                return {
                    data: JSON.stringify({ assignments })
                };
            },
            validateRIPS: async (args: { invoiceId: string }) => {
                console.log('Mocking RIPS validation for:', args.invoiceId);
                await new Promise(r => setTimeout(r, 1500));
                return { data: JSON.stringify({ status: 'VALID', message: 'RIPS documentation is complete and valid.' }) };
            },
            glosaDefender: async (args: { glosaId: string }) => {
                console.log('Mocking glosa defense for:', args.glosaId);
                await new Promise(r => setTimeout(r, 2000));
                return { data: JSON.stringify({ defenseLetter: 'AI generated defense letter text here...' }) };
            },
            listApprovedVisitSummariesForFamily: async (args: { patientId: string }) => {
                const visits = (STORE.Visit as Visit[]).filter(v => v.patientId === args.patientId && v.status === 'APPROVED');
                return { data: JSON.stringify({ visits }) };
            }
        },
        mutations: {
            // Workflow mutations - Requirement 9.2
            createVisitDraftFromShift: async (args: { shiftId: string }) => {

                const { shiftId } = args;
                const shift = (STORE.Shift as Shift[]).find(s => s.id === shiftId);

                if (!shift) {
                    return { data: JSON.stringify({ error: 'Shift not found' }), errors: [new Error('Shift not found')] };
                }

                // Check if visit already exists
                const existingVisit = (STORE.Visit as Visit[]).find(v => v.shiftId === shiftId);
                if (existingVisit) {
                    return { data: JSON.stringify({ visit: existingVisit }) };
                }

                const now = new Date().toISOString();
                const newVisit: Visit = {
                    id: shiftId, // 1:1 relationship
                    tenantId: shift.tenantId || 'tenant-bogota-01',
                    shiftId: shiftId,
                    patientId: shift.patientId || '',
                    nurseId: shift.nurseId || '',
                    status: 'DRAFT',
                    kardex: {
                        generalObservations: '',
                    },
                    createdAt: now,
                    updatedAt: now
                };

                (STORE.Visit as Visit[]).push(newVisit);
                notify<Visit>('Visit');

                await new Promise(r => setTimeout(r, 500));
                return { data: JSON.stringify({ visit: newVisit }) };
            },

            submitVisit: async (args: { shiftId: string }) => {
                const { shiftId } = args;
                const visits = STORE.Visit as Visit[];
                const visitIndex = visits.findIndex(v => v.shiftId === shiftId);

                if (visitIndex === -1) {
                    return { data: JSON.stringify({ error: 'Visit not found' }), errors: [new Error('Visit not found')] };
                }

                const visit = visits[visitIndex];
                if (visit.status !== 'DRAFT' && visit.status !== 'REJECTED') {
                    return { data: JSON.stringify({ error: 'Visit cannot be submitted from current status' }), errors: [new Error('Invalid status transition')] };
                }

                const now = new Date().toISOString();
                visits[visitIndex] = {
                    ...visit,
                    status: 'SUBMITTED',
                    submittedAt: now,
                    updatedAt: now
                };

                // Create notification for admin
                const notification: NotificationItem = {
                    id: `notif-${Date.now()}`,
                    userId: 'admin', // Notify admin
                    type: 'VISIT_PENDING_REVIEW',
                    message: `Nueva visita pendiente de revisión`,
                    entityId: shiftId,
                    read: false,
                    createdAt: now
                };
                (STORE.Notification as NotificationItem[]).push(notification);

                notify<Visit>('Visit');
                notify<NotificationItem>('Notification');

                await new Promise(r => setTimeout(r, 500));
                return { data: JSON.stringify({ visit: visits[visitIndex] }) };
            },

            approveVisit: async (args: { shiftId: string }) => {
                const { shiftId } = args;
                const visits = STORE.Visit as Visit[];
                const visitIndex = visits.findIndex(v => v.shiftId === shiftId);

                if (visitIndex === -1) {
                    return { data: JSON.stringify({ error: 'Visit not found' }), errors: [new Error('Visit not found')] };
                }

                const visit = visits[visitIndex];
                if (visit.status !== 'SUBMITTED') {
                    return { data: JSON.stringify({ error: 'Only submitted visits can be approved' }), errors: [new Error('Invalid status transition')] };
                }

                const now = new Date().toISOString();
                visits[visitIndex] = {
                    ...visit,
                    status: 'APPROVED',
                    approvedAt: now,
                    approvedBy: 'mock-admin',
                    reviewedAt: now,
                    reviewedBy: 'mock-admin',
                    updatedAt: now
                };

                // Create notification for nurse
                const notification: NotificationItem = {
                    id: `notif-${Date.now()}`,
                    type: 'VISIT_APPROVED',
                    message: `Su visita ha sido aprobada`,
                    entityId: shiftId,
                    read: false,
                    createdAt: now
                };
                (STORE.Notification as NotificationItem[]).push(notification);

                notify<Visit>('Visit');
                notify<NotificationItem>('Notification');

                await new Promise(r => setTimeout(r, 500));
                return { data: JSON.stringify({ visit: visits[visitIndex] }) };
            },

            rejectVisit: async (args: { shiftId: string; reason: string }) => {
                const { shiftId, reason } = args;
                const visits = STORE.Visit as Visit[];
                const visitIndex = visits.findIndex(v => v.shiftId === shiftId);

                if (visitIndex === -1) {
                    return { data: JSON.stringify({ error: 'Visit not found' }), errors: [new Error('Visit not found')] };
                }

                const visit = visits[visitIndex];
                if (visit.status !== 'SUBMITTED') {
                    return { data: JSON.stringify({ error: 'Only submitted visits can be rejected' }), errors: [new Error('Invalid status transition')] };
                }

                if (!reason || reason.trim() === '') {
                    return { data: JSON.stringify({ error: 'Rejection reason is required' }), errors: [new Error('Rejection reason required')] };
                }

                const now = new Date().toISOString();
                visits[visitIndex] = {
                    ...visit,
                    status: 'REJECTED',
                    rejectionReason: reason,
                    reviewedAt: now,
                    reviewedBy: 'mock-admin',
                    updatedAt: now
                };

                // Create notification for nurse
                const notification: NotificationItem = {
                    id: `notif-${Date.now()}`,
                    type: 'VISIT_REJECTED',
                    message: `Su visita ha sido rechazada: ${reason}`,
                    entityId: shiftId,
                    read: false,
                    createdAt: now
                };
                (STORE.Notification as NotificationItem[]).push(notification);

                notify<Visit>('Visit');
                notify<NotificationItem>('Notification');

                await new Promise(r => setTimeout(r, 500));
                return { data: JSON.stringify({ visit: visits[visitIndex] }) };
            }
        }
    };
}


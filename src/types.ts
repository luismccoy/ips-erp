// Client-side type definitions
// These mirror the Amplify schema but don't import any Node.js modules

export type Shift = {
    id: string;
    tenantId?: string;
    nurseId: string;
    nurseName: string;
    patientId?: string;
    patientName: string;
    requiredSkill?: string;
    location: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | null;
    scheduledTime: string;
    startedAt?: string | null;
    completedAt?: string | null;
    clinicalNote?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type InventoryItem = {
    id: string;
    tenantId?: string;
    name: string;
    sku?: string | null;
    quantity: number;
    stockCount?: number | null;
    unit?: string | null;
    reorderLevel: number;
    reorderThreshold?: number | null;
    expiryDate?: string | null;
    status: 'in-stock' | 'low-stock' | 'out-of-stock' | null;
    createdAt: string;
    updatedAt: string;
};

export type Patient = {
    id: string;
    tenantId: string;
    name: string;
    documentId: string;
    age?: number | null;
    address?: string | null;
    eps?: string | null;
    diagnosis?: string | null;
    medications?: Medication[];
    tasks?: Task[];
    createdAt: string;
    updatedAt: string;
};

export type Medication = {
    id: string;
    patientId: string;
    name: string;
    dosage: string;
    frequency: string;
    status: 'ACTIVE' | 'DISCONTINUED';
};

export type Task = {
    id: string;
    patientId: string;
    description: string;
    completed: boolean;
    dueDate?: string | null;
};

export type Nurse = {
    id: string;
    tenantId: string;
    name: string;
    email?: string;
    role: 'ADMIN' | 'NURSE' | 'COORDINATOR';
    skills?: string[];
    locationLat?: number;
    locationLng?: number;
};

export type Tenant = {
    id: string;
    name: string;
    nit: string;
};

export type VitalSigns = {
    id: string;
    tenantId: string;
    patientId: string;
    date: string;
    sys: number;
    dia: number;
    spo2: number;
    hr: number;
    temperature?: number | null;
    weight?: number | null;
    note?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type AuditLog = {
    id: string;
    tenantId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string; // JSON string
    createdAt: string;
    updatedAt: string;
};

export type BillingStatus = 'PENDING' | 'PAID' | 'CANCELED' | 'GLOSED';

export type BillingRecord = {
    id: string;
    tenantId: string;
    patientId: string;
    shiftId?: string | null;
    invoiceNumber?: string | null;
    totalValue: number;
    status: BillingStatus;
    radicationDate?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type AmplifyUser = {
    username: string;
    attributes: {
        sub: string;
        email: string;
        'custom:tenantId': string;
        [key: string]: string;
    };
};


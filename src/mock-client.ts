// import { type Schema } from '../amplify/data/resource';
import type { Shift, Nurse, InventoryItem, Patient, Medication, Task, VitalSigns, AuditLog, BillingRecord } from './types';
import type { Visit, NotificationItem } from './types/workflow';

// ============================================
// RICH DEMO DATA FOR SALES PRESENTATIONS
// ============================================
// This data is designed to showcase all features of IPS ERP
// when prospects click "View Demo" from the landing page.

const TENANT_ID = 'ips-vida'; // Must match TENANTS[0].id in mock-data.ts
const NOW = new Date();

// Helper to create dates relative to now
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
const hoursFromNow = (hours: number) => new Date(NOW.getTime() + hours * 60 * 60 * 1000).toISOString();

// Simple In-Memory Store
interface StoreType {
    Shift: Shift[];
    Nurse: Nurse[];
    InventoryItem: InventoryItem[];
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

// ============================================
// DEMO PATIENTS (8 total)
// ============================================
const DEMO_PATIENTS: Patient[] = [
    { 
        id: 'p1', 
        name: 'Roberto Gómez Bolaños', 
        documentId: '19.234.567', 
        age: 78, 
        address: 'Calle 100 #15-20, Chapinero, Bogotá', 
        diagnosis: 'I10 - Hipertensión Arterial',
        eps: 'Sanitas EPS',
        tenantId: TENANT_ID, 
        createdAt: daysAgo(90), 
        updatedAt: daysAgo(1) 
    },
    { 
        id: 'p2', 
        name: 'Ana María Martínez', 
        documentId: '51.456.789', 
        age: 65, 
        address: 'Carrera 7 #80-45, Usaquén, Bogotá', 
        diagnosis: 'E11 - Diabetes Mellitus Tipo 2',
        eps: 'Sura EPS',
        tenantId: TENANT_ID, 
        createdAt: daysAgo(60), 
        updatedAt: daysAgo(2) 
    },
    { 
        id: 'p3', 
        name: 'Carlos Eduardo Vives', 
        documentId: '79.123.456', 
        age: 82, 
        address: 'Avenida 19 #100-50, Chicó, Bogotá', 
        diagnosis: 'M06.9 - Artritis Reumatoide',
        eps: 'Nueva EPS',
        tenantId: TENANT_ID, 
        createdAt: daysAgo(45), 
        updatedAt: daysAgo(3) 
    },
    { 
        id: 'p4', 
        name: 'María Teresa Londoño', 
        documentId: '41.789.012', 
        age: 71, 
        address: 'Calle 85 #11-53, Zona Rosa, Bogotá', 
        diagnosis: 'J44.9 - EPOC',
        eps: 'Compensar EPS',
        tenantId: TENANT_ID, 
        createdAt: daysAgo(30), 
        updatedAt: daysAgo(1) 
    },
    { 
        id: 'p5', 
        name: 'Jorge Luis Borges', 
        documentId: '19.567.890', 
        age: 85, 
        address: 'Carrera 15 #90-20, Chicó Norte, Bogotá', 
        diagnosis: 'I25.9 - Cardiopatía Isquémica',
        eps: 'Sanitas EPS',
        tenantId: TENANT_ID, 
        createdAt: daysAgo(120), 
        updatedAt: daysAgo(5) 
    },
    { 
        id: 'p6', 
        name: 'Lucía Fernanda Castro', 
        documentId: '52.345.678', 
        age: 68, 
        address: 'Calle 127 #7-30, Cedritos, Bogotá', 
        diagnosis: 'G20 - Enfermedad de Parkinson',
        eps: 'Famisanar EPS',
        tenantId: TENANT_ID, 
        createdAt: daysAgo(75), 
        updatedAt: daysAgo(4) 
    },
    { 
        id: 'p7', 
        name: 'Pedro Pablo Pérez', 
        documentId: '79.012.345', 
        age: 74, 
        address: 'Avenida Suba #115-40, Suba, Bogotá', 
        diagnosis: 'N18.9 - Enfermedad Renal Crónica',
        eps: 'Salud Total EPS',
        tenantId: TENANT_ID, 
        createdAt: daysAgo(55), 
        updatedAt: daysAgo(2) 
    },
    { 
        id: 'p8', 
        name: 'Sofía Vergara Medina', 
        documentId: '32.678.901', 
        age: 69, 
        address: 'Calle 140 #10-25, Cedritos, Bogotá', 
        diagnosis: 'C50.9 - Cáncer de Mama (Remisión)',
        eps: 'Coomeva EPS',
        tenantId: TENANT_ID, 
        createdAt: daysAgo(40), 
        updatedAt: daysAgo(1) 
    }
];

// ============================================
// DEMO NURSES (4 total)
// ============================================
const DEMO_NURSES: Nurse[] = [
    { 
        id: 'nurse-maria', 
        name: 'María Rodríguez', 
        email: 'maria@ipsvida.com', 
        role: 'NURSE', 
        skills: ['Cuidado de Heridas', 'Signos Vitales', 'Administración de Medicamentos', 'Oxigenoterapia'], 
        locationLat: 4.6761, 
        locationLng: -74.0465,
        isActive: true,
        tenantId: TENANT_ID 
    },
    { 
        id: 'nurse-carlos', 
        name: 'Carlos Andrés Mejía', 
        email: 'carlos@ipsvida.com', 
        role: 'NURSE', 
        skills: ['Rehabilitación', 'Artritis', 'Cuidados Paliativos', 'Manejo del Dolor'], 
        locationLat: 4.6950, 
        locationLng: -74.0300,
        isActive: true,
        tenantId: TENANT_ID 
    },
    { 
        id: 'nurse-laura', 
        name: 'Laura Camila Torres', 
        email: 'laura@ipsvida.com', 
        role: 'NURSE', 
        skills: ['Diabetes', 'Nutrición', 'Cuidado Cardiovascular', 'Signos Vitales'], 
        locationLat: 4.7110, 
        locationLng: -74.0723,
        isActive: true,
        tenantId: TENANT_ID 
    },
    { 
        id: 'nurse-andres', 
        name: 'Andrés Felipe Gómez', 
        email: 'andres@ipsvida.com', 
        role: 'COORDINATOR', 
        skills: ['Coordinación', 'Supervisión', 'Cuidado de Heridas', 'Emergencias'], 
        locationLat: 4.6580, 
        locationLng: -74.0550,
        isActive: true,
        tenantId: TENANT_ID 
    }
];

// ============================================
// DEMO SHIFTS (12 total - mixed statuses)
// ============================================
const DEMO_SHIFTS: Shift[] = [
    // COMPLETED Shifts (past)
    { 
        id: 'shift-001', 
        patientId: 'p1', 
        patientName: 'Roberto Gómez Bolaños',
        status: 'COMPLETED', 
        nurseId: 'nurse-maria', 
        nurseName: 'María Rodríguez', 
        location: 'Calle 100 #15-20, Chapinero', 
        requiredSkill: 'Signos Vitales',
        scheduledTime: daysAgo(1), 
        startedAt: daysAgo(1),
        completedAt: daysAgo(1),
        tenantId: TENANT_ID, 
        createdAt: daysAgo(3), 
        updatedAt: daysAgo(1) 
    },
    { 
        id: 'shift-002', 
        patientId: 'p2', 
        patientName: 'Ana María Martínez',
        status: 'COMPLETED', 
        nurseId: 'nurse-laura', 
        nurseName: 'Laura Camila Torres', 
        location: 'Carrera 7 #80-45, Usaquén', 
        requiredSkill: 'Diabetes',
        scheduledTime: daysAgo(1), 
        startedAt: daysAgo(1),
        completedAt: daysAgo(1),
        tenantId: TENANT_ID, 
        createdAt: daysAgo(3), 
        updatedAt: daysAgo(1) 
    },
    { 
        id: 'shift-003', 
        patientId: 'p4', 
        patientName: 'María Teresa Londoño',
        status: 'COMPLETED', 
        nurseId: 'nurse-maria', 
        nurseName: 'María Rodríguez', 
        location: 'Calle 85 #11-53, Zona Rosa', 
        requiredSkill: 'Oxigenoterapia',
        scheduledTime: daysAgo(2), 
        startedAt: daysAgo(2),
        completedAt: daysAgo(2),
        tenantId: TENANT_ID, 
        createdAt: daysAgo(5), 
        updatedAt: daysAgo(2) 
    },
    // IN_PROGRESS Shifts (today)
    { 
        id: 'shift-004', 
        patientId: 'p3', 
        patientName: 'Carlos Eduardo Vives',
        status: 'IN_PROGRESS', 
        nurseId: 'nurse-carlos', 
        nurseName: 'Carlos Andrés Mejía', 
        location: 'Avenida 19 #100-50, Chicó', 
        requiredSkill: 'Artritis',
        scheduledTime: hoursFromNow(-1), 
        startedAt: hoursFromNow(-1),
        tenantId: TENANT_ID, 
        createdAt: daysAgo(2), 
        updatedAt: NOW.toISOString() 
    },
    // PENDING Shifts (today and tomorrow)
    { 
        id: 'shift-005', 
        patientId: 'p5', 
        patientName: 'Jorge Luis Borges',
        status: 'PENDING', 
        nurseId: 'nurse-maria', 
        nurseName: 'María Rodríguez', 
        location: 'Carrera 15 #90-20, Chicó Norte', 
        requiredSkill: 'Cuidado Cardiovascular',
        scheduledTime: hoursFromNow(2), 
        tenantId: TENANT_ID, 
        createdAt: daysAgo(1), 
        updatedAt: NOW.toISOString() 
    },
    { 
        id: 'shift-006', 
        patientId: 'p1', 
        patientName: 'Roberto Gómez Bolaños',
        status: 'PENDING', 
        nurseId: 'nurse-laura', 
        nurseName: 'Laura Camila Torres', 
        location: 'Calle 100 #15-20, Chapinero', 
        requiredSkill: 'Signos Vitales',
        scheduledTime: hoursFromNow(4), 
        tenantId: TENANT_ID, 
        createdAt: daysAgo(1), 
        updatedAt: NOW.toISOString() 
    },
    { 
        id: 'shift-007', 
        patientId: 'p6', 
        patientName: 'Lucía Fernanda Castro',
        status: 'PENDING', 
        nurseId: 'nurse-carlos', 
        nurseName: 'Carlos Andrés Mejía', 
        location: 'Calle 127 #7-30, Cedritos', 
        requiredSkill: 'Rehabilitación',
        scheduledTime: daysFromNow(1), 
        tenantId: TENANT_ID, 
        createdAt: NOW.toISOString(), 
        updatedAt: NOW.toISOString() 
    },
    // UNASSIGNED Shifts (for AI Roster demo)
    { 
        id: 'shift-008', 
        patientId: 'p7', 
        patientName: 'Pedro Pablo Pérez',
        status: 'PENDING', 
        nurseId: 'UNASSIGNED', 
        nurseName: 'Sin Asignar', 
        location: 'Avenida Suba #115-40, Suba', 
        requiredSkill: 'Signos Vitales',
        scheduledTime: daysFromNow(1), 
        tenantId: TENANT_ID, 
        createdAt: NOW.toISOString(), 
        updatedAt: NOW.toISOString() 
    },
    { 
        id: 'shift-009', 
        patientId: 'p8', 
        patientName: 'Sofía Vergara Medina',
        status: 'PENDING', 
        nurseId: 'UNASSIGNED', 
        nurseName: 'Sin Asignar', 
        location: 'Calle 140 #10-25, Cedritos', 
        requiredSkill: 'Cuidado de Heridas',
        scheduledTime: daysFromNow(2), 
        tenantId: TENANT_ID, 
        createdAt: NOW.toISOString(), 
        updatedAt: NOW.toISOString() 
    },
    { 
        id: 'shift-010', 
        patientId: 'p2', 
        patientName: 'Ana María Martínez',
        status: 'PENDING', 
        nurseId: 'UNASSIGNED', 
        nurseName: 'Sin Asignar', 
        location: 'Carrera 7 #80-45, Usaquén', 
        requiredSkill: 'Diabetes',
        scheduledTime: daysFromNow(2), 
        tenantId: TENANT_ID, 
        createdAt: NOW.toISOString(), 
        updatedAt: NOW.toISOString() 
    },
    // CANCELLED Shift
    { 
        id: 'shift-011', 
        patientId: 'p4', 
        patientName: 'María Teresa Londoño',
        status: 'CANCELLED', 
        nurseId: 'nurse-maria', 
        nurseName: 'María Rodríguez', 
        location: 'Calle 85 #11-53, Zona Rosa', 
        requiredSkill: 'Oxigenoterapia',
        clinicalNote: 'Cancelado por hospitalización del paciente',
        scheduledTime: daysAgo(3), 
        tenantId: TENANT_ID, 
        createdAt: daysAgo(5), 
        updatedAt: daysAgo(3) 
    },
    // More completed for history
    { 
        id: 'shift-012', 
        patientId: 'p5', 
        patientName: 'Jorge Luis Borges',
        status: 'COMPLETED', 
        nurseId: 'nurse-maria', 
        nurseName: 'María Rodríguez', 
        location: 'Carrera 15 #90-20, Chicó Norte', 
        requiredSkill: 'Cuidado Cardiovascular',
        scheduledTime: daysAgo(4), 
        startedAt: daysAgo(4),
        completedAt: daysAgo(4),
        clinicalNote: 'Paciente estable. Medicación ajustada según indicación del cardiólogo.',
        tenantId: TENANT_ID, 
        createdAt: daysAgo(6), 
        updatedAt: daysAgo(4) 
    }
];

// ============================================
// DEMO INVENTORY (15 items - varied statuses)
// ============================================
const DEMO_INVENTORY: InventoryItem[] = [
    // IN_STOCK items
    { id: 'inv-001', sku: 'SKU-GLOVE-L', name: 'Guantes de Látex (L)', quantity: 150, stockCount: 150, unit: 'Caja', reorderLevel: 50, reorderThreshold: 50, expiryDate: '2027-06-30', tenantId: TENANT_ID, status: 'in-stock', createdAt: daysAgo(30), updatedAt: daysAgo(1) },
    { id: 'inv-002', sku: 'SKU-MASK-N95', name: 'Mascarilla N95', quantity: 200, stockCount: 200, unit: 'Unidad', reorderLevel: 100, reorderThreshold: 100, expiryDate: '2028-01-01', tenantId: TENANT_ID, status: 'in-stock', createdAt: daysAgo(45), updatedAt: daysAgo(2) },
    { id: 'inv-003', sku: 'SKU-ALCOHOL', name: 'Alcohol Antiséptico 70%', quantity: 48, stockCount: 48, unit: 'Litro', reorderLevel: 20, reorderThreshold: 20, expiryDate: '2027-12-31', tenantId: TENANT_ID, status: 'in-stock', createdAt: daysAgo(20), updatedAt: daysAgo(3) },
    { id: 'inv-004', sku: 'SKU-GASA-EST', name: 'Gasa Estéril 10x10', quantity: 500, stockCount: 500, unit: 'Paquete', reorderLevel: 200, reorderThreshold: 200, expiryDate: '2028-06-30', tenantId: TENANT_ID, status: 'in-stock', createdAt: daysAgo(60), updatedAt: daysAgo(5) },
    { id: 'inv-005', sku: 'SKU-TENSIOM', name: 'Tensiómetro Digital', quantity: 8, stockCount: 8, unit: 'Unidad', reorderLevel: 3, reorderThreshold: 3, expiryDate: '', tenantId: TENANT_ID, status: 'in-stock', createdAt: daysAgo(90), updatedAt: daysAgo(10) },
    // LOW_STOCK items (for alerts demo)
    { id: 'inv-006', sku: 'SKU-SYR-5ML', name: 'Jeringa 5ml', quantity: 25, stockCount: 25, unit: 'Unidad', reorderLevel: 50, reorderThreshold: 50, expiryDate: '2026-09-30', tenantId: TENANT_ID, status: 'low-stock', createdAt: daysAgo(30), updatedAt: NOW.toISOString() },
    { id: 'inv-007', sku: 'SKU-SYR-10ML', name: 'Jeringa 10ml', quantity: 18, stockCount: 18, unit: 'Unidad', reorderLevel: 30, reorderThreshold: 30, expiryDate: '2026-08-15', tenantId: TENANT_ID, status: 'low-stock', createdAt: daysAgo(30), updatedAt: NOW.toISOString() },
    { id: 'inv-008', sku: 'SKU-CATETER', name: 'Catéter IV 22G', quantity: 12, stockCount: 12, unit: 'Unidad', reorderLevel: 25, reorderThreshold: 25, expiryDate: '2026-12-01', tenantId: TENANT_ID, status: 'low-stock', createdAt: daysAgo(40), updatedAt: NOW.toISOString() },
    { id: 'inv-009', sku: 'SKU-OXIMETRO', name: 'Oxímetro de Pulso', quantity: 2, stockCount: 2, unit: 'Unidad', reorderLevel: 4, reorderThreshold: 4, expiryDate: '', tenantId: TENANT_ID, status: 'low-stock', createdAt: daysAgo(120), updatedAt: daysAgo(5) },
    // OUT_OF_STOCK items (critical alerts)
    { id: 'inv-010', sku: 'SKU-INSULIN', name: 'Insulina NPH 100UI', quantity: 0, stockCount: 0, unit: 'Frasco', reorderLevel: 10, reorderThreshold: 10, expiryDate: '2026-03-15', tenantId: TENANT_ID, status: 'out-of-stock', createdAt: daysAgo(50), updatedAt: NOW.toISOString() },
    { id: 'inv-011', sku: 'SKU-O2-TANK', name: 'Tanque Oxígeno Portátil', quantity: 0, stockCount: 0, unit: 'Unidad', reorderLevel: 3, reorderThreshold: 3, expiryDate: '', tenantId: TENANT_ID, status: 'out-of-stock', createdAt: daysAgo(80), updatedAt: NOW.toISOString() },
    // More IN_STOCK
    { id: 'inv-012', sku: 'SKU-VENDA-ELAS', name: 'Venda Elástica 4"', quantity: 75, stockCount: 75, unit: 'Rollo', reorderLevel: 30, reorderThreshold: 30, expiryDate: '2028-12-31', tenantId: TENANT_ID, status: 'in-stock', createdAt: daysAgo(25), updatedAt: daysAgo(7) },
    { id: 'inv-013', sku: 'SKU-TERMOM', name: 'Termómetro Digital', quantity: 12, stockCount: 12, unit: 'Unidad', reorderLevel: 5, reorderThreshold: 5, expiryDate: '', tenantId: TENANT_ID, status: 'in-stock', createdAt: daysAgo(100), updatedAt: daysAgo(15) },
    { id: 'inv-014', sku: 'SKU-GLUCOM', name: 'Glucómetro', quantity: 6, stockCount: 6, unit: 'Unidad', reorderLevel: 3, reorderThreshold: 3, expiryDate: '', tenantId: TENANT_ID, status: 'in-stock', createdAt: daysAgo(70), updatedAt: daysAgo(20) },
    { id: 'inv-015', sku: 'SKU-TIRAS-GLU', name: 'Tiras Reactivas Glucosa', quantity: 300, stockCount: 300, unit: 'Unidad', reorderLevel: 100, reorderThreshold: 100, expiryDate: '2026-11-30', tenantId: TENANT_ID, status: 'in-stock', createdAt: daysAgo(15), updatedAt: daysAgo(3) }
];

// ============================================
// DEMO BILLING RECORDS (with Glosas for AI demo)
// ============================================
const DEMO_BILLING: BillingRecord[] = [
    // Paid invoices
    { 
        id: 'bill-001', 
        tenantId: TENANT_ID, 
        patientId: 'p1', 
        shiftId: 'shift-001',
        invoiceNumber: 'FAC-2026-001245',
        totalValue: 485000,
        status: 'PAID',
        radicationDate: daysAgo(15),
        createdAt: daysAgo(20),
        updatedAt: daysAgo(10)
    },
    { 
        id: 'bill-002', 
        tenantId: TENANT_ID, 
        patientId: 'p2', 
        shiftId: 'shift-002',
        invoiceNumber: 'FAC-2026-001246',
        totalValue: 620000,
        status: 'PAID',
        radicationDate: daysAgo(12),
        createdAt: daysAgo(18),
        updatedAt: daysAgo(8)
    },
    // GLOSED invoices (for AI Glosa Defender demo)
    { 
        id: 'bill-003', 
        tenantId: TENANT_ID, 
        patientId: 'p4', 
        shiftId: 'shift-003',
        invoiceNumber: 'FAC-2026-001092',
        totalValue: 1250000,
        status: 'GLOSED',
        radicationDate: daysAgo(25),
        createdAt: daysAgo(30),
        updatedAt: daysAgo(5)
    },
    { 
        id: 'bill-004', 
        tenantId: TENANT_ID, 
        patientId: 'p5', 
        shiftId: 'shift-012',
        invoiceNumber: 'FAC-2026-001089',
        totalValue: 890000,
        status: 'GLOSED',
        radicationDate: daysAgo(20),
        createdAt: daysAgo(25),
        updatedAt: daysAgo(3)
    },
    // Pending invoices
    { 
        id: 'bill-005', 
        tenantId: TENANT_ID, 
        patientId: 'p3', 
        shiftId: 'shift-004',
        invoiceNumber: 'FAC-2026-001301',
        totalValue: 520000,
        status: 'PENDING',
        createdAt: daysAgo(2),
        updatedAt: NOW.toISOString()
    },
    { 
        id: 'bill-006', 
        tenantId: TENANT_ID, 
        patientId: 'p6', 
        shiftId: 'shift-007',
        invoiceNumber: 'FAC-2026-001302',
        totalValue: 750000,
        status: 'PENDING',
        createdAt: daysAgo(1),
        updatedAt: NOW.toISOString()
    }
];

// ============================================
// DEMO VITAL SIGNS (rich history for charts)
// ============================================
const DEMO_VITALS: VitalSigns[] = [
    // Patient p1 - Roberto (Hypertension)
    { id: 'v1-001', tenantId: TENANT_ID, patientId: 'p1', date: daysAgo(1).split('T')[0], sys: 142, dia: 88, spo2: 96, hr: 75, note: 'Presión controlada con medicación', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
    { id: 'v1-002', tenantId: TENANT_ID, patientId: 'p1', date: daysAgo(3).split('T')[0], sys: 148, dia: 92, spo2: 95, hr: 78, note: 'Ligeramente elevada, aumentar dosis', createdAt: daysAgo(3), updatedAt: daysAgo(3) },
    { id: 'v1-003', tenantId: TENANT_ID, patientId: 'p1', date: daysAgo(7).split('T')[0], sys: 155, dia: 95, spo2: 94, hr: 82, note: 'Pico de presión, paciente ansioso', createdAt: daysAgo(7), updatedAt: daysAgo(7) },
    { id: 'v1-004', tenantId: TENANT_ID, patientId: 'p1', date: daysAgo(14).split('T')[0], sys: 140, dia: 85, spo2: 97, hr: 72, note: 'Valores estables', createdAt: daysAgo(14), updatedAt: daysAgo(14) },
    // Patient p4 - María Teresa (EPOC)
    { id: 'v4-001', tenantId: TENANT_ID, patientId: 'p4', date: daysAgo(2).split('T')[0], sys: 125, dia: 78, spo2: 88, hr: 85, note: 'SpO2 baja, requiere oxígeno suplementario', createdAt: daysAgo(2), updatedAt: daysAgo(2) },
    { id: 'v4-002', tenantId: TENANT_ID, patientId: 'p4', date: daysAgo(5).split('T')[0], sys: 128, dia: 80, spo2: 85, hr: 88, note: 'Exacerbación leve, ajustar oxigenoterapia', createdAt: daysAgo(5), updatedAt: daysAgo(5) },
    { id: 'v4-003', tenantId: TENANT_ID, patientId: 'p4', date: daysAgo(10).split('T')[0], sys: 122, dia: 75, spo2: 91, hr: 80, note: 'Mejorando con tratamiento', createdAt: daysAgo(10), updatedAt: daysAgo(10) },
    // Patient p2 - Ana María (Diabetes)
    { id: 'v2-001', tenantId: TENANT_ID, patientId: 'p2', date: daysAgo(1).split('T')[0], sys: 130, dia: 82, spo2: 97, hr: 70, note: 'Glucosa en ayunas: 125 mg/dL', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
    { id: 'v2-002', tenantId: TENANT_ID, patientId: 'p2', date: daysAgo(4).split('T')[0], sys: 128, dia: 80, spo2: 98, hr: 68, note: 'Glucosa en ayunas: 118 mg/dL - Buen control', createdAt: daysAgo(4), updatedAt: daysAgo(4) },
];

// ============================================
// DEMO VISITS (for Pending Reviews panel)
// ============================================
const DEMO_VISITS: Visit[] = [
    {
        id: 'visit-001',
        shiftId: 'shift-001',
        patientId: 'p1',
        nurseId: 'n1',
        tenantId: TENANT_ID,
        status: 'SUBMITTED',
        kardex: {
            generalObservations: 'Paciente estable, sin signos de alarma. Se realizó curación de herida en pierna derecha.',
            skinCondition: 'Herida en proceso de cicatrización, sin signos de infección',
            mobilityStatus: 'Deambula con apoyo',
            nutritionIntake: 'Dieta blanda tolerada',
        },
        vitalsRecorded: { sys: 128, dia: 82, spo2: 96, hr: 72, temperature: 36.5 },
        medicationsAdministered: [
            { medicationName: 'Losartán 50mg', intendedDosage: '50mg', dosageGiven: '50mg', time: '08:00', notes: '' },
            { medicationName: 'Aspirina 100mg', intendedDosage: '100mg', dosageGiven: '100mg', time: '08:00', notes: '' }
        ],
        tasksCompleted: [
            { taskDescription: 'Curación de herida', completedAt: daysAgo(1), notes: 'Realizado sin complicaciones' },
            { taskDescription: 'Toma de signos vitales', completedAt: daysAgo(1), notes: '' }
        ],
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1)
    },
    {
        id: 'visit-002',
        shiftId: 'shift-003',
        patientId: 'p2',
        nurseId: 'n2',
        tenantId: TENANT_ID,
        status: 'SUBMITTED',
        kardex: {
            generalObservations: 'Paciente con glicemia controlada. Se refuerza educación sobre dieta.',
            skinCondition: 'Sin lesiones',
            mobilityStatus: 'Independiente',
            nutritionIntake: 'Sigue dieta para diabéticos',
        },
        vitalsRecorded: { sys: 135, dia: 88, spo2: 97, hr: 78, temperature: 36.8 },
        medicationsAdministered: [
            { medicationName: 'Metformina 850mg', intendedDosage: '850mg', dosageGiven: '850mg', time: '07:30', notes: '' }
        ],
        tasksCompleted: [
            { taskDescription: 'Control de glicemia', completedAt: daysAgo(0), notes: 'Resultado: 110 mg/dL' },
            { taskDescription: 'Educación nutricional', completedAt: daysAgo(0), notes: '' }
        ],
        createdAt: daysAgo(0),
        updatedAt: daysAgo(0)
    },
    {
        id: 'visit-003',
        shiftId: 'shift-005',
        patientId: 'p3',
        nurseId: 'n1',
        tenantId: TENANT_ID,
        status: 'APPROVED',
        kardex: {
            generalObservations: 'Visita de seguimiento. Paciente sin novedades.',
            skinCondition: 'Normal',
            mobilityStatus: 'Limitada por osteoporosis',
            nutritionIntake: 'Adecuada',
        },
        vitalsRecorded: { sys: 118, dia: 75, spo2: 98, hr: 68, temperature: 36.2 },
        medicationsAdministered: [
            { medicationName: 'Calcio + Vitamina D', intendedDosage: '600mg', dosageGiven: '600mg', time: '09:00', notes: '' }
        ],
        tasksCompleted: [
            { taskDescription: 'Evaluación de movilidad', completedAt: daysAgo(3), notes: '' },
            { taskDescription: 'Administración de suplementos', completedAt: daysAgo(3), notes: '' }
        ],
        createdAt: daysAgo(3),
        updatedAt: daysAgo(2)
    },
    // SHOWCASE VISIT - Rich clinical documentation example (for demo)
    {
        id: 'visit-showcase',
        shiftId: 'shift-012',
        patientId: 'p5',
        nurseId: 'nurse-maria',
        tenantId: TENANT_ID,
        status: 'APPROVED',
        approvedAt: daysAgo(3),
        approvedBy: 'Dr. Alejandra Mendez',
        submittedAt: daysAgo(4),
        kardex: {
            generalObservations: 'Paciente de 85 años con cardiopatía isquémica crónica. Se encuentra hemodinámicamente estable durante la visita. Refiere mejoría en tolerancia al ejercicio desde ajuste de medicación hace 2 semanas. Sin disnea en reposo. Edema de miembros inferiores grado I, controlado con diurético.',
            skinCondition: 'Piel íntegra, hidratada. Sin úlceras por presión. Leve edema pretibial bilateral.',
            mobilityStatus: 'Deambula con bastón dentro del hogar. Sube escaleras con pausas. Se recomienda continuar programa de rehabilitación cardíaca.',
            nutritionIntake: 'Dieta hiposódica cumplida. Ingesta hídrica 1.5L/día. Apetito conservado.',
            painLevel: 2,
            mentalStatus: 'Alerta, orientado en tiempo, espacio y persona. Ánimo estable.',
            environmentalSafety: 'Hogar adaptado con barras de apoyo en baño. Buena iluminación. Sin riesgos de caída identificados.',
            caregiverSupport: 'Esposa presente 24/7. Hija visita diariamente. Red de apoyo familiar sólida.',
            internalNotes: 'Considerar solicitar ecocardiograma de control en próxima cita con cardiología. Paciente candidato a programa de telemonitoreo.'
        },
        vitalsRecorded: { 
            sys: 132, 
            dia: 78, 
            spo2: 95, 
            hr: 68, 
            temperature: 36.4,
            weight: 72.5
        },
        medicationsAdministered: [
            { medicationName: 'Carvedilol 12.5mg', intendedDosage: '12.5mg', dosageGiven: '12.5mg', time: '08:00', route: 'Oral', notes: 'Tomado con alimentos' },
            { medicationName: 'Furosemida 40mg', intendedDosage: '40mg', dosageGiven: '40mg', time: '08:00', route: 'Oral', notes: '' },
            { medicationName: 'Atorvastatina 20mg', intendedDosage: '20mg', dosageGiven: '20mg', time: '20:00', route: 'Oral', notes: 'Dosis nocturna - verificada adherencia' },
            { medicationName: 'Aspirina 100mg', intendedDosage: '100mg', dosageGiven: '100mg', time: '08:00', route: 'Oral', notes: '' },
            { medicationName: 'Enalapril 10mg', intendedDosage: '10mg', dosageGiven: '10mg', time: '08:00', route: 'Oral', notes: '' }
        ],
        tasksCompleted: [
            { taskDescription: 'Toma completa de signos vitales', completedAt: daysAgo(4), notes: 'TA controlada, FC regular' },
            { taskDescription: 'Administración de medicamentos AM', completedAt: daysAgo(4), notes: '5 medicamentos según prescripción' },
            { taskDescription: 'Evaluación de edema periférico', completedAt: daysAgo(4), notes: 'Grado I, mejorado vs visita anterior' },
            { taskDescription: 'Educación sobre signos de alarma', completedAt: daysAgo(4), notes: 'Reforzada con paciente y cuidadora' },
            { taskDescription: 'Verificación de adherencia terapéutica', completedAt: daysAgo(4), notes: 'Pastillero organizado correctamente' },
            { taskDescription: 'Coordinación con cardiología', completedAt: daysAgo(4), notes: 'Próxima cita: 15 Feb 2026' }
        ],
        createdAt: daysAgo(4),
        updatedAt: daysAgo(3)
    }
];

// ============================================
// DEMO AUDIT LOGS (for Clinical Audit panel)
// ============================================
const DEMO_AUDIT_LOGS: AuditLog[] = [
    { id: 'audit-001', tenantId: TENANT_ID, action: 'VISIT_SUBMITTED', entityType: 'Visit', entityId: 'visit-001', userId: 'n1', details: JSON.stringify({ userName: 'María Rodríguez', message: 'Visita documentada para Roberto Gómez' }), createdAt: daysAgo(1), updatedAt: daysAgo(1) },
    { id: 'audit-002', tenantId: TENANT_ID, action: 'VISIT_APPROVED', entityType: 'Visit', entityId: 'visit-003', userId: 'admin', details: JSON.stringify({ userName: 'Dr. Alejandra Mendez', message: 'Visita aprobada para Pedro Sánchez' }), createdAt: daysAgo(2), updatedAt: daysAgo(2) },
    { id: 'audit-003', tenantId: TENANT_ID, action: 'SHIFT_CREATED', entityType: 'Shift', entityId: 'shift-001', userId: 'admin', details: JSON.stringify({ userName: 'Dr. Alejandra Mendez', message: 'Turno programado: María Rodríguez → Roberto Gómez' }), createdAt: daysAgo(5), updatedAt: daysAgo(5) },
    { id: 'audit-004', tenantId: TENANT_ID, action: 'INVENTORY_LOW_STOCK', entityType: 'InventoryItem', entityId: 'inv-006', userId: 'system', details: JSON.stringify({ userName: 'Sistema', message: 'Alerta: Jeringa 5ml bajo stock (25 unidades)' }), createdAt: daysAgo(1), updatedAt: daysAgo(1) },
    { id: 'audit-005', tenantId: TENANT_ID, action: 'PATIENT_UPDATED', entityType: 'Patient', entityId: 'p1', userId: 'admin', details: JSON.stringify({ userName: 'Dr. Alejandra Mendez', message: 'Actualización de medicamentos para Roberto Gómez' }), createdAt: daysAgo(3), updatedAt: daysAgo(3) },
    { id: 'audit-006', tenantId: TENANT_ID, action: 'VISIT_SUBMITTED', entityType: 'Visit', entityId: 'visit-002', userId: 'n2', details: JSON.stringify({ userName: 'Carlos Méndez', message: 'Visita documentada para Ana María Martínez' }), createdAt: daysAgo(0), updatedAt: daysAgo(0) },
    { id: 'audit-007', tenantId: TENANT_ID, action: 'BILLING_GENERATED', entityType: 'BillingRecord', entityId: 'bill-001', userId: 'admin', details: JSON.stringify({ userName: 'Dr. Alejandra Mendez', message: 'Factura generada: $450,000 COP' }), createdAt: daysAgo(7), updatedAt: daysAgo(7) },
    { id: 'audit-008', tenantId: TENANT_ID, action: 'NURSE_ASSIGNED', entityType: 'Shift', entityId: 'shift-008', userId: 'admin', details: JSON.stringify({ userName: 'Dr. Alejandra Mendez', message: 'Asignación: Carlos Méndez → María García' }), createdAt: daysAgo(2), updatedAt: daysAgo(2) }
];

// ============================================
// DEMO NOTIFICATIONS
// ============================================
const DEMO_NOTIFICATIONS: NotificationItem[] = [
    { id: 'notif-001', userId: 'admin', type: 'VISIT_PENDING_REVIEW', message: 'Nueva visita de María Rodríguez pendiente de aprobación', entityId: 'shift-001', entityType: 'Visit', read: false, createdAt: daysAgo(1) },
    { id: 'notif-002', userId: 'admin', type: 'VISIT_PENDING_REVIEW', message: '3 turnos sin asignar para mañana', entityId: 'shift-008', entityType: 'Shift', read: false, createdAt: NOW.toISOString() },
    { id: 'notif-003', userId: 'nurse-maria', type: 'VISIT_APPROVED', message: 'Su visita ha sido aprobada: Jorge Luis Borges', entityId: 'shift-005', entityType: 'Shift', read: true, createdAt: daysAgo(1) }
];

// ============================================
// DEMO MEDICATIONS
// ============================================
const DEMO_MEDICATIONS: Medication[] = [
    { id: 'm1-001', patientId: 'p1', name: 'Losartán', dosage: '50mg', frequency: 'Cada 12 horas', status: 'ACTIVE' },
    { id: 'm1-002', patientId: 'p1', name: 'Amlodipino', dosage: '5mg', frequency: 'Una vez al día', status: 'ACTIVE' },
    { id: 'm2-001', patientId: 'p2', name: 'Metformina', dosage: '850mg', frequency: 'Con cada comida', status: 'ACTIVE' },
    { id: 'm2-002', patientId: 'p2', name: 'Glibenclamida', dosage: '5mg', frequency: 'Antes del desayuno', status: 'ACTIVE' },
    { id: 'm4-001', patientId: 'p4', name: 'Salbutamol Inhalador', dosage: '100mcg', frequency: 'Cada 6 horas PRN', status: 'ACTIVE' },
    { id: 'm4-002', patientId: 'p4', name: 'Budesonida', dosage: '200mcg', frequency: 'Dos veces al día', status: 'ACTIVE' }
];

// ============================================
// DEMO TASKS
// ============================================
const DEMO_TASKS: Task[] = [
    { id: 't1-001', patientId: 'p1', description: 'Control de presión arterial', completed: false, dueDate: NOW.toISOString() },
    { id: 't1-002', patientId: 'p1', description: 'Verificar adherencia a medicamentos', completed: true, dueDate: daysAgo(1) },
    { id: 't2-001', patientId: 'p2', description: 'Medición de glucosa capilar', completed: false, dueDate: NOW.toISOString() },
    { id: 't2-002', patientId: 'p2', description: 'Revisión de pies diabéticos', completed: false, dueDate: daysFromNow(7) },
    { id: 't4-001', patientId: 'p4', description: 'Verificar saturación de oxígeno', completed: false, dueDate: NOW.toISOString() },
    { id: 't4-002', patientId: 'p4', description: 'Revisar técnica de inhaladores', completed: false, dueDate: daysFromNow(3) }
];

// ============================================
// INITIALIZE STORE WITH DEMO DATA
// ============================================
const STORE: StoreType = {
    Shift: [...DEMO_SHIFTS],
    Nurse: [...DEMO_NURSES],
    InventoryItem: [...DEMO_INVENTORY],
    Patient: [...DEMO_PATIENTS],
    Medication: [...DEMO_MEDICATIONS],
    Task: [...DEMO_TASKS],
    VitalSigns: [...DEMO_VITALS],
    Visit: [...DEMO_VISITS],
    AuditLog: [...DEMO_AUDIT_LOGS],
    BillingRecord: [...DEMO_BILLING],
    Notification: [...DEMO_NOTIFICATIONS]
};

// Properly type LISTENERS using a generic function type or unknown
type ListenerCallback<T> = (data: { items: T[] }) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LISTENERS: Record<string, ListenerCallback<any>[]> = {
    Shift: [],
    Nurse: [],
    InventoryItem: [],
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
        InventoryItem: MockModelClient<InventoryItem>;
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
        validateRIPS: (args: { billingRecordId: string }) => Promise<{ data: string; errors?: Error[] }>;
        generateGlosaDefense: (args: { billingRecord: string; patientHistory: string; clinicalNotes: string }) => Promise<{ data: string; errors?: Error[] }>;
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
                // Simulate async initial load
                setTimeout(() => next({ items: STORE[model] as T[] }), 100);
                return { unsubscribe: () => { /* No-op */ } };
            }
        }),
        list: async (args) => {
            // Simulate network delay for realistic demo
            await new Promise(r => setTimeout(r, 300));
            
            let items = [...(STORE[model] as T[])];
            if (args?.filter) {
                // Simplified mock filter: handles eq for common fields
                if (args.filter.status?.eq) items = items.filter((i: any) => i.status === args.filter.status.eq);
                if (args.filter.tenantId?.eq) items = items.filter((i: any) => i.tenantId === args.filter.tenantId.eq);
                if (args.filter.patientId?.eq) items = items.filter((i: any) => i.patientId === args.filter.patientId.eq);
                if (args.filter.nurseId?.eq) items = items.filter((i: any) => i.nurseId === args.filter.nurseId.eq);
            }
            const limit = args?.limit || 50;
            const start = args?.nextToken ? parseInt(args.nextToken) : 0;
            const paginated = items.slice(start, start + limit);
            const nextToken = start + limit < items.length ? (start + limit).toString() : null;
            return { data: paginated, nextToken };
        },
        get: async ({ id }) => {
            await new Promise(r => setTimeout(r, 150));
            const item = (STORE[model] as T[]).find(i => i.id === id);
            return { data: item || null };
        },
        create: async (item: Partial<T>) => {
            await new Promise(r => setTimeout(r, 300));
            const modelName = String(model).toLowerCase();
            const newItem = { 
                ...item, 
                id: item.id || `${modelName}-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as unknown as T;
            (STORE[model] as T[]).push(newItem);
            notify<T>(model);
            return { data: newItem };
        },
        update: async (item: Partial<T>) => {
            await new Promise(r => setTimeout(r, 300));
            const list = STORE[model] as T[];
            const index = list.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                list[index] = { ...list[index], ...item, updatedAt: new Date().toISOString() };
                notify<T>(model);
                return { data: list[index] };
            }
            return { data: item as T };
        },
        delete: async (item: { id: string }) => {
            await new Promise(r => setTimeout(r, 200));
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
            InventoryItem: createModelHandlers<InventoryItem>('InventoryItem'),
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
            // AI Roster Generation (simulates Bedrock Claude)
            generateRoster: async (args: { nurses: string; unassignedShifts: string }) => {
                const nurses = JSON.parse(args.nurses) as Nurse[];
                const shifts = JSON.parse(args.unassignedShifts) as Shift[];

                // Simulate AI processing time
                await new Promise(r => setTimeout(r, 2500));

                // Smart matching logic: Match by skill overlap and minimize travel
                const assignments = shifts.map((s) => {
                    // Find nurse with matching skill
                    const matchingNurses = nurses.filter((n) =>
                        n.skills?.some((sk: string) => 
                            sk.toLowerCase().includes(s.requiredSkill?.toLowerCase() || '') ||
                            s.requiredSkill?.toLowerCase().includes(sk.toLowerCase())
                        )
                    );
                    
                    // Pick first available or random from matches
                    const nurse = matchingNurses.length > 0 
                        ? matchingNurses[Math.floor(Math.random() * matchingNurses.length)]
                        : nurses[Math.floor(Math.random() * nurses.length)];
                    
                    return {
                        shiftId: s.id,
                        nurseId: nurse ? nurse.id : 'UNASSIGNED',
                        nurseName: nurse ? nurse.name : undefined,
                        reason: nurse ? `Skill match: ${s.requiredSkill}` : 'No match found'
                    };
                });

                return {
                    data: JSON.stringify({ 
                        assignments,
                        optimizationScore: 0.87,
                        totalTravelTime: '2h 15min',
                        generatedAt: new Date().toISOString()
                    })
                };
            },

            // RIPS Validation (simulates compliance check)
            validateRIPS: async (args: { billingRecordId: string }) => {
                // Find the billing record from the store
                const record = (STORE.BillingRecord as BillingRecord[]).find(
                    b => b.id === args.billingRecordId
                );
                
                // Simulate validation processing
                await new Promise(r => setTimeout(r, 1800));
                
                // Mock validation with realistic errors
                const errors: { field: string; message: string }[] = [];
                const warnings: string[] = [];
                
                if (!record) {
                    errors.push({ field: 'billingRecordId', message: 'Registro de facturación no encontrado' });
                } else {
                    if (record.totalValue <= 0) {
                        errors.push({ field: 'totalValue', message: 'Valor total debe ser mayor a cero' });
                    }
                    if (!record.invoiceNumber) {
                        errors.push({ field: 'invoiceNumber', message: 'Número de factura requerido' });
                    }
                }
                
                // Random warnings for demo
                if (Math.random() > 0.5) {
                    warnings.push('Se recomienda adjuntar orden médica para procedimientos especializados');
                }
                
                return {
                    data: JSON.stringify({
                        isValid: errors.length === 0,
                        errors,
                        warnings,
                        validatedAt: new Date().toISOString(),
                        resolution: 'Resolución 2275 de 2023',
                        billingRecordId: args.billingRecordId
                    })
                };
            },

            // AI Glosa Defense Letter Generation (simulates Bedrock Claude)
            generateGlosaDefense: async (args: { billingRecord: string; patientHistory: string; clinicalNotes: string }) => {
                const record = JSON.parse(args.billingRecord);
                const history = JSON.parse(args.patientHistory);
                
                // Simulate AI generation time
                await new Promise(r => setTimeout(r, 3000));
                
                const defenseText = `**CARTA DE CONTESTACIÓN DE GLOSA**

**Ref:** Factura ${record.invoiceNumber || 'N/A'}
**Fecha:** ${new Date().toLocaleDateString('es-CO')}
**EPS:** ${record.eps || 'N/A'}

Respetados señores,

En respuesta a la glosa presentada sobre la factura en referencia, nos permitimos presentar los siguientes argumentos de defensa:

**1. FUNDAMENTACIÓN CLÍNICA**

El paciente ${history.name || 'N/A'} (${history.age || 'N/A'} años) presenta diagnóstico de ${record.diagnosis || 'N/A'}, condición que requiere atención domiciliaria especializada según lo establecido en la Resolución 3100 de 2019.

**2. EVIDENCIA DE NECESIDAD MÉDICA**

Los registros de signos vitales demuestran la necesidad del servicio prestado:
${history.vitalSigns?.map((v: any) => `- ${v.date}: TA ${v.sys}/${v.dia}, SpO2 ${v.spo2}%, FC ${v.hr}`).join('\n') || '- Registros adjuntos en historia clínica'}

**3. MARCO NORMATIVO**

Conforme a la Ley 100 de 1993 y sus decretos reglamentarios, los servicios de atención domiciliaria están cubiertos cuando existe indicación médica debidamente soportada, como es el caso presente.

**4. PROCEDIMIENTOS REALIZADOS**

${record.procedures?.map((p: string) => `- CUPS ${p}: Procedimiento médicamente necesario`).join('\n') || '- Procedimientos según plan de manejo'}

**SOLICITUD**

Por lo anterior, solicitamos respetuosamente la revisión y aprobación de la factura por valor de $${(record.totalValue || 0).toLocaleString('es-CO')} COP.

Atentamente,

**IPS Vida en Casa S.A.S**
Departamento de Facturación y Glosas
NIT: 900.123.456-1`;

                return {
                    data: JSON.stringify({
                        success: true,
                        defenseLetter: defenseText,
                        generatedAt: new Date().toISOString(),
                        model: 'claude-3-5-sonnet-20241022',
                        confidence: 0.92,
                        citedRegulations: ['Resolución 3100', 'Ley 100', 'Resolución 2275']
                    })
                };
            },

            listApprovedVisitSummariesForFamily: async (args: { patientId: string }) => {
                await new Promise(r => setTimeout(r, 500));
                const visits = (STORE.Visit as Visit[]).filter(v => v.patientId === args.patientId && v.status === 'APPROVED');
                return { data: JSON.stringify({ visits }) };
            }
        },
        mutations: {
            createVisitDraftFromShift: async (args: { shiftId: string }) => {
                const { shiftId } = args;
                const shift = (STORE.Shift as Shift[]).find(s => s.id === shiftId);

                if (!shift) {
                    return { data: JSON.stringify({ error: 'Shift not found' }), errors: [new Error('Shift not found')] };
                }

                const existingVisit = (STORE.Visit as Visit[]).find(v => v.shiftId === shiftId);
                if (existingVisit) {
                    return { data: JSON.stringify({ visit: existingVisit }) };
                }

                const now = new Date().toISOString();
                const newVisit: Visit = {
                    id: shiftId,
                    tenantId: shift.tenantId || TENANT_ID,
                    shiftId: shiftId,
                    patientId: shift.patientId || '',
                    nurseId: shift.nurseId || '',
                    status: 'DRAFT',
                    kardex: { generalObservations: '' },
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
                visits[visitIndex] = { ...visit, status: 'SUBMITTED', submittedAt: now, updatedAt: now };

                const notification: NotificationItem = {
                    id: `notif-${Date.now()}`,
                    userId: 'admin',
                    type: 'VISIT_PENDING_REVIEW',
                    message: `Nueva visita pendiente de revisión`,
                    entityId: shiftId,
                    entityType: 'Visit',
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
                    approvedBy: 'demo-admin',
                    reviewedAt: now,
                    reviewedBy: 'demo-admin',
                    updatedAt: now
                };

                const notification: NotificationItem = {
                    id: `notif-${Date.now()}`,
                    userId: visit.nurseId,
                    type: 'VISIT_APPROVED',
                    message: `Su visita ha sido aprobada`,
                    entityId: shiftId,
                    entityType: 'Visit',
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
                    reviewedBy: 'demo-admin',
                    updatedAt: now
                };

                const notification: NotificationItem = {
                    id: `notif-${Date.now()}`,
                    userId: visit.nurseId,
                    type: 'VISIT_REJECTED',
                    message: `Su visita ha sido rechazada: ${reason}`,
                    entityId: shiftId,
                    entityType: 'Visit',
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

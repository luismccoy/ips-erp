// Basic Mock Data moved from App.tsx
import type { Tenant } from '../types';

export const TENANTS: Tenant[] = [
    { id: 'ips-vida', name: 'IPS Vida en Casa S.A.S', nit: '900.123.456-1' }
];

export const PATIENTS = [
    { id: 'p1', name: 'Roberto Gomez', address: 'Calle 100 #15-20', diagnosis: 'I10 - Hipertensión', eps: 'Sanitas', riskLevel: 'High' },
    { id: 'p2', name: 'Ana Martinez', address: 'Carrera 7 #80-45', diagnosis: 'E11 - Diabetes', eps: 'Sura', riskLevel: 'Medium' }
];

export const SHIFTS = [
    { id: 's1', patientId: 'p1', nurseId: 'n1', date: '2026-01-21', startTime: '07:00', status: 'Pending' },
    { id: 's2', patientId: 'p2', nurseId: 'n2', date: '2026-01-21', startTime: '14:00', status: 'Completed' }
];

export const NURSES = [
    { id: 'n1', name: 'Maria Gonzalez', role: 'NURSE', locationLat: 4.6097, locationLng: -74.0817 },
    { id: 'n2', name: 'Carlos Rodriguez', role: 'NURSE', locationLat: 4.6200, locationLng: -74.0900 }
];

export const INVENTORY = [
    { id: 'i1', name: 'Jeringa 5cc', quantity: 45, reorderThreshold: 20, unit: 'Unidad' },
    { id: 'i2', name: 'Guantes Nitrilo', quantity: 120, reorderThreshold: 50, unit: 'Par' },
    { id: 'i3', name: 'Gasa Estéril', quantity: 12, reorderThreshold: 30, unit: 'Paquete' }
];

export const VITALS_HISTORY = [
    { patientId: 'p1', date: '2026-01-20', sys: 145, dia: 90, spo2: 95, hr: 78, note: 'Paciente estable con medicación ajustada' },
    { patientId: 'p1', date: '2026-01-18', sys: 150, dia: 95, spo2: 94, hr: 82, note: 'Presión arterial ligeramente elevada' },
    { patientId: 'p2', date: '2026-01-20', sys: 125, dia: 80, spo2: 97, hr: 72, note: 'Niveles de glucosa controlados' }
];

export function getMockDataForTenant(tenantId: string) {
    // Currently we only have one tenant in this simplified mock
    console.log('Getting mock data for tenant:', tenantId);
    return {
        patients: PATIENTS,
        shifts: SHIFTS,
        inventory: INVENTORY,
        vitals: VITALS_HISTORY
    };
}

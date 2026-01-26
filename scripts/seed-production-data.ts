/**
 * Production Data Seed Script
 * 
 * Run with: npx ts-node scripts/seed-production-data.ts
 * Requires: AWS credentials with DynamoDB access
 * 
 * Creates realistic test data for both tenants to enable full workflow testing.
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);
const client = generateClient<Schema>();

// ============================================
// TENANT 1: Clínica Vida en Casa (tenant-vida-01)
// ============================================

const TENANT_VIDA = {
    id: 'tenant-vida-01',
    
    // Nurses (linked to Cognito users)
    nurses: [
        {
            id: 'nurse-vida-maria',
            name: 'María Rodríguez',
            email: 'maria.nurse@clinica-vida.com',
            role: 'NURSE' as const,
            skills: ['Wound Care', 'IV Therapy', 'Vital Signs'],
            cognitoSub: 'maria-nurse-sub-placeholder', // Will be updated with real sub
            isActive: true,
            locationLat: 4.6097,
            locationLng: -74.0817,
        },
        {
            id: 'nurse-vida-carlos',
            name: 'Carlos Méndez',
            email: 'carlos.nurse@clinica-vida.com',
            role: 'NURSE' as const,
            skills: ['Elderly Care', 'Medication Admin', 'Physical Therapy'],
            cognitoSub: 'carlos-nurse-sub-placeholder',
            isActive: true,
            locationLat: 4.6200,
            locationLng: -74.0900,
        },
    ],
    
    // Patients
    patients: [
        {
            id: 'patient-vida-roberto',
            name: 'Roberto Gómez Hernández',
            documentId: '1020304050',
            age: 78,
            address: 'Calle 100 #15-20, Apt 501, Bogotá',
            eps: 'Sanitas',
            diagnosis: 'I10 - Hipertensión Esencial',
            medications: [
                { id: 'med-1', name: 'Losartán', dosage: '50mg', frequency: 'Cada 12 horas', prescribedBy: 'Dr. García', status: 'ACTIVE' },
                { id: 'med-2', name: 'Aspirina', dosage: '100mg', frequency: 'Diario', prescribedBy: 'Dr. García', status: 'ACTIVE' },
            ],
            familyAccessCode: '1234',
        },
        {
            id: 'patient-vida-ana',
            name: 'Ana María Martínez López',
            documentId: '1030405060',
            age: 65,
            address: 'Carrera 7 #80-45, Bogotá',
            eps: 'Sura',
            diagnosis: 'E11 - Diabetes Mellitus Tipo 2',
            medications: [
                { id: 'med-3', name: 'Metformina', dosage: '850mg', frequency: 'Con comidas', prescribedBy: 'Dr. Rodríguez', status: 'ACTIVE' },
                { id: 'med-4', name: 'Glibenclamida', dosage: '5mg', frequency: 'Antes del desayuno', prescribedBy: 'Dr. Rodríguez', status: 'ACTIVE' },
            ],
            familyAccessCode: '5678',
        },
        {
            id: 'patient-vida-pedro',
            name: 'Pedro Sánchez Vargas',
            documentId: '1040506070',
            age: 82,
            address: 'Avenida 19 #120-30, Bogotá',
            eps: 'Nueva EPS',
            diagnosis: 'M81.0 - Osteoporosis',
            medications: [
                { id: 'med-5', name: 'Calcio + Vitamina D', dosage: '600mg/400UI', frequency: 'Diario', prescribedBy: 'Dr. López', status: 'ACTIVE' },
            ],
            familyAccessCode: '9012',
        },
    ],
    
    // Inventory Items
    inventory: [
        { id: 'inv-vida-1', name: 'Jeringa 5cc', sku: 'JER-5CC', quantity: 150, unit: 'Unidad', reorderLevel: 50, status: 'IN_STOCK' },
        { id: 'inv-vida-2', name: 'Guantes Látex (Caja)', sku: 'GUA-LAT', quantity: 25, unit: 'Caja', reorderLevel: 10, status: 'IN_STOCK' },
        { id: 'inv-vida-3', name: 'Alcohol 70%', sku: 'ALC-70', quantity: 8, unit: 'Litro', reorderLevel: 15, status: 'LOW_STOCK' },
        { id: 'inv-vida-4', name: 'Gasas Estériles', sku: 'GAS-EST', quantity: 200, unit: 'Paquete', reorderLevel: 50, status: 'IN_STOCK' },
        { id: 'inv-vida-5', name: 'Tensiómetro Digital', sku: 'TEN-DIG', quantity: 3, unit: 'Unidad', reorderLevel: 2, status: 'IN_STOCK' },
        { id: 'inv-vida-6', name: 'Glucómetro', sku: 'GLU-001', quantity: 2, unit: 'Unidad', reorderLevel: 2, status: 'IN_STOCK' },
        { id: 'inv-vida-7', name: 'Tiras Reactivas Glucosa', sku: 'TIR-GLU', quantity: 5, unit: 'Caja (50 tiras)', reorderLevel: 10, status: 'LOW_STOCK' },
    ],
};

// ============================================
// TENANT 2: IPS Salud Integral (tenant-salud-01)
// ============================================

const TENANT_SALUD = {
    id: 'tenant-salud-01',
    
    nurses: [
        {
            id: 'nurse-salud-lucia',
            name: 'Lucía Fernández',
            email: 'lucia@ips-salud.com',
            role: 'NURSE' as const,
            skills: ['Pediatric Care', 'Wound Care', 'Injections'],
            cognitoSub: 'lucia-nurse-sub-placeholder',
            isActive: true,
            locationLat: 6.2442,
            locationLng: -75.5812, // Medellín
        },
    ],
    
    patients: [
        {
            id: 'patient-salud-jorge',
            name: 'Jorge Ramírez',
            documentId: '2020304050',
            age: 70,
            address: 'Carrera 43A #1-50, Medellín',
            eps: 'Coomeva',
            diagnosis: 'J45 - Asma',
            medications: [
                { id: 'med-s1', name: 'Salbutamol Inhalador', dosage: '100mcg', frequency: 'Según necesidad', prescribedBy: 'Dr. Ramírez', status: 'ACTIVE' },
            ],
            familyAccessCode: '3456',
        },
    ],
    
    inventory: [
        { id: 'inv-salud-1', name: 'Jeringa 10cc', sku: 'JER-10CC', quantity: 80, unit: 'Unidad', reorderLevel: 30, status: 'IN_STOCK' },
        { id: 'inv-salud-2', name: 'Oxímetro de Pulso', sku: 'OXI-PUL', quantity: 2, unit: 'Unidad', reorderLevel: 1, status: 'IN_STOCK' },
    ],
};

// ============================================
// SHIFTS (Schedule for next 7 days)
// ============================================

function generateShifts(tenantId: string, nurses: any[], patients: any[]): any[] {
    const shifts = [];
    const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const today = new Date();
    
    // Create shifts for the next 7 days
    for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() + day);
        const dateStr = date.toISOString().split('T')[0];
        
        // Morning shift
        shifts.push({
            id: `shift-${tenantId}-${day}-am`,
            tenantId,
            nurseId: nurses[0].id,
            patientId: patients[0].id,
            scheduledTime: `${dateStr}T08:00:00.000Z`,
            status: day < 2 ? 'COMPLETED' : day === 2 ? 'IN_PROGRESS' : 'PENDING',
        });
        
        // Afternoon shift (if multiple patients)
        if (patients.length > 1) {
            shifts.push({
                id: `shift-${tenantId}-${day}-pm`,
                tenantId,
                nurseId: nurses[nurses.length > 1 ? 1 : 0].id,
                patientId: patients[1].id,
                scheduledTime: `${dateStr}T14:00:00.000Z`,
                status: day < 2 ? 'COMPLETED' : 'PENDING',
            });
        }
    }
    
    return shifts;
}

// ============================================
// BILLING RECORDS
// ============================================

function generateBillingRecords(tenantId: string, patients: any[]): any[] {
    const records = [];
    const today = new Date();
    
    patients.forEach((patient, idx) => {
        // Create a billing record for each patient
        const recordDate = new Date(today);
        recordDate.setDate(recordDate.getDate() - (idx * 7)); // Stagger dates
        
        records.push({
            id: `billing-${tenantId}-${patient.id}`,
            tenantId,
            patientId: patient.id,
            invoiceNumber: `INV-${Date.now()}-${idx}`,
            totalValue: 150000 + (idx * 50000), // COP
            status: idx === 0 ? 'PENDING' : 'SUBMITTED',
            date: recordDate.toISOString().split('T')[0],
            procedures: ['890201', '890301'], // CUPS codes
            diagnosis: patient.diagnosis.split(' - ')[0], // ICD-10 code
            eps: patient.eps,
            ripsGenerated: idx > 0,
        });
    });
    
    return records;
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedTenant(tenantData: typeof TENANT_VIDA) {
    console.log(`\n🌱 Seeding tenant: ${tenantData.id}`);
    
    // 1. Seed Nurses
    console.log('  📋 Creating nurses...');
    for (const nurse of tenantData.nurses) {
        try {
            await client.models.Nurse.create({
                ...nurse,
                tenantId: tenantData.id,
            });
            console.log(`    ✅ Nurse: ${nurse.name}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`    ⏭️  Nurse exists: ${nurse.name}`);
            } else {
                console.log(`    ❌ Error: ${e.message}`);
            }
        }
    }
    
    // 2. Seed Patients
    console.log('  🏥 Creating patients...');
    for (const patient of tenantData.patients) {
        try {
            await client.models.Patient.create({
                ...patient,
                tenantId: tenantData.id,
            });
            console.log(`    ✅ Patient: ${patient.name}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`    ⏭️  Patient exists: ${patient.name}`);
            } else {
                console.log(`    ❌ Error: ${e.message}`);
            }
        }
    }
    
    // 3. Seed Inventory
    console.log('  📦 Creating inventory...');
    for (const item of tenantData.inventory) {
        try {
            await client.models.InventoryItem.create({
                ...item,
                tenantId: tenantData.id,
            });
            console.log(`    ✅ Item: ${item.name}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`    ⏭️  Item exists: ${item.name}`);
            } else {
                console.log(`    ❌ Error: ${e.message}`);
            }
        }
    }
    
    // 4. Seed Shifts
    console.log('  📅 Creating shifts...');
    const shifts = generateShifts(tenantData.id, tenantData.nurses, tenantData.patients);
    for (const shift of shifts) {
        try {
            await client.models.Shift.create(shift);
            console.log(`    ✅ Shift: ${shift.id}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`    ⏭️  Shift exists: ${shift.id}`);
            } else {
                console.log(`    ❌ Error: ${e.message}`);
            }
        }
    }
    
    // 5. Seed Billing Records
    console.log('  💰 Creating billing records...');
    const billingRecords = generateBillingRecords(tenantData.id, tenantData.patients);
    for (const record of billingRecords) {
        try {
            await client.models.BillingRecord.create(record);
            console.log(`    ✅ Billing: ${record.invoiceNumber}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`    ⏭️  Billing exists: ${record.invoiceNumber}`);
            } else {
                console.log(`    ❌ Error: ${e.message}`);
            }
        }
    }
}

async function main() {
    console.log('🚀 IPS-ERP Production Data Seed');
    console.log('================================\n');
    
    try {
        // Seed both tenants
        await seedTenant(TENANT_VIDA);
        await seedTenant(TENANT_SALUD);
        
        console.log('\n✅ Seeding complete!');
        console.log('\n📊 Summary:');
        console.log(`  Tenant 1 (Clínica Vida): 2 nurses, 3 patients, 7 inventory, 14 shifts`);
        console.log(`  Tenant 2 (IPS Salud): 1 nurse, 1 patient, 2 inventory, 7 shifts`);
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();

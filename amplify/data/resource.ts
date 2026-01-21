import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * IPS ERP Data Schema - Phase 2
 * Multi-tenant architecture with strict data isolation
 * 
 * Authorization Strategy:
 * - All models (except Tenant) filter by custom:tenantId JWT claim
 * - Users can only access data from their own IPS organization
 * - Relationships enable single-query loading (shift.nurse.name)
 */

const schema = a.schema({
    // ============================================
    // CUSTOM TYPES (Nested in Patient model)
    // ============================================
    
    Medication: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        dosage: a.string().required(),
        frequency: a.string().required(),
        prescribedBy: a.string(), // Added: matches test expectations
        status: a.enum(['ACTIVE', 'DISCONTINUED']),
    }),

    Task: a.customType({
        id: a.id().required(),
        patientId: a.id().required(),
        description: a.string().required(),
        completed: a.boolean().required(), // Fixed: was isCompleted
        dueDate: a.string(), // ISO date string
    }),

    // ============================================
    // ENUMS
    // ============================================
    
    ShiftStatus: a.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    InventoryStatus: a.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']),
    BillingStatus: a.enum(['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID']),

    // ============================================
    // MODELS
    // ============================================

    // 1. TENANT - Base organization model
    Tenant: a.model({
        name: a.string().required(),
        nit: a.string().required(),
        
        // Relationships
        nurses: a.hasMany('Nurse', 'tenantId'),
        patients: a.hasMany('Patient', 'tenantId'),
        shifts: a.hasMany('Shift', 'tenantId'),
        inventory: a.hasMany('InventoryItem', 'tenantId'),
        vitalSigns: a.hasMany('VitalSigns', 'tenantId'),
        billingRecords: a.hasMany('BillingRecord', 'tenantId'),
    }).authorization(allow => [
        allow.authenticated()
    ]),

    // 2. PATIENT - Home care patients
    Patient: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        name: a.string().required(),
        documentId: a.string().required(),
        age: a.integer(),
        address: a.string(),
        diagnosis: a.string(),
        
        // Nested arrays (not separate models)
        medications: a.ref('Medication').array(),
        tasks: a.ref('Task').array(),
        
        // Relationships
        shifts: a.hasMany('Shift', 'patientId'),
        vitalSigns: a.hasMany('VitalSigns', 'patientId'),
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
    ]),

    // 3. NURSE - Home care nurses
    Nurse: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        name: a.string().required(),
        email: a.string(),
        role: a.enum(['ADMIN', 'NURSE', 'COORDINATOR']),
        skills: a.string().array(),
        locationLat: a.float(),
        locationLng: a.float(),
        
        // Relationships
        shifts: a.hasMany('Shift', 'nurseId'),
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
    ]),

    // 4. SHIFT - Nurse assignments to patients
    Shift: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        nurseId: a.id().required(),
        nurse: a.belongsTo('Nurse', 'nurseId'),
        
        patientId: a.id().required(),
        patient: a.belongsTo('Patient', 'patientId'),
        
        scheduledTime: a.string().required(), // ISO datetime string
        status: a.ref('ShiftStatus'),
        clinicalNote: a.string(),
        
        // GPS tracking
        startedAt: a.datetime(),
        completedAt: a.datetime(),
        startLat: a.float(),
        startLng: a.float(),
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
    ]),

    // 5. INVENTORY ITEM - Medical supplies
    InventoryItem: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        name: a.string().required(),
        sku: a.string(),
        quantity: a.integer().required().default(0),
        unit: a.string(),
        reorderLevel: a.integer().required().default(10),
        status: a.ref('InventoryStatus'),
        expiryDate: a.string(), // ISO date string
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
    ]),

    // 6. VITAL SIGNS - Patient health metrics
    VitalSigns: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        patientId: a.id().required(),
        patient: a.belongsTo('Patient', 'patientId'),
        
        // Vital measurements
        date: a.string().required(), // ISO date string - matches test expectations
        sys: a.integer().required(), // Systolic BP
        dia: a.integer().required(), // Diastolic BP
        spo2: a.integer().required(), // Oxygen saturation
        hr: a.integer().required(), // Heart rate
        temperature: a.float(),
        weight: a.float(),
        note: a.string(),
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
    ]),

    // 7. BILLING RECORD - RIPS billing data
    BillingRecord: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        patientId: a.id().required(),
        shiftId: a.id(),
        
        // RIPS fields
        date: a.string().required(), // ISO date string - matches test expectations
        procedures: a.string().array(), // CUPS codes
        diagnosis: a.string().required(), // ICD-10 code
        eps: a.string().required(), // Health insurance provider
        
        totalAmount: a.float().required(), // Fixed: was 'amount'
        ripsGenerated: a.boolean().required().default(false), // Added: missing field
        status: a.ref('BillingStatus'),
        
        submittedAt: a.datetime(),
        approvedAt: a.datetime(),
        rejectionReason: a.string(),
        glosaDefense: a.string(), // AI-generated defense
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
    ]),

    // ============================================
    // CUSTOM QUERIES (Lambda Functions)
    // ============================================

    generateRoster: a.query()
        .arguments({
            nurses: a.json(),
            unassignedShifts: a.json()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('roster-architect')),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
    },
});

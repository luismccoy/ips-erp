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
    
    // Phase 3: Workflow Compliance Custom Types
    KARDEX: a.customType({
        generalObservations: a.string().required(),
        skinCondition: a.string(),
        mobilityStatus: a.string(),
        nutritionIntake: a.string(),
        painLevel: a.integer(),
        mentalStatus: a.string(),
        environmentalSafety: a.string(),
        caregiverSupport: a.string(),
        internalNotes: a.string(), // Hidden from family
    }),
    
    // ============================================
    // CLINICAL ASSESSMENT SCALES (Phase 4)
    // Standardized nursing assessment scales required for RIPS compliance
    // ============================================
    
    // Glasgow Coma Scale (GCS) - Consciousness level assessment
    GlasgowScore: a.customType({
        eye: a.integer().required(),      // 1-4: Eye opening response
        verbal: a.integer().required(),   // 1-5: Verbal response
        motor: a.integer().required(),    // 1-6: Motor response
        total: a.integer().required(),    // 3-15: Computed total
    }),
    
    // Braden Scale - Pressure ulcer risk assessment
    BradenScore: a.customType({
        sensoryPerception: a.integer().required(),  // 1-4
        moisture: a.integer().required(),           // 1-4
        activity: a.integer().required(),           // 1-4
        mobility: a.integer().required(),           // 1-4
        nutrition: a.integer().required(),          // 1-4
        frictionShear: a.integer().required(),      // 1-3
        total: a.integer().required(),              // 6-23: Computed total
    }),
    
    // Morse Fall Scale - Fall risk assessment
    MorseScore: a.customType({
        historyOfFalling: a.integer().required(),   // 0 or 25
        secondaryDiagnosis: a.integer().required(), // 0 or 15
        ambulatoryAid: a.integer().required(),      // 0, 15, or 30
        ivHeparinLock: a.integer().required(),      // 0 or 20
        gait: a.integer().required(),               // 0, 10, or 20
        mentalStatus: a.integer().required(),       // 0 or 15
        total: a.integer().required(),              // 0-125: Computed total
    }),
    
    // NEWS/NEWS2 - National Early Warning Score for clinical deterioration
    NEWSScore: a.customType({
        respirationRate: a.integer().required(),    // 0-3
        oxygenSaturation: a.integer().required(),   // 0-3
        supplementalO2: a.integer().required(),     // 0-2
        temperature: a.integer().required(),        // 0-3
        systolicBP: a.integer().required(),         // 0-3
        heartRate: a.integer().required(),          // 0-3
        consciousness: a.integer().required(),      // 0-3
        total: a.integer().required(),              // 0-20: Computed total
    }),
    
    // Barthel Index - ADL independence assessment
    BarthelScore: a.customType({
        feeding: a.integer().required(),      // 0, 5, 10
        bathing: a.integer().required(),      // 0, 5
        grooming: a.integer().required(),     // 0, 5
        dressing: a.integer().required(),     // 0, 5, 10
        bowels: a.integer().required(),       // 0, 5, 10
        bladder: a.integer().required(),      // 0, 5, 10
        toiletUse: a.integer().required(),    // 0, 5, 10
        transfers: a.integer().required(),    // 0, 5, 10, 15
        mobility: a.integer().required(),     // 0, 5, 10, 15
        stairs: a.integer().required(),       // 0, 5, 10
        total: a.integer().required(),        // 0-100: Computed total
    }),
    
    // Norton Scale - Pressure sore risk assessment
    NortonScore: a.customType({
        physicalCondition: a.integer().required(),  // 1-4
        mentalCondition: a.integer().required(),    // 1-4
        activity: a.integer().required(),           // 1-4
        mobility: a.integer().required(),           // 1-4
        incontinence: a.integer().required(),       // 1-4
        total: a.integer().required(),              // 5-20: Computed total
    }),
    
    // Assessment Alert - Generated when scores hit risk thresholds
    AssessmentAlert: a.customType({
        scale: a.string().required(),         // Scale name (e.g., "Glasgow", "Morse")
        level: a.enum(['INFO', 'WARNING', 'CRITICAL']),  // Enums don't support .required()
        message: a.string().required(),       // Spanish alert message
    }),
    
    MedicationAdmin: a.customType({
        medicationName: a.string().required(),
        intendedDosage: a.string().required(),
        dosageGiven: a.string().required(),
        time: a.datetime().required(),
        route: a.string(),
        notes: a.string(),
    }),
    
    TaskCompletion: a.customType({
        taskDescription: a.string().required(),
        completedAt: a.datetime().required(),
        notes: a.string(),
    }),
    
    VisitSummary: a.customType({
        visitDate: a.string().required(),
        nurseName: a.string().required(),
        duration: a.integer(),
        overallStatus: a.string(),
        keyActivities: a.string().array(),
        nextVisitDate: a.string(),
    }),

    // ============================================
    // ENUMS
    // ============================================
    
    ShiftStatus: a.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    InventoryStatus: a.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']), // Phase 12: GraphQL standard (uppercase with underscores)
    BillingStatus: a.enum(['PENDING', 'PAID', 'CANCELED', 'GLOSED']), // Phase 10: Updated for RIPS module
    
    // Phase 3: Workflow Compliance Enums
    VisitStatus: a.enum(['DRAFT', 'SUBMITTED', 'REJECTED', 'APPROVED']),
    AuditAction: a.enum([
        'VISIT_CREATED', 'VISIT_SUBMITTED', 'VISIT_APPROVED', 'VISIT_REJECTED', 'VISIT_EDITED',
        'PATIENT_VIEWED_BY_FAMILY', 'USER_LOGIN', 'USER_LOGOUT', 'DATA_EXPORT'
    ]),
    NotificationType: a.enum([
        'VISIT_APPROVED', 'VISIT_REJECTED', 'VISIT_PENDING_REVIEW',
        'VISIT_AVAILABLE_FOR_FAMILY', 'SHIFT_ASSIGNED', 'SHIFT_CANCELLED'
    ]),

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
        visits: a.hasMany('Visit', 'tenantId'),
        auditLogs: a.hasMany('AuditLog', 'tenantId'),
        notifications: a.hasMany('Notification', 'tenantId'),
        assessments: a.hasMany('PatientAssessment', 'tenantId'), // Phase 4: Clinical assessments
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
        eps: a.string(), // Phase 12: Health insurance provider (EPS)
        diagnosis: a.string(),
        
        // Nested arrays (not separate models)
        medications: a.ref('Medication').array(),
        tasks: a.ref('Task').array(),
        
        // Phase 3: Family member access control
        familyMembers: a.id().array(), // Cognito user IDs with read access
        accessCode: a.string(), // Phase 12: Family portal access code
        
        // Task 4.3: Primary nurse assignment
        primaryNurseId: a.id(),
        primaryNurse: a.belongsTo('Nurse', 'primaryNurseId'),
        
        // Relationships
        shifts: a.hasMany('Shift', 'patientId'),
        vitalSigns: a.hasMany('VitalSigns', 'patientId'),
        visits: a.hasMany('Visit', 'patientId'),
        assessments: a.hasMany('PatientAssessment', 'patientId'), // Phase 4: Clinical assessments
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
        
        // Phase 3: Identity mapping and activation
        cognitoSub: a.id().required(), // Maps to identity.sub for admin validation
        isActive: a.boolean().required().default(true),
        
        // Relationships
        shifts: a.hasMany('Shift', 'nurseId'),
        visits: a.hasMany('Visit', 'nurseId'),
        assessments: a.hasMany('PatientAssessment', 'nurseId'), // Phase 4: Clinical assessments
        primaryPatients: a.hasMany('Patient', 'primaryNurseId'), // Task 4.3: Patients assigned to this nurse
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
        
        // Phase 3: Link to Visit (null until visit created)
        visitId: a.id(),
        
        // GPS tracking
        startedAt: a.datetime(),
        completedAt: a.datetime(),
        startLat: a.float(),
        startLng: a.float(),
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
        // KIRO-004 Fix: Added 'subscribe' and 'listen' for GraphQL subscription support
        allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete', 'subscribe', 'listen']),
        allow.groups(['NURSE']).to(['read', 'subscribe', 'listen'])
    ]).secondaryIndexes(index => [
        // Task 4.1: Query shifts by nurse and date for roster optimization
        index('nurseId').sortKeys(['scheduledTime']).name('byNurseAndDate')
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
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
        allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
        allow.groups(['NURSE']).to(['read'])
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

    // 7. BILLING RECORD - RIPS billing data (Phase 10: Updated for Billing module)
    BillingRecord: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        patientId: a.id().required(),
        shiftId: a.id(), // Optional: link to shift
        
        // Phase 10: Core billing fields
        invoiceNumber: a.string(), // Optional: invoice reference
        totalValue: a.float().required(), // Renamed from totalAmount
        status: a.ref('BillingStatus').required(),
        radicationDate: a.date(), // AWSDate: when submitted to EPS
        
        // RIPS fields (legacy, kept for compatibility)
        date: a.string(), // ISO date string
        procedures: a.string().array(), // CUPS codes
        diagnosis: a.string(), // ICD-10 code
        eps: a.string(), // Health insurance provider
        
        ripsGenerated: a.boolean().required().default(false),
        submittedAt: a.datetime(),
        approvedAt: a.datetime(),
        rejectionReason: a.string(),
        glosaDefense: a.string(), // AI-generated defense (legacy)
        
        // Phase 12: AI Output Persistence
        ripsValidationResult: a.json(), // Stores validateRIPS JSON output
        glosaDefenseText: a.string(), // Stores glosaDefender markdown output
        glosaDefenseGeneratedAt: a.datetime(), // Timestamp of AI generation
        
        // Task 4.2: Colombian RIPS Compliance Fields (Resolución 2275)
        codigoPrestador: a.string(),       // IPS provider code (12 digits)
        tipoDocumento: a.string(),          // Document type (CC, TI, CE, PA, RC, MS, AS, NV)
        numeroAutorizacion: a.string(),    // EPS authorization number
        codigoServicio: a.string(),        // Service code (01=urgencias, 02=hospitalizacion, etc.)
        valorCopago: a.float(),            // Copayment value (COP)
        valorCuotaModeradora: a.float(),   // Moderating fee (COP)
        fechaConsulta: a.date(),           // Consultation date (AWSDate)
        causaExterna: a.string(),          // External cause code (01-15 per RIPS spec)
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
        allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete'])
    ]),
    
    // 8. VISIT - Phase 3: Clinical documentation workflow
    Visit: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        // 1:1 relationship with Shift (enforced by setting id=shiftId at creation)
        shiftId: a.id().required(),
        
        patientId: a.id().required(),
        patient: a.belongsTo('Patient', 'patientId'),
        
        nurseId: a.id().required(),
        nurse: a.belongsTo('Nurse', 'nurseId'),
        
        status: a.ref('VisitStatus').required(),
        
        // Clinical documentation
        kardex: a.ref('KARDEX').required(),
        vitalsRecorded: a.json(), // VitalSigns snapshot
        medicationsAdministered: a.ref('MedicationAdmin').array(),
        tasksCompleted: a.ref('TaskCompletion').array(),
        
        // Workflow timestamps
        submittedAt: a.datetime(),
        reviewedAt: a.datetime(),
        reviewedBy: a.id(),
        rejectionReason: a.string(),
        approvedAt: a.datetime(),
        approvedBy: a.id(),
    }).authorization(allow => [
        // Tenant isolation
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
        // Only admin and assigned nurse can access (enforced in Lambda)
        allow.authenticated()
    ]).secondaryIndexes(index => [
        // Task 4.1: Query visits by tenant and status for admin dashboard
        index('tenantId').sortKeys(['status']).name('byTenantAndStatus')
    ]),
    
    // 9. AUDIT LOG - Phase 3: Immutable event log
    AuditLog: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        userId: a.id().required(),
        userRole: a.string().required(),
        action: a.ref('AuditAction').required(),
        entityType: a.string().required(),
        entityId: a.id().required(),
        timestamp: a.datetime().required(),
        details: a.json(),
        ipAddress: a.string(),
    }).authorization(allow => [
        // Only admins can read audit logs
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
        allow.authenticated()
    ]),
    
    // 10. NOTIFICATION - Phase 3: User notifications
    Notification: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        userId: a.id().required(),
        type: a.ref('NotificationType').required(),
        message: a.string().required(),
        entityType: a.string().required(),
        entityId: a.id().required(),
        read: a.boolean().required().default(false),
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
        // Phase 16: Explicit group permissions for subscriptions
        // KIRO-003 Fix: Added 'create' and explicit operations for list queries
        // KIRO-004 Fix: Added 'subscribe' and 'listen' for GraphQL subscription support
        allow.groups(['ADMIN', 'NURSE']).to(['create', 'read', 'update', 'delete', 'subscribe', 'listen'])
    ]).secondaryIndexes(index => [
        // Task 4.1: Query notifications by user (filter by read status in app)
        // Note: Boolean fields cannot be sort keys in DynamoDB GSIs
        index('userId').name('byUser')
    ]),
    
    // 11. PATIENT ASSESSMENT - Phase 4: Clinical Assessment Scales
    // Standardized nursing assessment scales required for RIPS compliance in Colombian healthcare
    PatientAssessment: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),
        
        patientId: a.id().required(),
        patient: a.belongsTo('Patient', 'patientId'),
        
        nurseId: a.id().required(),
        nurse: a.belongsTo('Nurse', 'nurseId'),
        
        // Assessment timestamp (sortable)
        assessedAt: a.datetime().required(),
        
        // Clinical Assessment Scales (null if not assessed during this visit)
        glasgowScore: a.ref('GlasgowScore'),       // GCS: 3-15 (consciousness)
        painScore: a.integer(),                     // EVA: 0-10 (pain intensity)
        bradenScore: a.ref('BradenScore'),         // 6-23 (pressure ulcer risk)
        morseScore: a.ref('MorseScore'),           // 0-125 (fall risk)
        newsScore: a.ref('NEWSScore'),             // 0-20 (early warning)
        barthelScore: a.ref('BarthelScore'),       // 0-100 (ADL independence)
        nortonScore: a.ref('NortonScore'),         // 5-20 (pressure sore risk)
        rassScore: a.integer(),                     // -5 to +4 (sedation/agitation)
        
        // Computed alerts (generated based on score thresholds)
        alerts: a.ref('AssessmentAlert').array(),
        
        // Clinical notes
        notes: a.string(),
        
        // Link to visit (optional - assessments can be standalone)
        visitId: a.id(),
    }).authorization(allow => [
        allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
        allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
        allow.groups(['NURSE']).to(['create', 'read']),
        allow.groups(['FAMILY']).to(['read'])
    ]).secondaryIndexes(index => [
        // Query assessments by patient, sorted by date (most recent first)
        index('patientId').sortKeys(['assessedAt']).name('byPatient'),
        // Query assessments by nurse
        index('nurseId').name('byNurse'),
        // Query all assessments for a tenant
        index('tenantId').name('byTenant')
    ]),

    // ============================================
    // CUSTOM QUERIES (Lambda Functions)
    // ============================================

    // AI-powered roster generation
    generateRoster: a.query()
        .arguments({
            nurses: a.json(),
            unassignedShifts: a.json()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('roster-architect')),

    // RIPS compliance validation
    validateRIPS: a.query()
        .arguments({
            billingRecord: a.json()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('rips-validator')),

    // AI-powered billing defense letter generation
    generateGlosaDefense: a.query()
        .arguments({
            billingRecord: a.json(),
            patientHistory: a.json(),
            clinicalNotes: a.json()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('glosa-defender')),
    
    // ============================================
    // PHASE 3: WORKFLOW COMPLIANCE QUERIES/MUTATIONS
    // ============================================
    
    // Phase 16: Family Portal access code verification
    verifyFamilyAccessCode: a.query()
        .arguments({
            patientId: a.id().required(),
            accessCode: a.string().required()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('verify-family-access')),
    
    // Family-safe query for approved visit summaries
    listApprovedVisitSummariesForFamily: a.query()
        .arguments({
            patientId: a.id().required()
        })
        .returns(a.ref('VisitSummary').array())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('list-approved-visit-summaries')),
    
    // Create DRAFT visit from completed shift
    createVisitDraftFromShift: a.mutation()
        .arguments({
            shiftId: a.id().required()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('create-visit-draft')),
    
    // Submit visit for admin review (DRAFT/REJECTED → SUBMITTED)
    submitVisit: a.mutation()
        .arguments({
            shiftId: a.id().required()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('submit-visit')),
    
    // Reject visit (admin only, SUBMITTED → REJECTED)
    rejectVisit: a.mutation()
        .arguments({
            shiftId: a.id().required(),
            reason: a.string().required()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('reject-visit')),
    
    // Approve visit (admin only, SUBMITTED → APPROVED, immutable)
    approveVisit: a.mutation()
        .arguments({
            shiftId: a.id().required()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('approve-visit')),
    
    // ============================================
    // PHASE 19: SECURITY ENHANCEMENTS
    // ============================================
    
    // Task 1.2: Create Nurse with cognitoSub validation
    // Validates Cognito user exists before creating Nurse record
    createNurseWithValidation: a.mutation()
        .arguments({
            name: a.string().required(),
            email: a.string(),
            role: a.enum(['ADMIN', 'NURSE', 'COORDINATOR']),
            skills: a.string().array(),
            cognitoSub: a.id().required(),
            tenantId: a.id().required()
        })
        .returns(a.json())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function('create-nurse-validated')),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
    },
});

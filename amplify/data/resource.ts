import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * IPS ERP Data Schema
 * Multi-tenant architecture: All models should conceptually belong to a tenant.
 * 
 * Access Patterns:
 * - Admin: Full access to their tenant's data.
 * - Nurse: Access to their assigned shifts and read-only inventory.
 * 
 * For MVP/Phase 1: We allow authenticated access. Validations occur at resolver/app level.
 */
const schema = a.schema({
    Tenant: a.model({
        name: a.string().required(),
        nit: a.string(),
        // Relation: One tenant has many Nurses, Shifts, Inventory items
        nurses: a.hasMany('Nurse', 'tenantId'),
        shifts: a.hasMany('Shift', 'tenantId'),
        inventory: a.hasMany('Inventory', 'tenantId'),
    }).authorization(allow => [allow.authenticated()]),

    Nurse: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),

        name: a.string().required(),
        skills: a.string().array(), // e.g., ["Palliativos", "Curaciones"]
        locationLat: a.float(),
        locationLng: a.float(),

        // Relation
        shifts: a.hasMany('Shift', 'nurseId'),
    }).authorization(allow => [allow.authenticated()]),

    Shift: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),

        nurseId: a.id(),
        nurse: a.belongsTo('Nurse', 'nurseId'),

        status: a.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
        clinicalNote: a.string(),

        // GPS Proof
        startedAt: a.datetime(),
        completedAt: a.datetime(),
        startLat: a.float(),
        startLng: a.float(),
    }).authorization(allow => [allow.authenticated()]),

    Inventory: a.model({
        tenantId: a.id().required(),
        tenant: a.belongsTo('Tenant', 'tenantId'),

        sku: a.string().required(),
        name: a.string().required(),
        stockCount: a.integer().default(0),
        unit: a.string(), // e.g. "Unidad", "Caja"
    }).authorization(allow => [allow.authenticated()]),

    generateRoster: a.query()
        .arguments({
            nurses: a.json(), // List of nurse objects
            unassignedShifts: a.json() // List of shift objects
        })
        .returns(a.json()) // { assignments: [] }
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

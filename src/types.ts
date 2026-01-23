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
    
    /**
     * Inventory status indicating stock availability
     * 
     * **Dual Format System:**
     * - **Backend (GraphQL):** `IN_STOCK` | `LOW_STOCK` | `OUT_OF_STOCK`
     * - **Frontend (Display):** `in-stock` | `low-stock` | `out-of-stock`
     * 
     * **Why Two Formats?**
     * GraphQL enum values cannot contain hyphens (syntax constraint), so the backend
     * uses uppercase with underscores. The frontend uses lowercase with hyphens for
     * better readability and consistency with CSS class names.
     * 
     * **Transformation Functions:**
     * Use the utility functions from `src/utils/inventory-transforms.ts`:
     * 
     * - `graphqlToFrontend()` - Convert backend format to frontend format
     * - `frontendToGraphQL()` - Convert frontend format to backend format
     * - `graphqlToFrontendSafe()` - Safe conversion with null handling
     * - `frontendToGraphQLSafe()` - Safe conversion with null handling
     * 
     * **Usage Examples:**
     * 
     * ```typescript
     * // Reading from backend (GraphQL → Frontend)
     * import { graphqlToFrontendSafe } from '../utils/inventory-transforms';
     * 
     * const response = await client.models.InventoryItem.list();
     * const items = response.data.map(item => ({
     *   ...item,
     *   status: graphqlToFrontendSafe(item.status) // 'IN_STOCK' → 'in-stock'
     * }));
     * ```
     * 
     * ```typescript
     * // Writing to backend (Frontend → GraphQL)
     * import { frontendToGraphQLSafe } from '../utils/inventory-transforms';
     * 
     * await client.models.InventoryItem.create({
     *   ...itemData,
     *   status: frontendToGraphQLSafe(formStatus) // 'in-stock' → 'IN_STOCK'
     * });
     * ```
     * 
     * **Mock Backend Note:**
     * When using mock backend (`VITE_USE_REAL_BACKEND=false`), the data already
     * uses lowercase format, so no transformation is needed. Always check
     * `isUsingRealBackend()` before applying transformations.
     * 
     * **Type Safety:**
     * The transformation functions are fully type-safe and will throw descriptive
     * errors if invalid values are provided. Use the safe variants (`*Safe()`) when
     * dealing with potentially null/undefined values.
     */
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


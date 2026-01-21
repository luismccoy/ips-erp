# Phase 2 Testing Guide - Multi-Tenant Data Models

**Date:** January 21, 2026  
**Phase:** Phase 2 - Data Models  
**Goal:** Verify all 7 models work with multi-tenant isolation

---

## Prerequisites

1. Run Amplify sandbox:
   ```bash
   npx ampx sandbox
   ```

2. Wait for deployment to complete (usually 2-3 minutes)

3. Open AppSync console when prompted

---

## Test 1: Create First Tenant (IPS Vida)

**Mutation:**
```graphql
mutation CreateTenantVida {
  createTenant(input: {
    name: "IPS Vida"
    nit: "900123456-7"
  }) {
    id
    name
    nit
    createdAt
  }
}
```

**Expected Result:**
- ✅ Returns tenant ID
- ✅ No errors in response

**Save the tenant ID:** `TENANT_VIDA_ID = <copy-id-here>`

---

## Test 2: Create Second Tenant (IPS Salud)

**Mutation:**
```graphql
mutation CreateTenantSalud {
  createTenant(input: {
    name: "IPS Salud"
    nit: "900654321-3"
  }) {
    id
    name
    nit
    createdAt
  }
}
```

**Expected Result:**
- ✅ Returns different tenant ID
- ✅ No errors in response

**Save the tenant ID:** `TENANT_SALUD_ID = <copy-id-here>`

---

## Test 3: Create Patient in First Tenant (IPS Vida)

**Mutation:**
```graphql
mutation CreatePatientVida {
  createPatient(input: {
    tenantId: "TENANT_VIDA_ID"
    name: "María González"
    documentId: "1234567890"
    age: 75
    address: "Calle 123 #45-67, Bogotá"
    diagnosis: "I10 - Hipertensión esencial"
    medications: [
      {
        id: "med-1"
        patientId: "patient-1"
        name: "Losartán"
        dosage: "50mg"
        frequency: "Cada 12 horas"
        status: ACTIVE
      }
    ]
    tasks: [
      {
        id: "task-1"
        patientId: "patient-1"
        description: "Cambio de sonda"
        isCompleted: false
        dueDate: "2026-01-25"
      }
    ]
  }) {
    id
    name
    tenantId
    medications {
      name
      dosage
      status
    }
    tasks {
      description
      isCompleted
    }
  }
}
```

**Expected Result:**
- ✅ Patient created with nested medications and tasks
- ✅ tenantId matches TENANT_VIDA_ID

**Save the patient ID:** `PATIENT_VIDA_ID = <copy-id-here>`

---

## Test 4: Create Patient in Second Tenant (IPS Salud)

**Mutation:**
```graphql
mutation CreatePatientSalud {
  createPatient(input: {
    tenantId: "TENANT_SALUD_ID"
    name: "Roberto Gómez"
    documentId: "9876543210"
    age: 68
    address: "Carrera 45 #12-34, Medellín"
    diagnosis: "E11 - Diabetes tipo 2"
  }) {
    id
    name
    tenantId
  }
}
```

**Expected Result:**
- ✅ Patient created
- ✅ tenantId matches TENANT_SALUD_ID

**Save the patient ID:** `PATIENT_SALUD_ID = <copy-id-here>`

---

## Test 5: Create Nurse in First Tenant

**Mutation:**
```graphql
mutation CreateNurseVida {
  createNurse(input: {
    tenantId: "TENANT_VIDA_ID"
    name: "Ana Rodríguez"
    email: "ana@ipsvida.com"
    role: NURSE
    skills: ["Paliativos", "Curaciones"]
  }) {
    id
    name
    tenantId
    skills
  }
}
```

**Expected Result:**
- ✅ Nurse created
- ✅ Skills array populated

**Save the nurse ID:** `NURSE_VIDA_ID = <copy-id-here>`

---

## Test 6: Create Shift with Relationships

**Mutation:**
```graphql
mutation CreateShiftVida {
  createShift(input: {
    tenantId: "TENANT_VIDA_ID"
    nurseId: "NURSE_VIDA_ID"
    patientId: "PATIENT_VIDA_ID"
    scheduledTime: "2026-01-22T09:00:00Z"
    status: PENDING
  }) {
    id
    scheduledTime
    status
    tenantId
  }
}
```

**Expected Result:**
- ✅ Shift created
- ✅ Links nurse and patient

**Save the shift ID:** `SHIFT_VIDA_ID = <copy-id-here>`

---

## Test 7: Query Shift with Relationships (CRITICAL)

**Query:**
```graphql
query GetShiftWithDetails {
  getShift(id: "SHIFT_VIDA_ID") {
    id
    scheduledTime
    status
    nurse {
      id
      name
      skills
    }
    patient {
      id
      name
      address
      diagnosis
    }
  }
}
```

**Expected Result:**
- ✅ Single query returns shift + nurse + patient data
- ✅ No need for multiple queries
- ✅ Relationships work correctly

---

## Test 8: Create Inventory Item

**Mutation:**
```graphql
mutation CreateInventoryVida {
  createInventoryItem(input: {
    tenantId: "TENANT_VIDA_ID"
    name: "Jeringa 5cc"
    sku: "JER-5CC-001"
    quantity: 50
    unit: "Unidad"
    reorderLevel: 10
    status: IN_STOCK
  }) {
    id
    name
    quantity
    reorderLevel
    status
  }
}
```

**Expected Result:**
- ✅ Inventory item created
- ✅ Default values applied (quantity: 0, reorderLevel: 10)

---

## Test 9: Create Vital Signs

**Mutation:**
```graphql
mutation CreateVitalsVida {
  createVitalSigns(input: {
    tenantId: "TENANT_VIDA_ID"
    patientId: "PATIENT_VIDA_ID"
    sys: 145
    dia: 90
    spo2: 95
    hr: 78
    temperature: 36.5
    weight: 68.5
    note: "Paciente estable, sin cambios"
    recordedAt: "2026-01-21T10:30:00Z"
  }) {
    id
    sys
    dia
    spo2
    hr
    temperature
    patient {
      name
    }
  }
}
```

**Expected Result:**
- ✅ Vital signs recorded
- ✅ Relationship to patient works

---

## Test 10: Create Billing Record

**Mutation:**
```graphql
mutation CreateBillingVida {
  createBillingRecord(input: {
    tenantId: "TENANT_VIDA_ID"
    patientId: "PATIENT_VIDA_ID"
    shiftId: "SHIFT_VIDA_ID"
    procedures: ["890201", "890301"]
    diagnosis: "I10"
    eps: "Sura EPS"
    amount: 150000
    status: PENDING
  }) {
    id
    amount
    status
    procedures
    eps
  }
}
```

**Expected Result:**
- ✅ Billing record created
- ✅ Array fields work (procedures)

---

## Test 11: CRITICAL - Test Multi-Tenant Isolation

### Step 1: List All Patients (Should See Both Tenants)

**Query:**
```graphql
query ListAllPatients {
  listPatients {
    items {
      id
      name
      tenantId
    }
  }
}
```

**Expected Result:**
- ✅ Returns patients from BOTH tenants
- ✅ Shows María González (IPS Vida)
- ✅ Shows Roberto Gómez (IPS Salud)

### Step 2: Filter by Tenant (Manual Filter)

**Query:**
```graphql
query ListPatientsVida {
  listPatients(filter: {tenantId: {eq: "TENANT_VIDA_ID"}}) {
    items {
      id
      name
      tenantId
    }
  }
}
```

**Expected Result:**
- ✅ Returns ONLY María González
- ✅ Does NOT return Roberto Gómez

### Step 3: Verify JWT Claim Filtering (MOST IMPORTANT)

**This test requires authentication setup:**

1. Create a Cognito user with `custom:tenantId = TENANT_VIDA_ID`
2. Sign in as that user
3. Get JWT token
4. Use JWT token in AppSync console (Authorization header)
5. Run query WITHOUT filter:

```graphql
query ListPatientsAutoFiltered {
  listPatients {
    items {
      id
      name
      tenantId
    }
  }
}
```

**Expected Result:**
- ✅ Returns ONLY patients from TENANT_VIDA_ID
- ✅ Automatic filtering by JWT claim works
- ✅ User cannot see other tenant's data

**NOTE:** This test requires Phase 1 (Authentication) to be deployed. If not yet deployed, skip this test and mark as "TODO after Phase 1 deployment".

---

## Test 12: Check CloudWatch Logs

1. Open AWS CloudWatch console
2. Navigate to Log Groups
3. Find AppSync API logs
4. Check recent logs for:
   - ✅ No authorization errors
   - ✅ No schema validation errors
   - ✅ Successful query executions
   - ✅ Proper tenantId filtering

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Create Tenant (Vida) | ⬜ | |
| 2. Create Tenant (Salud) | ⬜ | |
| 3. Create Patient (Vida) | ⬜ | |
| 4. Create Patient (Salud) | ⬜ | |
| 5. Create Nurse | ⬜ | |
| 6. Create Shift | ⬜ | |
| 7. Query Shift + Relationships | ⬜ | CRITICAL |
| 8. Create Inventory | ⬜ | |
| 9. Create Vital Signs | ⬜ | |
| 10. Create Billing Record | ⬜ | |
| 11. Multi-Tenant Isolation | ⬜ | CRITICAL |
| 12. CloudWatch Logs Clean | ⬜ | |

**Legend:**
- ⬜ Not tested
- ✅ Passed
- ❌ Failed

---

## Issues Found

Document any issues here:

1. 
2. 
3. 

---

## Next Steps After Testing

1. ✅ Update `docs/API_DOCUMENTATION.md` with test results
2. ✅ Mark Phase 2 complete in `.kiro/steering/KIRO IMPLEMENTATION GUIDE.md`
3. ✅ Commit changes: `git commit -m "feat: Phase 2 complete - all 7 data models tested"`
4. ✅ Deploy to dev: `npx ampx deploy --branch develop`
5. ✅ Notify frontend team that backend is ready

---

**Testing Date:** _____________  
**Tester:** _____________  
**Environment:** Amplify Sandbox  
**Result:** ⬜ Pass / ⬜ Fail

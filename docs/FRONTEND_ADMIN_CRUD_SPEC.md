# Frontend Spec: Admin CRUD Pages

**Task ID:** ANTIGRAVITY-001  
**Priority:** P0 (Critical - Blocking Production Use)  
**Created:** 2026-01-27  
**For:** Antigravity IDE (Frontend)

---

## Context

The UX Audit found that the Admin Dashboard is stuck in "read-only" mode because there's no UI to create Patients or Staff. The production database starts empty, so admins can't do anything.

**Reference:** `docs/UX_AUDIT_REPORT.md`

---

## Task 1: Patients CRUD Page

### Location
Create: `src/pages/admin/PatientsPage.tsx`

### Requirements
1. **List View** - Table of all patients with:
   - Name, Document ID, Phone, Status
   - Search/filter by name
   - Pagination

2. **Create Form** - Modal or slide-panel with fields:
   ```typescript
   interface PatientInput {
     firstName: string;      // required
     lastName: string;       // required
     documentType: 'CC' | 'TI' | 'CE' | 'PA';
     documentNumber: string; // required
     dateOfBirth: string;    // required
     phone: string;
     address: string;
     city: string;
     emergencyContact: string;
     emergencyPhone: string;
     diagnosis: string;
     notes: string;
   }
   ```

3. **Edit/View** - Click row to edit existing patient

4. **Delete** - Soft delete with confirmation

### GraphQL Mutations
Already exist in schema:
- `createPatient(input: CreatePatientInput!)`
- `updatePatient(input: UpdatePatientInput!)`
- `deletePatient(input: DeletePatientInput!)`

### UI Reference
Match existing admin style. See `src/components/AdminDashboard.tsx` for patterns.

---

## Task 2: Staff/Nurses CRUD Page

### Location
Create: `src/pages/admin/StaffPage.tsx`

### Requirements
1. **List View** - Table with:
   - Name, Email, Role, Status, Phone
   - Filter by role (Nurse, Admin, Coordinator)

2. **Create Form** - This is complex because it also creates Cognito user:
   ```typescript
   interface StaffInput {
     firstName: string;
     lastName: string;
     email: string;          // becomes Cognito username
     phone: string;
     role: 'NURSE' | 'ADMIN' | 'COORDINATOR';
     specialization?: string;
     licenseNumber?: string;
   }
   ```

3. **Important:** Creating staff should:
   - Call `createNurse` mutation
   - Trigger backend to create Cognito user (may need new Lambda)

### GraphQL
- `createNurse(input: CreateNurseInput!)`
- `updateNurse(input: UpdateNurseInput!)`

---

## Task 3: Navigation Update

### Add to Admin Sidebar
```tsx
// In AdminDashboard.tsx or Layout component
<NavLink to="/admin/patients">👥 Pacientes</NavLink>
<NavLink to="/admin/staff">👨‍⚕️ Personal</NavLink>
```

### Add Routes
```tsx
// In App.tsx or routes file
<Route path="/admin/patients" element={<PatientsPage />} />
<Route path="/admin/staff" element={<StaffPage />} />
```

---

## Design Guidelines

- Use existing Tailwind classes
- Match the dark theme in admin
- Use the existing Modal/Dialog components if available
- Spanish labels (this is for Colombian users):
  - "Pacientes" not "Patients"
  - "Personal" not "Staff"  
  - "Crear" not "Create"
  - "Guardar" not "Save"

---

## Testing

1. Create a patient via the new form
2. Verify it appears in the list
3. Edit the patient
4. Create a nurse/staff member
5. Verify they can log in (if Cognito integration works)

---

## Files to Create

```
src/pages/admin/
├── PatientsPage.tsx      # Main patients CRUD
├── StaffPage.tsx         # Main staff CRUD
└── components/
    ├── PatientForm.tsx   # Reusable form
    └── StaffForm.tsx     # Reusable form
```

---

## Estimated Effort

- Patients CRUD: 3-4 hours
- Staff CRUD: 4-5 hours (Cognito complexity)
- Navigation/Routes: 30 min

**Total:** ~8 hours

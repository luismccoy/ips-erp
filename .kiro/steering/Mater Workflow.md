---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 
KIRO MASTER WORKFLOW PROMPT — Home Care ERP (IPS)

Purpose of This Document

This document is a single source of truth for KIRO to understand the intended business workflow, role interactions, permissions, and data flow of the Home Care ERP application.

The application is not a set of isolated dashboards. It is a connected, role-driven system where actions performed by one persona directly affect the experience and data visibility of others.

KIRO must use this document to:
	•	Reason holistically about the system
	•	Implement features in the correct order
	•	Avoid building disconnected or purely UI-driven logic
	•	Respect real-world home care (IPS) operational standards

⸻

High-Level System Model

Multi-Tenant SaaS
	•	Each Home Care Agency (IPS) is a Tenant
	•	Tenants are fully isolated using tenantId
	•	All users belong to exactly one tenant

Core Personas
	1.	Platform Owner (Super Admin) – Software owner (Luis)
	2.	Tenant Admin – Home care business owner/manager (e.g., Daniela)
	3.	Nurse (Staff) – Field nurse providing care
	4.	Family / Relative (Read-only) – Patient’s family member

⸻

Persona 1: Platform Owner (Super Admin)

Scope
	•	Manages the SaaS platform itself
	•	Does not participate in day-to-day care operations

Responsibilities
	•	Create and manage tenants (licenses)
	•	View global audit logs across tenants
	•	Cannot modify or delete tenant clinical data
	•	Can view but not alter immutable audit records

Permissions
	•	Read-only access to all tenants
	•	Full access to audit logs
	•	No clinical write permissions

⸻

Persona 2: Tenant Admin (Home Care Owner)

Role Description

The Tenant Admin is the operational authority inside a home care agency.
They control people, patients, assignments, approvals, and oversight.

Core Responsibilities

1. Nurse Management
	•	Create nurse profiles
	•	Assign login credentials
	•	Activate / deactivate nurses
	•	Assign nurses to patients

2. Patient Management
	•	Create and manage patient records
	•	Assign patients to nurses
	•	Maintain admission status

3. Visit Oversight & Approval
	•	Review each nurse visit individually
	•	No bulk approvals allowed
	•	Can:
	•	Approve a visit
	•	Reject a visit with objections

4. Correction Workflow
	•	If rejected:
	•	Visit is returned to the nurse
	•	Nurse must correct documentation
	•	Nurse resubmits for approval

5. Finalization
	•	Only approved visits:
	•	Become immutable
	•	Become visible to family members
	•	Are eligible for billing / compliance

Permissions
	•	Full CRUD on nurses and patients
	•	Approval authority on visits
	•	Cannot delete audit logs

⸻

Persona 3: Nurse (Staff)

Role Description

The Nurse is a field operator.
Their interface must be focused, simplified, and task-oriented.

Core Workflow

1. Daily Assignment View
	•	Nurse logs in
	•	Sees only:
	•	Assigned patients
	•	Scheduled visits (daily/weekly)

2. Patient Visit Execution
For each patient visit:
	•	Access patient profile
	•	View care plan
	•	Record CARDEX (clinical notes)
	•	Record vitals, tasks, medications

CARDEX = structured clinical notes used in Colombian healthcare

3. Visit Completion
	•	Nurse marks visit as Completed
	•	Visit enters Pending Approval state
	•	Nurse cannot edit after submission

4. Rejection Handling
	•	If admin rejects visit:
	•	Nurse receives notification
	•	Visit returns to editable state
	•	Nurse corrects and resubmits

5. Approval Confirmation
	•	When approved:
	•	Nurse receives confirmation
	•	Visit becomes locked (read-only)

Permissions
	•	Read/write only on assigned patients
	•	No access to admin or billing
	•	No visibility into other nurses

⸻

Persona 4: Family / Relative

Role Description

Family members are observers only.
They must never see unreviewed or raw clinical data.

Visibility Rules
	•	Can only see:
	•	Approved visits
	•	High-level summaries
	•	Historical timeline

What They See
	•	Date of visit
	•	Nurse name
	•	High-level care summary
	•	No raw vitals, no internal notes

Restrictions
	•	No write access
	•	No real-time updates
	•	No access before admin approval

⸻

Visit State Machine (Critical)

Visits MUST follow this lifecycle:
	1.	Draft (Nurse editing)
	2.	Submitted (Pending Admin Review)
	3.	Rejected (Returned to Nurse)
	4.	Approved (Final & Immutable)

KIRO MUST enforce this strictly.

⸻

Notifications & Automation

Nurse Notifications
	•	Visit rejected
	•	Visit approved

Admin Notifications
	•	Pending visits awaiting review

Family Notifications
	•	New approved visit available

⸻

Audit Trail (Mandatory)

Every significant action MUST generate an immutable audit log:
	•	User ID
	•	Role
	•	Tenant ID
	•	Action type
	•	Timestamp
	•	Entity affected

Examples
	•	Nurse submits visit
	•	Admin rejects visit
	•	Admin approves visit
	•	Nurse edits after rejection

Rules
	•	Audit logs are append-only
	•	Only Super Admin can view global logs
	•	Tenant Admin can view tenant-level logs
	•	No one can delete or modify logs

⸻

Architectural Intent for KIRO

KIRO MUST:
	•	Treat workflow as state-driven, not UI-driven
	•	Never assume roles are independent
	•	Implement backend-first logic
	•	Respect tenant isolation at all layers
	•	Use approval gates before data propagation

⸻

Future Extensions (Do NOT Implement Yet)
	•	Analytics dashboards
	•	Predictive staffing
	•	Advanced compliance scoring
	•	AI-assisted clinical review

These should be architecturally possible, but not implemented unless explicitly requested.

⸻

Final Instruction to KIRO

If a feature conflicts with this document:
	•	This document wins

If ambiguity exists:
	•	Ask before implementing

This workflow represents real-world IPS operations and must be respected exactly.
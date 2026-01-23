# Admin Dashboard Logic Fixes - Requirements

## Overview
Fix critical logic gaps in the Admin Dashboard identified during UX audit, focusing on data persistence, authorization, and consistency.

## User Stories

### 1. AI Output Persistence (Billing Module)
**As an** Admin  
**I want** AI-generated RIPS validations and Glosa defenses to be saved to the database  
**So that** I can review them later and they don't disappear on page refresh

**Acceptance Criteria:**
- 1.1 BillingRecord model has `ripsValidationResult` field (JSON type)
- 1.2 BillingRecord model has `glosaDefenseText` field (String type)
- 1.3 BillingRecord model has `glosaDefenseGeneratedAt` field (DateTime type)
- 1.4 validateRIPS Lambda saves results to BillingRecord
- 1.5 glosaDefender Lambda saves output to BillingRecord
- 1.6 Saved AI outputs are retrievable via GraphQL queries

### 2. Inventory Write Access (Inventory Module)
**As an** Admin  
**I want** to create, update, and delete inventory items  
**So that** I can manage stock levels and add new supplies

**Acceptance Criteria:**
- 2.1 InventoryItem model allows Admin role to create items
- 2.2 InventoryItem model allows Admin role to update items
- 2.3 InventoryItem model allows Admin role to delete items
- 2.4 Authorization rules enforce tenant isolation
- 2.5 All mutations respect multi-tenant boundaries

### 3. Visit Rejection Consistency (Pending Reviews)
**As an** Admin  
**I want** rejected visits to immediately disappear from the pending list  
**So that** I don't see stale data after rejecting a visit

**Acceptance Criteria:**
- 3.1 rejectVisit Lambda returns updated Visit with status=REJECTED
- 3.2 rejectVisit Lambda uses strong consistency for DynamoDB updates
- 3.3 Subscription filters exclude REJECTED visits from pending queries
- 3.4 No race conditions between mutation and query refresh
- 3.5 Rejected visits appear in nurse's "Needs Correction" list

### 4. Test User Personas (Testing Infrastructure)
**As a** Developer  
**I want** permanent test users with realistic data  
**So that** I can test all user flows without mock data

**Acceptance Criteria:**
- 4.1 Admin test user exists: admin.test@ips.com (tenantId=IPS-001, role=ADMIN)
- 4.2 Nurse test user exists: nurse.maria@ips.com (tenantId=IPS-001, role=NURSE)
- 4.3 Family test user exists: family.perez@ips.com (role=FAMILY, linkedPatients)
- 4.4 Test users have realistic associated data (patients, shifts, visits)
- 4.5 Test users can authenticate and access appropriate dashboards

### 5. Shift Management Endpoints (Roster Module)
**As an** Admin  
**I want** to create shifts and optimize routes using AI  
**So that** I can efficiently schedule nurses

**Acceptance Criteria:**
- 5.1 Shift model allows Admin role to create shifts
- 5.2 roster-architect Lambda is accessible via AppSync
- 5.3 optimizeRoutes query accepts shift parameters
- 5.4 optimizeRoutes returns AI-generated route optimization
- 5.5 Created shifts are visible in AdminRoster component

## Technical Constraints
- Must maintain ~20 file limit in amplify/ directory
- No test files in amplify/ (use .local-tests/ for scripts)
- Document only in docs/API_DOCUMENTATION.md
- Use Amplify Gen 2 authorization patterns
- Maintain multi-tenant isolation for all operations

## Success Metrics
- All 5 user stories implemented and tested
- Zero regression in existing functionality
- File count remains ≤ 20 in amplify/
- All changes documented in API_DOCUMENTATION.md
- Deployment successful with zero downtime

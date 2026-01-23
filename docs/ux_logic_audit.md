# UX & Logic Audit: Admin Dashboard
**Date:** 2026-01-22
**Auditor:** Antigravity (AI Agent)
**Scope:** Admin Portal Modules (Pending Reviews, Billing, Inventory, Staff)

## Executive Summary
This document outlines logical gaps, missing features, and user experience logical errors found during a comprehensive audit of the Admin Dashboard. It serves as a roadmap for the Backend Team ("Kiro") and the Frontend Team.

## 1. Global Recommendations (High Priority)
### ⚠️ Create Real Test Personas
**Observation:** Testing is currently limited by reliance on mock data or an "admin" user with incomplete metadata.
**Recommendation for Kiro (Backend):**
Please create permanent test users in the Production User Pool and DynamoDB with fixed credentials for testing:
1.  **Admin Persona:** `admin.test@ips.com` (Full access, valid `tenantId`)
2.  **Nurse Persona:** `nurse.maria@ips.com` (Nurse role, assigned shifts)
3.  **Family Persona:** `family.perez@ips.com` (Linked to a specific patient)

---

## 2. Module-Specific Audit

### A. Revisiones Pendientes (Pending Reviews)
**Current Flow:** Admin views pending visits -> Clicks Reject -> Enters Reason -> Confirms.
**Logic Gap:** [Confirmed] Although the code contains optimistic logic to remove rejected items (`setPendingVisits`), users report they persist. This suggests a race condition or a backend re-fetch (via `fetchPendingVisits`) that still returns the rejected item because the backend status update might be slower than the UI refresh.
**Backend Request (Kiro):** Ensure [rejectVisit](file:///Users/luiscoy/ERP/src/mock-client.ts#354-401) mutation is strongly consistent or provide a specific subscription for status changes to avoid polling.
**Frontend Improvement:** Disable the "Refresh" button temporarily during rejection processing to prevent fetching stale data.

### B. Billing & RIPS Dashboard
**Current Flow:** Admin clicks "Validate RIPS" or "Generate Rebuttal".
**Logic Gap:** The AI response (validation result or rebuttal text) is displayed in a volatile `alert()` or console log and then lost. There is no mechanism to save this valuable AI output to the [BillingRecord](file:///Users/luiscoy/ERP/src/types.ts#116-128).
**Backend Request (Kiro):** Add fields `ripsValidationResult` and `generatedRebuttal` to the [BillingRecord](file:///Users/luiscoy/ERP/src/types.ts#116-128) model to store these outputs.
**Frontend Improvement:** Replace alerts with a proper "Review AI Output" modal that allows the admin to edit and save the rebuttal/validation result.

### C. Inventory Dashboard
**Current Flow:** Read-only list of items.
**Logic Gap:** Critical functionality missing. Admins cannot:
1.  Add new inventory items.
2.  Update stock levels (restock).
3.  Set low-stock thresholds.
**Backend Request (Kiro):** Ensure [InventoryItem](file:///Users/luiscoy/ERP/src/types.ts#22-37) mutations ([create](file:///Users/luiscoy/ERP/src/mock-client.ts#146-152), [update](file:///Users/luiscoy/ERP/src/mock-client.ts#152-163), [delete](file:///Users/luiscoy/ERP/src/mock-client.ts#163-173)) are accessible to the Admin role.
**Frontend Improvement:** Add "Add Item" button and "Edit Stock" modal actions to the dashboard.

### D. Roster (Shift Management)
**Current Flow:** Read-only list of shifts.
**Logic Gap:** Similar to Inventory, this view is passive.
1.  No "Create Shift" button.
2.  "Optimize Routes (AI)" is a placeholder button with no connected logic.
**Backend Request (Kiro):** Expose `optimizeRoutes` Lambda endpoint for the AI feature.
**Frontend Improvement:** Implement "Create Shift" form and connect the AI Optimization button to the backend.

## 3. Recommended Next Steps
1.  **Prioritize Test Personas:** Get Kiro to set up the 3 permanent test users immediately.
2.  **Enable Write Actions:** Convert Inventory and Roster from read-only to interactive modules.
3.  **Persist AI Data:** Update Billing schema to save AI-generated insights.


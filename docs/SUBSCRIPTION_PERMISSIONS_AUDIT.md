# Subscription Permissions Audit

## Issue: listNotifications Query Authorization Failure

**Date:** 2026-01-27  
**Commit:** 7cfd525 (attempted fix - FAILED)  
**Error:** "Not Authorized to access listNotifications on type Query"

---

## Root Cause Analysis

### The Problem
The error `"Not Authorized to access listNotifications on type Query"` is a **QUERY permission error**, not a subscription error.

### What Commit 7cfd525 Did (Incorrectly)
Added `'subscribe'` and `'listen'` operations to Notification and Shift models:
```typescript
allow.groups(['ADMIN', 'NURSE']).to(['create', 'read', 'update', 'delete', 'subscribe', 'listen'])
```

**This didn't fix the issue because:**
- `'subscribe'` and `'listen'` only affect GraphQL subscriptions (real-time updates)
- The error is about `listNotifications`, which is a **QUERY operation**
- In Amplify Data/AppSync, query operations require the `'list'` permission

---

## Amplify Data Authorization Operations

| Operation | Maps To | Example GraphQL |
|-----------|---------|-----------------|
| `'create'` | Mutations | `createNotification` |
| `'read'` | Get by ID | `getNotification(id: "123")` |
| `'update'` | Mutations | `updateNotification` |
| `'delete'` | Mutations | `deleteNotification` |
| **`'list'`** | **List queries** | **`listNotifications(filter: {...})`** |
| `'subscribe'` | Subscriptions | `onCreateNotification` |
| `'listen'` | Subscription filters | (subscription filtering) |

---

## The Missing Permission

### Current Authorization (BROKEN)
```typescript
Notification: a.model({
    // ...
}).authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    allow.groups(['ADMIN', 'NURSE']).to(['create', 'read', 'update', 'delete', 'subscribe', 'listen'])
    //                                    ❌ MISSING 'list' operation!
])
```

### Why This Breaks
When you explicitly specify `.to([...])` operations, Amplify **only** allows those operations. Since `'list'` is missing:
- ✅ `getNotification(id: "123")` works (uses `'read'`)
- ❌ `listNotifications(filter: {...})` fails (needs `'list'`)
- ✅ `onCreateNotification` works (uses `'subscribe'`)

The `ownerDefinedIn` rule provides implicit list access based on `custom:tenantId`, but the explicit group rules **override** this for group members.

---

## The Fix

Add `'list'` to both **Notification** and **Shift** models:

```typescript
// Notification model
.authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    allow.groups(['ADMIN', 'NURSE']).to(['create', 'read', 'list', 'update', 'delete', 'subscribe', 'listen'])
    //                                                      ^^^^^^ ADDED
])

// Shift model
.authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    allow.groups(['ADMIN']).to(['create', 'read', 'list', 'update', 'delete', 'subscribe', 'listen']),
    allow.groups(['NURSE']).to(['read', 'list', 'subscribe', 'listen'])
    //                                   ^^^^^^ ADDED (both groups)
])
```

---

## Why Other Models Don't Show This Error

### Models WITHOUT explicit `.to()` operations
```typescript
Patient: a.model({
    // ...
}).authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
    // No .to() = ALL operations allowed (including 'list')
])
```

### Models WITH `.to()` but no list queries used (yet)
```typescript
InventoryItem: a.model({
    // ...
}).authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
    //                                    ❌ Also missing 'list' - will fail if listInventoryItems() is called!
])
```

---

## Verification Steps (Post-Fix)

1. **Deploy the schema change:**
   ```bash
   npx ampx sandbox --once
   ```

2. **Test listNotifications query:**
   ```graphql
   query ListNotifications {
     listNotifications(filter: { userId: { eq: "user-123" } }) {
       items {
         id
         message
         read
       }
     }
   }
   ```

3. **Test shift subscription:**
   ```graphql
   subscription OnShiftUpdate {
     onUpdateShift {
       id
       status
       scheduledTime
     }
   }
   ```

4. **Check console for errors** - should be clean now.

---

## Related Models to Audit

These models use explicit `.to()` operations and may also be missing `'list'`:

| Model | Current Operations | Needs `'list'`? | Used in UI? |
|-------|-------------------|-----------------|-------------|
| InventoryItem | `create, read, update, delete` | ❌ Yes | Unknown |
| BillingRecord | `create, read, update, delete` | ❌ Yes | Likely |
| PatientAssessment | `create, read, update, delete` | ❌ Yes | Phase 4 |

**Recommendation:** Add `'list'` to ALL models with explicit `.to()` operations as a preventive measure.

---

## Lessons Learned

1. **When using `.to([...])`**, always include `'list'` if you expect to query collections
2. **'subscribe'/'listen' ≠ 'list'** - they're for real-time updates, not queries
3. **Test both queries AND subscriptions** after authorization changes
4. **Console errors are precise** - "listNotifications on type Query" literally means the `listNotifications` query operation is blocked

---

## Status
- [x] Root cause identified
- [ ] Fix applied (see next commit)
- [ ] Deployed and verified
- [ ] Related models audited

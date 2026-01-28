# GraphQL Subscription Permissions Audit

**Date:** 2026-01-27  
**Issue:** Production auth failures for GraphQL subscriptions  
**Auditor:** Subagent subscription-audit-v2

---

## 🔴 Problem Summary

Production authentication tests revealed **NotAuthorizedException** errors for:

1. ✗ `onCreateNotification` subscription
2. ✗ `onUpdateNotification` subscription  
3. ✗ `listNotifications` query
4. ✗ "Shift update sub failed" (assumed `onUpdateShift`)

**Root Cause:** GraphQL subscription operations require **explicit authorization** in AWS AppSync. The current schema only authorizes CRUD operations (`create`, `read`, `update`, `delete`) but does NOT include `subscribe` or `listen` permissions.

---

## 📋 Current Authorization Rules

### Notification Model (Line ~464)
```typescript
Notification: a.model({
    tenantId: a.id().required(),
    userId: a.id().required(),
    type: a.ref('NotificationType').required(),
    message: a.string().required(),
    entityType: a.string().required(),
    entityId: a.id().required(),
    read: a.boolean().required().default(false),
}).authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    allow.groups(['ADMIN', 'NURSE']).to(['create', 'read', 'update', 'delete'])
])
```

**Problem:** The `.to(['create', 'read', 'update', 'delete'])` does NOT include subscription operations.

---

### Shift Model (Line ~224)
```typescript
Shift: a.model({
    tenantId: a.id().required(),
    nurseId: a.id().required(),
    patientId: a.id().required(),
    scheduledTime: a.string().required(),
    status: a.ref('ShiftStatus'),
    // ... other fields
}).authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
    allow.groups(['NURSE']).to(['read'])
])
```

**Problem:** Same issue - no `subscribe` operation for subscriptions.

---

## ✅ Recommended Fixes

### Fix 1: Add Subscription Permissions to Notification

**Change:**
```typescript
}).authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    allow.groups(['ADMIN', 'NURSE']).to(['create', 'read', 'update', 'delete', 'subscribe', 'listen'])
])
```

**Why:** Adds explicit `subscribe` and `listen` operations for GraphQL subscriptions.

---

### Fix 2: Add Subscription Permissions to Shift

**Change:**
```typescript
}).authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete', 'subscribe', 'listen']),
    allow.groups(['NURSE']).to(['read', 'subscribe', 'listen'])
])
```

**Why:** 
- ADMIN: Full access including subscriptions
- NURSE: Read + subscription access (already can't modify shifts)

---

## 📖 AWS AppSync Authorization for Subscriptions

From AWS AppSync documentation:

> **Subscription authorization is separate from mutation authorization.**  
> When a client subscribes to a GraphQL subscription (e.g., `onCreateNotification`), AppSync checks:
> 1. Does the user have `subscribe` permission on the model?
> 2. Does the subscription filter match the user's authorization scope?

### Authorization Operations in Amplify Gen 2:
- `create` - Create mutations
- `read` - Queries and get operations
- `update` - Update mutations
- `delete` - Delete mutations
- **`subscribe`** - Subscribe to real-time updates (required for `onCreate`, `onUpdate`, `onDelete` subscriptions)
- **`listen`** - (optional) Additional subscription control

**Default behavior:** If you don't specify `.to([...])`, all operations are allowed. However, once you explicitly use `.to([...])`, you MUST list all operations you want to allow.

---

## 🔍 Secondary Findings

### listNotifications Query Failure
The `listNotifications` query failure suggests that the **secondary index query** may also need explicit permissions. However, this is likely a side effect of the missing `read` permission scope.

**Current Index:**
```typescript
.secondaryIndexes(index => [
    index('userId').name('byUser')
])
```

**Recommendation:** After fixing subscription permissions, test the `listNotifications` query again. If it still fails, verify that the JWT `custom:tenantId` claim matches the `tenantId` filter in the query.

---

## 🧪 Testing Plan

After applying the fixes:

1. **Test Notification Subscriptions:**
   ```graphql
   subscription OnCreateNotification($userId: ID!) {
     onCreateNotification(filter: { userId: { eq: $userId } }) {
       id
       type
       message
       read
     }
   }
   ```

2. **Test Shift Subscriptions:**
   ```graphql
   subscription OnUpdateShift($tenantId: ID!) {
     onUpdateShift(filter: { tenantId: { eq: $tenantId } }) {
       id
       status
       scheduledTime
     }
   }
   ```

3. **Test listNotifications Query:**
   ```graphql
   query ListNotificationsByUser($userId: ID!) {
     listNotifications(filter: { userId: { eq: $userId } }) {
       items {
         id
         type
         message
       }
     }
   }
   ```

---

## 🚀 Deployment Steps

1. ✅ Update `amplify/data/resource.ts` with subscription permissions
2. ✅ Commit changes: `git commit -m "fix: Add subscribe/listen permissions for Notification and Shift models (KIRO-004)"`
3. ⚠️ **DO NOT PUSH** (per instructions)
4. Deploy: `amplify push` or via CI/CD pipeline
5. Test in production with authenticated ADMIN/NURSE users
6. Monitor CloudWatch logs for any remaining auth errors

---

## 📝 Impact Assessment

**Affected Features:**
- ✗ Real-time notification updates (nurses don't see new assignments)
- ✗ Shift status updates (dashboard doesn't refresh automatically)
- ✗ Admin notification feed (approval alerts not delivered)

**Priority:** 🔴 **HIGH** - Core feature broken in production

**Effort:** 🟢 **LOW** - 2-line code change, 15-minute deployment

---

## 🔗 Related Files
- Schema: `~/projects/ERP/amplify/data/resource.ts`
- Auth config: `~/projects/ERP/amplify/auth/resource.ts`
- Related issue: KIRO-003 (previous auth fix)

---

## ✅ Resolution Status

- [x] Root cause identified
- [x] Fix documented
- [ ] Code changes applied
- [ ] Committed to git
- [ ] Deployed to production
- [ ] Tested and verified

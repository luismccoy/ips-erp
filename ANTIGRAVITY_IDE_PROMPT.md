# Google IDX (Antigravity IDE) - IPS ERP Frontend Fix Prompt

## 🎯 Project Setup Instructions

### Step 1: Clone/Pull Latest Repository
```bash
# If starting fresh, clone the repository:
git clone https://github.com/luismccoy/ips-erp.git
cd ips-erp

# If repository already exists, pull latest changes:
cd ips-erp
git pull origin main

# Verify you're on the correct branch:
git branch
git status
```

### Step 2: Project Location
**Repository:** https://github.com/luismccoy/ips-erp  
**Project Type:** React + TypeScript + Vite + AWS Amplify Gen 2  
**Current Phase:** Phase 9 Complete (Workflow Compliance)  
**Deployment:** Production (https://main.d2wwgecog8smmr.amplifyapp.com)

---

## 📊 Frontend-Backend Alignment Audit Summary

**Overall Score: 85/100** ✅

### ✅ What's Working Well (No Changes Needed)
1. **Visit Workflow (Phase 9)** - Excellent implementation
   - State machine: DRAFT → SUBMITTED → REJECTED/APPROVED
   - All 5 workflow Lambda functions integrated
   - Audit logging and notifications working
   - Components: `SimpleNurseApp.tsx`, `PendingReviewsPanel.tsx`, `ApprovalModal.tsx`, `RejectionModal.tsx`

2. **AI Features** - All 3 working perfectly
   - `AdminRoster.tsx` → roster-architect Lambda
   - `RipsValidator.tsx` → rips-validator Lambda
   - `EvidenceGenerator.tsx` → glosa-defender Lambda

3. **Core Modules** - Solid implementation
   - `AdminDashboard.tsx` - Dashboard, Audit, Inventory, Roster views
   - `VisitDocumentationForm.tsx` - KARDEX clinical documentation
   - `KardexForm.tsx` - Comprehensive form with vitals, medications, tasks
   - `NotificationBell.tsx` - Real-time workflow notifications
   - `FamilyPortal.tsx` - Read-only approved visits
   - `StaffManagement.tsx` - Nurse CRUD operations

### ❌ Critical Issues (Must Fix)

#### 1. **BillingRecord Model Completely Unused** 🚨
**Impact:** No financial tracking, no revenue reporting  
**Current State:** `ReportingDashboard.tsx` uses 100% mock data  
**Backend Available:** BillingRecord model exists in GraphQL schema  

**Required Changes:**
- Create `src/components/BillingDashboard.tsx` (new file)
- Integrate with BillingRecord GraphQL queries/mutations
- Add real-time financial KPIs
- Remove mock data from `ReportingDashboard.tsx`

**Files to Modify:**
```
src/components/ReportingDashboard.tsx  ← Replace mock data with real queries
src/components/BillingDashboard.tsx    ← NEW FILE (create this)
src/App.tsx                            ← Add billing route (if needed)
```

#### 2. **No Pagination Anywhere** ⚠️
**Impact:** Performance issues with large datasets (1000+ records)  
**Current State:** All list queries fetch ALL records  

**Required Changes:**
- Add pagination to ALL list views
- Implement `limit` and `nextToken` parameters
- Add "Load More" or page number UI

**Files to Modify:**
```
src/components/AdminDashboard.tsx      ← Add pagination to patients, shifts, inventory
src/components/SimpleNurseApp.tsx      ← Add pagination to shifts list
src/components/PendingReviewsPanel.tsx ← Add pagination to pending visits
src/components/FamilyPortal.tsx        ← Add pagination to visit history
src/components/StaffManagement.tsx     ← Add pagination to nurse list
src/components/PatientDashboard.tsx    ← Add pagination to patient list
```

**Pagination Pattern:**
```typescript
const [nextToken, setNextToken] = useState<string | null>(null);
const [items, setItems] = useState<Item[]>([]);

const loadMore = async () => {
  const result = await client.models.Item.list({
    filter: { tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] } },
    limit: 50,
    nextToken: nextToken
  });
  setItems([...items, ...result.data]);
  setNextToken(result.nextToken || null);
};
```

#### 3. **No Real-Time Subscriptions in Key Components** ⚠️
**Impact:** Users must refresh to see updates  

**Files to Modify:**
```
src/components/PendingReviewsPanel.tsx ← Add Visit.onCreate subscription
src/components/AdminDashboard.tsx      ← Add AuditLog.onCreate subscription
```

**Subscription Pattern:**
```typescript
useEffect(() => {
  const sub = client.models.Visit.onCreate({
    filter: { 
      tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] },
      status: { eq: 'SUBMITTED' }
    }
  }).subscribe({
    next: (data) => {
      // Add new visit to list
      setVisits(prev => [data, ...prev]);
    }
  });
  return () => sub.unsubscribe();
}, []);
```

---

## 🚦 Implementation Workflow

### Phase 10: Critical Fixes (Current Phase)

**Priority 1: Add Pagination (1 week)**
1. Create reusable pagination hook: `src/hooks/usePagination.ts`
2. Add pagination to all 6 list components (see list above)
3. Test with 100+ records
4. Update `docs/API_DOCUMENTATION.md`

**Priority 2: Build Billing Module (2-3 weeks)**
1. Create `src/components/BillingDashboard.tsx`
2. Add BillingRecord CRUD operations
3. Integrate with real backend data
4. Replace mock data in `ReportingDashboard.tsx`
5. Add financial charts (revenue, expenses, profit)
6. Update `docs/API_DOCUMENTATION.md`

**Priority 3: Add Real-Time Subscriptions (3-5 days)**
1. Add Visit subscriptions to `PendingReviewsPanel.tsx`
2. Add AuditLog subscriptions to `AdminDashboard.tsx`
3. Test real-time updates
4. Update `docs/API_DOCUMENTATION.md`

---

## 📌 CRITICAL RULES (Follow Strictly)

### ✅ DO:
1. **Work ONLY on frontend** (`src/` directory)
2. **Use existing backend** (no changes to `amplify/` directory)
3. **Follow existing patterns** (see working components as examples)
4. **Test with real backend** (set `VITE_USE_REAL_BACKEND=true`)
5. **Update documentation** (`docs/API_DOCUMENTATION.md` only)
6. **Commit frequently** with descriptive messages
7. **Use TypeScript strictly** (no `any` types)
8. **Follow Colombian IPS context** (Spanish labels, KARDEX terminology)

### 🚨 DON'T:
1. **NO changes to `amplify/` directory** (backend is complete)
2. **NO test files** (`*.test.ts`, `*.spec.ts`)
3. **NO new scripts** in root or `scripts/` directory
4. **NO new dependencies** without approval (use existing packages)
5. **NO breaking changes** to existing working components
6. **NO mock data** in new components (use real backend)
7. **NO multiple documentation files** (only `docs/API_DOCUMENTATION.md`)

---

## 🎯 Specific Tasks for Antigravity IDE

### Task 1: Add Pagination Hook (NEW FILE)
**File:** `src/hooks/usePagination.ts`

```typescript
import { useState, useCallback } from 'react';

interface PaginationOptions<T> {
  limit?: number;
  initialItems?: T[];
}

export function usePagination<T>(options: PaginationOptions<T> = {}) {
  const { limit = 50, initialItems = [] } = options;
  const [items, setItems] = useState<T[]>(initialItems);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async (
    fetchFn: (token: string | null) => Promise<{ data: T[]; nextToken?: string | null }>
  ) => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const result = await fetchFn(nextToken);
      setItems(prev => [...prev, ...result.data]);
      setNextToken(result.nextToken || null);
      setHasMore(!!result.nextToken);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [nextToken, isLoading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setNextToken(null);
    setHasMore(true);
  }, []);

  return {
    items,
    nextToken,
    isLoading,
    hasMore,
    loadMore,
    reset,
    setItems
  };
}
```

### Task 2: Add Pagination to PendingReviewsPanel
**File:** `src/components/PendingReviewsPanel.tsx`

**Changes:**
1. Import `usePagination` hook
2. Replace `useState<Visit[]>` with `usePagination<Visit>`
3. Add "Load More" button at bottom of list
4. Update `useEffect` to use pagination

**Example:**
```typescript
const { items: visits, loadMore, hasMore, isLoading } = usePagination<Visit>({ limit: 50 });

useEffect(() => {
  loadMore(async (token) => {
    const result = await client.models.Visit.list({
      filter: { 
        tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] },
        status: { eq: 'SUBMITTED' }
      },
      limit: 50,
      nextToken: token
    });
    return { data: result.data, nextToken: result.nextToken };
  });
}, []);

// Add at bottom of visit list:
{hasMore && (
  <button onClick={() => loadMore(...)} disabled={isLoading}>
    {isLoading ? 'Cargando...' : 'Cargar Más'}
  </button>
)}
```

### Task 3: Create BillingDashboard Component (NEW FILE)
**File:** `src/components/BillingDashboard.tsx`

**Requirements:**
1. Fetch BillingRecord data from backend
2. Display financial KPIs (total revenue, pending, paid, rejected)
3. Show monthly revenue chart (real data, not mock)
4. Add billing record CRUD operations
5. Use Spanish labels (Colombian context)
6. Follow existing component patterns (glass morphism, Tailwind CSS)

**GraphQL Operations to Use:**
```typescript
// List billing records
const records = await client.models.BillingRecord.list({
  filter: { tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] } },
  limit: 50
});

// Create billing record
await client.models.BillingRecord.create({
  tenantId: MOCK_USER.attributes['custom:tenantId'],
  visitId: 'visit-123',
  amount: 150000,
  status: 'PENDING',
  invoiceNumber: 'INV-2026-001',
  // ... other fields
});

// Update billing record
await client.models.BillingRecord.update({
  id: 'record-123',
  status: 'PAID'
});
```

### Task 4: Update ReportingDashboard
**File:** `src/components/ReportingDashboard.tsx`

**Changes:**
1. Remove all mock data (`monthlyData`, hardcoded stats)
2. Fetch real data from BillingRecord model
3. Calculate KPIs from real data
4. Update charts with real data
5. Add loading states
6. Add empty states (no data)

---

## 📚 Reference Files (Study These First)

### Working Examples to Follow:
1. **Pagination Pattern:** None yet (you'll create the first one)
2. **Real Backend Integration:** `src/components/AdminRoster.tsx` (excellent example)
3. **GraphQL Queries:** `src/api/workflow-api.ts` (workflow operations)
4. **Real-Time Subscriptions:** `src/components/NotificationBell.tsx` (onCreate subscription)
5. **Loading States:** `src/components/AdminDashboard.tsx` (useEffect with loading)
6. **Empty States:** `src/components/SimpleNurseApp.tsx` (no shifts message)
7. **Error Handling:** `src/hooks/useApiCall.ts` (error wrapper)

### Backend Schema Reference:
**File:** `amplify/data/resource.ts` (READ-ONLY, don't modify)

**BillingRecord Model:**
```typescript
BillingRecord: a.model({
  tenantId: a.string().required(),
  visitId: a.id().required(),
  patientId: a.id().required(),
  amount: a.float().required(),
  currency: a.string().default('COP'),
  status: a.enum(['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID']),
  invoiceNumber: a.string(),
  submittedAt: a.datetime(),
  approvedAt: a.datetime(),
  paidAt: a.datetime(),
  notes: a.string(),
  // ... relationships
})
```

---

## 🧪 Testing Instructions

### Test with Real Backend:
1. Set environment variable: `VITE_USE_REAL_BACKEND=true` in `.env.development`
2. Ensure AWS credentials are valid (test users already created)
3. Test users:
   - admin@ips.com (password: TempPass123!)
   - nurse@ips.com (password: TempPass123!)
   - family@ips.com (password: TempPass123!)

### Test Scenarios:
1. **Pagination:**
   - Create 100+ test records
   - Verify "Load More" button appears
   - Verify records load incrementally
   - Verify no duplicate records

2. **Billing Dashboard:**
   - Create test billing records
   - Verify KPIs calculate correctly
   - Verify charts display real data
   - Test CRUD operations

3. **Real-Time Subscriptions:**
   - Open two browser windows
   - Submit visit in one window
   - Verify notification appears in other window
   - Verify pending reviews list updates

---

## 📝 Documentation Updates

**File:** `docs/API_DOCUMENTATION.md`

**Add sections for:**
1. **Pagination Implementation**
   - usePagination hook documentation
   - Example usage in components
   - Performance considerations

2. **Billing Module**
   - BillingRecord model usage
   - CRUD operations
   - Financial KPI calculations
   - Chart data transformations

3. **Real-Time Subscriptions**
   - Subscription patterns
   - Component examples
   - Performance considerations

---

## 🎯 Success Criteria

### Phase 10 Complete When:
- ✅ Pagination implemented in all 6 list components
- ✅ BillingDashboard component created and working
- ✅ ReportingDashboard uses real data (no mock data)
- ✅ Real-time subscriptions added to 2 components
- ✅ All tests pass with real backend
- ✅ Documentation updated
- ✅ Code committed with descriptive messages
- ✅ No TypeScript errors
- ✅ No console errors in browser

### Deployment Checklist:
- ✅ Build succeeds: `npm run build`
- ✅ No TypeScript errors: `npm run type-check`
- ✅ No linting errors: `npm run lint`
- ✅ Frontend deploys to Amplify Hosting
- ✅ Real backend integration tested
- ✅ All 3 user roles tested (admin, nurse, family)

---

## 🚀 Quick Start Commands

```bash
# 1. Pull latest code
cd ips-erp
git pull origin main

# 2. Install dependencies (if needed)
npm install

# 3. Set environment for real backend
echo "VITE_USE_REAL_BACKEND=true" > .env.development

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:5173

# 6. Test with real backend
# Login with: admin@ips.com / TempPass123!

# 7. Build for production
npm run build

# 8. Commit changes
git add .
git commit -m "feat(phase10): add pagination, billing module, real-time subscriptions"
git push origin main
```

---

## 📞 Support & Resources

**Documentation:**
- Full audit report: `docs/FRONTEND_BACKEND_ALIGNMENT_AUDIT.md`
- API documentation: `docs/API_DOCUMENTATION.md`
- Implementation guide: `.kiro/steering/KIRO IMPLEMENTATION GUIDE.md`
- Workflow guide: `.kiro/steering/Mater Workflow.md`

**AWS Resources:**
- Frontend: https://main.d2wwgecog8smmr.amplifyapp.com
- Amplify Console: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d2wwgecog8smmr
- AppSync Console: https://console.aws.amazon.com/appsync/home?region=us-east-1
- CloudWatch Dashboard: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=IPS-ERP-Production-Dashboard

**GitHub:**
- Repository: https://github.com/luismccoy/ips-erp
- Issues: https://github.com/luismccoy/ips-erp/issues

---

## ⚡ Final Notes for Antigravity IDE

1. **Focus on frontend only** - Backend is complete and working
2. **Follow existing patterns** - Study working components first
3. **Test with real backend** - Don't use mock data for new features
4. **Commit frequently** - Small, focused commits with clear messages
5. **Update documentation** - Keep `docs/API_DOCUMENTATION.md` current
6. **Ask before breaking changes** - Existing workflows are production-ready
7. **Prioritize pagination first** - Quick win, high impact
8. **Billing module is critical** - Required for business operations
9. **Real-time subscriptions enhance UX** - But not blocking for launch
10. **Keep it simple** - Less code is better code

**Remember:** The backend is excellent. Your job is to make the frontend match its quality. Focus on the 3 critical gaps (pagination, billing, real-time) and the system will be production-ready for full business operations.

Good luck! 🚀

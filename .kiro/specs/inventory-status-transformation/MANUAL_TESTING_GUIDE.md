# Manual Testing Guide - Inventory Status Transformation

## Overview

This guide provides step-by-step instructions for manually testing the inventory status transformation system. The system converts between GraphQL enum format (backend) and frontend display format (UI).

**Estimated Time:** 45-60 minutes  
**Prerequisites:** Browser with DevTools, AWS credentials (for real backend testing)

---

## Quick Start

### Setup
1. Clone/pull latest code
2. Install dependencies: `npm install`
3. Ensure AWS credentials are valid: `awsc` (for real backend testing)

### Test Execution Order
1. **Mock Backend Mode** (15 minutes) - Test with local mock data
2. **Real Backend Mode** (20 minutes) - Test with AWS AppSync
3. **Transformation Validation** (10 minutes) - Test functions directly
4. **Type Safety** (5 minutes) - Verify TypeScript support

---

## Test Case 1: Mock Backend Mode (15 minutes)

### Objective
Verify the system works correctly with mock data (no transformations applied).

### Setup
1. Open `.env.development`
2. Set `VITE_USE_REAL_BACKEND=false`
3. Save file
4. Start dev server: `npm run dev`
5. Open browser: `http://localhost:5173`

### Test Steps

#### Step 1.1: Verify Environment
- [ ] Check browser console for "Using mock backend" message
- [ ] Verify no AWS-related errors

#### Step 1.2: Navigate to Inventory Dashboard
- [ ] Click "Inventory" in navigation menu
- [ ] Dashboard loads without errors
- [ ] Inventory items are displayed

#### Step 1.3: Verify Status Display
- [ ] Check that all items show lowercase status:
  - ✅ "in-stock" (green badge)
  - ⚠️ "low-stock" (yellow badge)
  - ❌ "out-of-stock" (red badge)
- [ ] Verify badge colors match status
- [ ] Verify status text is readable

#### Step 1.4: Add New Item
1. Click "Add Item" button
2. Fill form:
   - Name: "Test Item Mock"
   - SKU: "TEST-MOCK-001"
   - Quantity: 10
   - Unit: "units"
   - Reorder Level: 5
3. Click "Add Item"
4. Verify:
   - [ ] Item appears in list
   - [ ] Status shows "in-stock"
   - [ ] No console errors

#### Step 1.5: Update Stock to Low
1. Find "Test Item Mock" in list
2. Click "Update Stock" button
3. Set quantity to 3 (below reorder level of 5)
4. Click "Update"
5. Verify:
   - [ ] Status changes to "low-stock"
   - [ ] Badge color changes to yellow
   - [ ] No console errors

#### Step 1.6: Update Stock to Out
1. Click "Update Stock" again
2. Set quantity to 0
3. Click "Update"
4. Verify:
   - [ ] Status changes to "out-of-stock"
   - [ ] Badge color changes to red
   - [ ] No console errors

#### Step 1.7: Navigate to Admin Dashboard
1. Click "Admin" in navigation
2. Click "Dashboard" tab
3. Verify:
   - [ ] Dashboard loads successfully
   - [ ] "Stock Alerts" KPI shows count > 0
   - [ ] Count matches number of low/out-of-stock items

#### Step 1.8: Final Console Check
- [ ] Open browser console (F12)
- [ ] Verify no errors related to transformations
- [ ] Verify no warnings about invalid status values

### Expected Results
✅ All items display with lowercase status  
✅ Status badges render correctly  
✅ Add/update operations work without errors  
✅ Admin dashboard shows correct stock alerts  
✅ No transformation-related console errors

---

## Test Case 2: Real Backend Mode (20 minutes)

### Objective
Verify the system correctly transforms data when using AWS AppSync backend.

### Setup
1. Open `.env.development`
2. Set `VITE_USE_REAL_BACKEND=true`
3. Save file
4. Verify AWS credentials: `aws sts get-caller-identity`
5. Restart dev server: `npm run dev`
6. Open browser: `http://localhost:5173`

### Test Steps

#### Step 2.1: Verify Environment
- [ ] Check browser console for "Using real backend" message
- [ ] Verify AWS AppSync endpoint is configured
- [ ] No authentication errors

#### Step 2.2: Navigate to Inventory Dashboard
- [ ] Click "Inventory" in navigation menu
- [ ] Dashboard loads (may take 2-3 seconds)
- [ ] Inventory items are displayed (or empty state if no data)

#### Step 2.3: Verify Status Display (If Data Exists)
- [ ] Check that all items show lowercase status:
  - ✅ "in-stock" (green badge)
  - ⚠️ "low-stock" (yellow badge)
  - ❌ "out-of-stock" (red badge)
- [ ] Verify badge colors match status
- [ ] Status values are NOT uppercase (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)

#### Step 2.4: Open Browser DevTools
1. Press F12 to open DevTools
2. Switch to "Console" tab
3. Keep console visible for next steps

#### Step 2.5: Add New Item
1. Click "Add Item" button
2. Fill form:
   - Name: "Test Item Real Backend"
   - SKU: "TEST-REAL-001"
   - Quantity: 10
   - Unit: "units"
   - Reorder Level: 5
3. Click "Add Item"
4. **Check Console Output:**
   - [ ] Look for: `Would create item with GraphQL status: IN_STOCK`
   - [ ] Verify status is uppercase with underscores (GraphQL format)
   - [ ] No transformation errors

5. **Check UI:**
   - [ ] Item appears in list with lowercase status "in-stock"
   - [ ] Badge shows green color
   - [ ] No errors in console

#### Step 2.6: Update Stock to Low
1. Find "Test Item Real Backend" in list
2. Click "Update Stock" button
3. Set quantity to 3 (below reorder level of 5)
4. Click "Update"
5. **Check Console Output:**
   - [ ] Look for: `Would update item with GraphQL status: LOW_STOCK`
   - [ ] Verify status is uppercase (GraphQL format)
   - [ ] No transformation errors

6. **Check UI:**
   - [ ] Status changes to "low-stock"
   - [ ] Badge color changes to yellow
   - [ ] No errors in console

#### Step 2.7: Update Stock to Out
1. Click "Update Stock" again
2. Set quantity to 0
3. Click "Update"
4. **Check Console Output:**
   - [ ] Look for: `Would update item with GraphQL status: OUT_OF_STOCK`
   - [ ] Verify status is uppercase (GraphQL format)

5. **Check UI:**
   - [ ] Status changes to "out-of-stock"
   - [ ] Badge color changes to red

#### Step 2.8: Test Pagination (If Applicable)
If you have more than 50 items:
1. Scroll to bottom of inventory list
2. Click "Load More" button
3. Verify:
   - [ ] More items load successfully
   - [ ] All loaded items have lowercase status
   - [ ] No transformation errors in console

#### Step 2.9: Navigate to Admin Dashboard
1. Click "Admin" in navigation
2. Click "Dashboard" tab
3. Verify:
   - [ ] Dashboard loads successfully
   - [ ] "Stock Alerts" KPI shows correct count
   - [ ] Count matches number of low/out-of-stock items
   - [ ] No transformation errors in console

#### Step 2.10: Network Tab Verification (Optional)
1. Open DevTools Network tab
2. Filter for "graphql" requests
3. Click on a GraphQL request
4. Check "Payload" tab
5. Verify:
   - [ ] Mutation variables use uppercase status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
   - [ ] Query responses contain uppercase status
   - [ ] Frontend displays lowercase status

### Expected Results
✅ All items display with lowercase status (transformed from GraphQL)  
✅ Console.log shows GraphQL format (uppercase) for mutations  
✅ Status badges render correctly  
✅ Pagination works with transformed data  
✅ Admin dashboard shows correct stock alerts  
✅ No transformation-related console errors

---

## Test Case 3: Transformation Function Validation (10 minutes)

### Objective
Verify transformation functions work correctly with valid and invalid inputs.

### Setup
1. Keep dev server running
2. Open browser console (F12)
3. Navigate to any page in the app

### Test Steps

#### Step 3.1: Test graphqlToFrontend - Valid Inputs
Copy and paste each line into console, press Enter:

```javascript
// Test IN_STOCK
import { graphqlToFrontend } from './src/utils/inventory-transforms.js';
graphqlToFrontend('IN_STOCK')
// Expected output: "in-stock"
```

```javascript
// Test LOW_STOCK
graphqlToFrontend('LOW_STOCK')
// Expected output: "low-stock"
```

```javascript
// Test OUT_OF_STOCK
graphqlToFrontend('OUT_OF_STOCK')
// Expected output: "out-of-stock"
```

**Verify:**
- [ ] All three return correct lowercase values
- [ ] No errors thrown

#### Step 3.2: Test frontendToGraphQL - Valid Inputs
```javascript
import { frontendToGraphQL } from './src/utils/inventory-transforms.js';

// Test in-stock
frontendToGraphQL('in-stock')
// Expected output: "IN_STOCK"

// Test low-stock
frontendToGraphQL('low-stock')
// Expected output: "LOW_STOCK"

// Test out-of-stock
frontendToGraphQL('out-of-stock')
// Expected output: "OUT_OF_STOCK"
```

**Verify:**
- [ ] All three return correct uppercase values
- [ ] No errors thrown

#### Step 3.3: Test Invalid Inputs
```javascript
// Test invalid GraphQL status
try {
  graphqlToFrontend('INVALID')
} catch (error) {
  console.log('Error caught:', error.message)
}
// Expected: Error message listing valid values
```

```javascript
// Test invalid frontend status
try {
  frontendToGraphQL('invalid')
} catch (error) {
  console.log('Error caught:', error.message)
}
// Expected: Error message listing valid values
```

**Verify:**
- [ ] Both throw descriptive errors
- [ ] Error messages list valid values
- [ ] Errors are caught properly

#### Step 3.4: Test Null Handling
```javascript
import { graphqlToFrontendSafe, frontendToGraphQLSafe } from './src/utils/inventory-transforms.js';

// Test null handling
graphqlToFrontendSafe(null)
// Expected output: null

graphqlToFrontendSafe(undefined)
// Expected output: null

frontendToGraphQLSafe(null)
// Expected output: null

frontendToGraphQLSafe(undefined)
// Expected output: null
```

**Verify:**
- [ ] All return null without throwing errors
- [ ] No console errors

#### Step 3.5: Test Bidirectional Consistency
```javascript
// Test round-trip transformations
frontendToGraphQL(graphqlToFrontend('IN_STOCK')) === 'IN_STOCK'
// Expected: true

frontendToGraphQL(graphqlToFrontend('LOW_STOCK')) === 'LOW_STOCK'
// Expected: true

frontendToGraphQL(graphqlToFrontend('OUT_OF_STOCK')) === 'OUT_OF_STOCK'
// Expected: true
```

**Verify:**
- [ ] All return true
- [ ] Round-trip transformations preserve original values

#### Step 3.6: Test Inverse Consistency
```javascript
// Test reverse round-trip transformations
graphqlToFrontend(frontendToGraphQL('in-stock')) === 'in-stock'
// Expected: true

graphqlToFrontend(frontendToGraphQL('low-stock')) === 'low-stock'
// Expected: true

graphqlToFrontend(frontendToGraphQL('out-of-stock')) === 'out-of-stock'
// Expected: true
```

**Verify:**
- [ ] All return true
- [ ] Reverse round-trip transformations preserve original values

### Expected Results
✅ Valid inputs transform correctly in both directions  
✅ Invalid inputs throw descriptive errors  
✅ Null/undefined handled safely  
✅ Bidirectional consistency verified  
✅ Inverse consistency verified

---

## Test Case 4: Type Safety Verification (5 minutes)

### Objective
Verify TypeScript type safety and IntelliSense support.

### Setup
1. Open VS Code (or compatible IDE)
2. Ensure TypeScript language server is active

### Test Steps

#### Step 4.1: Open InventoryDashboard.tsx
1. Open `src/components/InventoryDashboard.tsx`
2. Find line with `graphqlToFrontendSafe` function call
3. Hover mouse over the function name
4. **Verify:**
   - [ ] IntelliSense popup appears
   - [ ] Shows function signature with types
   - [ ] Shows JSDoc documentation
   - [ ] Documentation explains when to use the function

#### Step 4.2: Check Status Field Documentation
1. Open `src/types.ts`
2. Find `InventoryItem` type definition
3. Find the `status` field
4. Hover mouse over `status`
5. **Verify:**
   - [ ] JSDoc comment appears
   - [ ] Explains dual format system (GraphQL vs Frontend)
   - [ ] References transformation functions
   - [ ] Includes usage examples

#### Step 4.3: Test Type Checking
1. In `InventoryDashboard.tsx`, add a test line:
```typescript
const testStatus: 'in-stock' | 'low-stock' | 'out-of-stock' = 'invalid';
```
2. **Verify:**
   - [ ] TypeScript shows red squiggly underline
   - [ ] Error message indicates type mismatch
   - [ ] Suggests valid values

3. Delete the test line

#### Step 4.4: Test Type Narrowing
1. Open `src/utils/inventory-transforms.ts`
2. Find `isGraphQLInventoryStatus` function
3. Verify the return type is `value is GraphQLInventoryStatus`
4. **Verify:**
   - [ ] Function uses type predicate syntax
   - [ ] Enables TypeScript type narrowing
   - [ ] JSDoc explains type guard behavior

#### Step 4.5: Verify No TypeScript Errors
1. Open VS Code Problems panel (Ctrl+Shift+M)
2. Filter for TypeScript errors
3. **Verify:**
   - [ ] No errors in `inventory-transforms.ts`
   - [ ] No errors in `InventoryDashboard.tsx`
   - [ ] No errors in `AdminDashboard.tsx`
   - [ ] No errors related to status transformations

### Expected Results
✅ IntelliSense shows correct type signatures  
✅ JSDoc documentation is visible  
✅ TypeScript enforces type safety  
✅ Type guards enable type narrowing  
✅ No TypeScript compilation errors

---

## Test Case 5: Status Calculation Logic (5 minutes)

### Objective
Verify status is calculated correctly based on quantity and reorder level.

### Setup
1. Use either Mock or Real backend mode
2. Navigate to Inventory Dashboard

### Test Steps

#### Step 5.1: Create Item with Quantity 0
1. Click "Add Item"
2. Fill form:
   - Name: "Zero Quantity Test"
   - Quantity: 0
   - Reorder Level: 5
3. Click "Add Item"
4. **Verify:**
   - [ ] Status shows "out-of-stock"
   - [ ] Badge is red

#### Step 5.2: Create Item with Quantity > 0
1. Click "Add Item"
2. Fill form:
   - Name: "In Stock Test"
   - Quantity: 10
   - Reorder Level: 5
3. Click "Add Item"
4. **Verify:**
   - [ ] Status shows "in-stock"
   - [ ] Badge is green

#### Step 5.3: Update Stock to 0
1. Find "In Stock Test" item
2. Click "Update Stock"
3. Set quantity to 0
4. Click "Update"
5. **Verify:**
   - [ ] Status changes to "out-of-stock"
   - [ ] Badge changes to red

#### Step 5.4: Update Stock to ≤ Reorder Level
1. Click "Update Stock" again
2. Set quantity to 3 (reorder level is 5)
3. Click "Update"
4. **Verify:**
   - [ ] Status changes to "low-stock"
   - [ ] Badge changes to yellow

#### Step 5.5: Update Stock to > Reorder Level
1. Click "Update Stock" again
2. Set quantity to 10 (above reorder level of 5)
3. Click "Update"
4. **Verify:**
   - [ ] Status changes to "in-stock"
   - [ ] Badge changes to green

### Expected Results
✅ Quantity 0 → out-of-stock  
✅ Quantity > 0 → in-stock  
✅ Quantity ≤ reorder level → low-stock  
✅ Quantity > reorder level → in-stock  
✅ Status updates correctly on quantity changes

---

## Troubleshooting

### Issue: "Cannot find module" error
**Solution:** Run `npm install` to ensure all dependencies are installed

### Issue: AWS credentials expired
**Solution:** Run `awsc` to refresh credentials

### Issue: Dev server won't start
**Solution:** 
1. Kill any existing processes: `pkill -f vite`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Restart: `npm run dev`

### Issue: Transformations not working
**Solution:**
1. Check `.env.development` has correct `VITE_USE_REAL_BACKEND` value
2. Restart dev server after changing environment variables
3. Clear browser cache (Ctrl+Shift+R)

### Issue: Console shows transformation errors
**Solution:**
1. Check that backend data uses correct format (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
2. Verify transformation functions are imported correctly
3. Check for typos in status values

---

## Test Completion Checklist

### Mock Backend Mode
- [ ] Environment configured correctly
- [ ] Inventory displays with lowercase status
- [ ] Status badges render correctly
- [ ] Add item works without errors
- [ ] Update stock works without errors
- [ ] Admin dashboard shows correct alerts
- [ ] No console errors

### Real Backend Mode
- [ ] Environment configured correctly
- [ ] AWS credentials valid
- [ ] Inventory displays with lowercase status
- [ ] Console.log shows GraphQL format for mutations
- [ ] Status badges render correctly
- [ ] Add item works without errors
- [ ] Update stock works without errors
- [ ] Pagination works (if applicable)
- [ ] Admin dashboard shows correct alerts
- [ ] No transformation errors

### Transformation Functions
- [ ] Valid inputs transform correctly
- [ ] Invalid inputs throw errors
- [ ] Null handling works
- [ ] Bidirectional consistency verified
- [ ] Inverse consistency verified

### Type Safety
- [ ] IntelliSense shows documentation
- [ ] TypeScript enforces types
- [ ] Type guards work correctly
- [ ] No compilation errors

### Status Calculation
- [ ] Quantity 0 → out-of-stock
- [ ] Quantity > 0 → in-stock
- [ ] Quantity ≤ reorder level → low-stock
- [ ] Quantity > reorder level → in-stock

---

## Reporting Results

After completing all tests, document your findings:

1. **Update Test Report:** `.kiro/specs/inventory-status-transformation/TASK_5_TEST_REPORT.md`
2. **Mark each test step:** ✅ PASSED, ❌ FAILED, or ⚠️ ISSUE
3. **Document issues:** Include error messages, screenshots, steps to reproduce
4. **Calculate pass rate:** (Passed tests / Total tests) × 100%
5. **Create summary:** Overall assessment and recommendations

---

## Next Steps After Testing

1. **If all tests pass:**
   - Update test report with ✅ PASSED status
   - Proceed to Task 6: Documentation and Cleanup
   - Update API_DOCUMENTATION.md

2. **If tests fail:**
   - Document failures in test report
   - Create bug tickets for issues
   - Fix issues and re-test
   - Update implementation summaries

3. **If issues found:**
   - Categorize as Critical, High, Medium, or Low priority
   - Create action items for each issue
   - Assign to appropriate team member
   - Schedule follow-up testing

---

**Testing Guide Version:** 1.0  
**Last Updated:** 2026-01-23  
**Estimated Completion Time:** 45-60 minutes


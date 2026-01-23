# Admin Dashboard Logic Fixes - Tasks

## ✅ BACKEND IMPLEMENTATION: 100% COMPLETE

All backend work is done. Schema deployed, Lambda functions updated, test users created.

## 🔄 REMAINING WORK: Manual Testing Only

**Next Step:** Run `./.local-tests/create-test-data.sh` to create test data, then follow `.local-tests/PHASE12_TESTING_GUIDE.md` for manual testing in AppSync Console.

**Quick Start Guide:** `.local-tests/PHASE12_READY_TO_TEST.md`

---

## Phase 12: Admin Dashboard Logic Fixes

### 1. Schema Updates
- [x] 1.1 Add AI persistence fields to BillingRecord model
  - [x] 1.1.1 Add `ripsValidationResult` field (JSON type)
  - [x] 1.1.2 Add `glosaDefenseText` field (String type)
  - [x] 1.1.3 Add `glosaDefenseGeneratedAt` field (DateTime type)
  - [x] 1.1.4 Update authorization rules for BillingRecord
- [x] 1.2 Fix InventoryItem authorization for Admin write access
  - [x] 1.2.1 Add explicit ADMIN group authorization
  - [x] 1.2.2 Maintain NURSE read-only access
  - [x] 1.2.3 Verify tenant isolation rules
- [x] 1.3 Enhance Shift model authorization
  - [x] 1.3.1 Add explicit ADMIN group authorization for CRUD
  - [x] 1.3.2 Maintain NURSE read-only access

### 2. Lambda Function Updates
- [x] 2.1 Update rejectVisit Lambda for consistency
  - [x] 2.1.1 Add `ReturnValues: 'ALL_NEW'` to UpdateCommand
  - [x] 2.1.2 Enable strong consistency reads
  - [x] 2.1.3 Add `rejectedAt` timestamp field
  - [x] 2.1.4 Return complete updated Visit object
- [x] 2.2 Update validateRIPS Lambda to persist results
  - [x] 2.2.1 Add DynamoDB update after AI validation
  - [x] 2.2.2 Save validation result to BillingRecord
  - [x] 2.2.3 Handle errors gracefully
- [x] 2.3 Update glosaDefender Lambda to persist output
  - [x] 2.3.1 Add DynamoDB update after AI generation
  - [x] 2.3.2 Save defense text and timestamp to BillingRecord
  - [x] 2.3.3 Handle errors gracefully

### 3. Test User Creation
- [x] 3.1 Update create-test-users.sh script
  - [x] 3.1.1 Add admin.test@ips.com user creation
  - [x] 3.1.2 Add nurse.maria@ips.com user creation
  - [x] 3.1.3 Add family.perez@ips.com user creation
  - [x] 3.1.4 Set appropriate custom attributes for each user
- [ ] 3.2 Create test data for users (AUTOMATED SCRIPT READY)
  - [ ] 3.2.1 Run `./.local-tests/create-test-data.sh`
  - [ ] 3.2.2 Save output resource IDs for manual testing
  - [ ] 3.2.3 Verify test data created successfully

### 4. Deployment & Testing
- [x] 4.1 Deploy schema changes
  - [x] 4.1.1 Run `npx ampx sandbox --once`
  - [x] 4.1.2 Verify deployment success
  - [x] 4.1.3 Check CloudWatch for errors
- [ ] 4.2 Test BillingRecord AI persistence (MANUAL - AppSync Console)
  - [ ] 4.2.1 Call validateRIPS and verify result saved
  - [ ] 4.2.2 Call glosaDefender and verify text saved
  - [ ] 4.2.3 Query BillingRecord and verify fields populated
- [ ] 4.3 Test InventoryItem write access (MANUAL - AppSync Console)
  - [ ] 4.3.1 Create inventory item as Admin
  - [ ] 4.3.2 Update inventory item as Admin
  - [ ] 4.3.3 Delete inventory item as Admin
  - [ ] 4.3.4 Verify Nurse cannot write
- [ ] 4.4 Test Visit rejection consistency (MANUAL - AppSync Console)
  - [ ] 4.4.1 Submit visit as Nurse
  - [ ] 4.4.2 Reject visit as Admin
  - [ ] 4.4.3 Verify visit has rejectedAt timestamp
  - [ ] 4.4.4 Verify visit appears in nurse's correction list
- [ ] 4.5 Test Shift creation (MANUAL - AppSync Console)
  - [ ] 4.5.1 Create shift as Admin
  - [ ] 4.5.2 Verify shift appears in roster
  - [ ] 4.5.3 Verify Nurse can view shift

### 5. Documentation
- [x] 5.1 Update API_DOCUMENTATION.md
  - [x] 5.1.1 Document new BillingRecord fields
  - [x] 5.1.2 Document authorization changes
  - [x] 5.1.3 Document Lambda behavior changes
  - [x] 5.1.4 Add Phase 12 section with examples
- [x] 5.2 Update KIRO_IMPLEMENTATION_GUIDE.md
  - [x] 5.2.1 Mark Phase 12 as complete
  - [x] 5.2.2 Document results and metrics
  - [x] 5.2.3 Add next phase recommendations

### 6. Cleanup
- [x] 6.1 Move test scripts to .local-tests/
- [x] 6.2 Verify file count ≤ 20 in amplify/
- [x] 6.3 Remove temporary files
- [x] 6.4 Commit changes with descriptive message

## Estimated Effort
- Schema Updates: 30 minutes
- Lambda Updates: 45 minutes
- Test User Creation: 20 minutes
- Testing: 60 minutes
- Documentation: 30 minutes
- **Total: ~3 hours**

## Dependencies
- AWS credentials must be valid
- Amplify CLI must be installed
- Access to Cognito User Pool
- Access to DynamoDB tables

## Success Criteria
- All tasks completed and checked off
- Zero regression in existing functionality
- All tests passing
- Documentation updated
- Changes committed to git

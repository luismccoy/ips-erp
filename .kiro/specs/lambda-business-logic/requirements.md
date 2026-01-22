# Lambda Business Logic Testing - Requirements

**Feature:** Real-Integration Test Harness for IPS ERP Lambda functions  
**Created:** 2026-01-21  
**Status:** Draft  
**Approach:** Two-lane testing (Deterministic + AI-in-the-loop with VCR recording)

---

## 1. Overview

The IPS ERP backend includes three critical Lambda functions that implement complex business logic:
1. **Roster Architect** - AI-powered nurse shift assignment optimization
2. **RIPS Validator** - Colombian health ministry compliance validation
3. **Glosa Defender** - AI-powered billing dispute defense letter generation

These functions are deployed and operational. We need to validate their business logic using **real AWS services** and **real AI calls** (no mocks), while maintaining cost control and repeatability through VCR-style recording.

### Testing Philosophy

**NO MOCKS. Use real stuff:**
- Real Lambda invocations via AWS SDK
- Real DynamoDB operations
- Real Bedrock AI calls (Claude 3.5 Sonnet)
- Real test fixtures (synthetic, non-PHI Colombian data)

**Two Testing Lanes:**
1. **Deterministic Rules** - Fast unit tests for validation logic (no AI needed)
2. **AI-in-the-loop** - Integration tests with real model calls, using VCR recording for repeatability

---

## 2. Testing Strategy

### 2.1 AI Recording/Replay (VCR Pattern)

**LIVE Mode:**
- Calls real Bedrock API
- Records: request hash, model ID, timestamp, response, latency, tokens
- Stores to S3: `s3://ips-erp-test-recordings/ai-recordings/<function>/<hash>.json`
- Used for: nightly regression, performance validation

**RECORDED Mode:**
- Replays previously recorded real responses
- Fails if recording doesn't exist (forces LIVE run first)
- Used for: fast dev loops, deterministic CI tests

**Key Point:** Recordings come ONLY from real AI calls, never hand-authored.

### 2.2 Test Environment

**Dedicated Test Stage:**
- Stage name: `test`
- Separate DynamoDB tables (or partition keys)
- Environment variables:
  - `STAGE=test`
  - `AI_TEST_MODE=LIVE|RECORDED`
  - `AI_RECORDINGS_S3_BUCKET=ips-erp-test-recordings`
  - `AI_RECORDINGS_PREFIX=ai-recordings`
  - `LOG_LEVEL=INFO`

### 2.3 Test Execution Workflow

```bash
# 1. Unit tests (deterministic, no AI) - FAST
npm run test:unit

# 2. Integration tests (real Lambda + DynamoDB) - MEDIUM
npm run test:integration

# 3. AI tests with recordings (fast dev loop) - MEDIUM
npm run test:ai:recorded

# 4. AI tests with live calls (nightly/regression) - SLOW
npm run test:ai:live

# 5. Performance tests - SLOW
npm run test:perf

# 6. Refresh recordings from live calls
npm run test:recordings:refresh
```

---

## 3. User Stories

### 3.1 Roster Architect

**As an** IPS administrator  
**I want** the roster generation system to assign nurses to shifts optimally  
**So that** patients receive care from qualified nurses with minimal travel time

**Acceptance Criteria:**
- AC 2.1.1: Nurses are only assigned to shifts if they have the required skills
- AC 2.1.2: Travel distance between nurse location and patient location is minimized
- AC 2.1.3: All unassigned shifts are considered for assignment
- AC 2.1.4: The system handles cases where no qualified nurses are available
- AC 2.1.5: The system handles cases where multiple nurses are equally qualified
- AC 2.1.6: Assignment results are returned in valid JSON format
- AC 2.1.7: The function completes within 60 seconds (timeout limit)
- AC 2.1.8: The function gracefully handles AI model failures

### 3.2 RIPS Validator

**As an** IPS billing coordinator  
**I want** billing records to be validated against Colombian RIPS requirements  
**So that** submissions to EPS are compliant and avoid rejections

**Acceptance Criteria:**
- AC 2.2.1: All required fields (date, procedures, diagnosis, eps) are validated
- AC 2.2.2: Date format must be ISO 8601 (YYYY-MM-DD)
- AC 2.2.3: Dates in the future are flagged with warnings
- AC 2.2.4: CUPS codes must be exactly 6 digits
- AC 2.2.5: ICD-10 diagnosis codes must match format: Letter + 2 digits + optional decimal
- AC 2.2.6: EPS codes must be at least 3 characters
- AC 2.2.7: Total amount cannot be negative
- AC 2.2.8: Zero amounts trigger warnings
- AC 2.2.9: Missing optional fields (patientId, shiftId) trigger warnings
- AC 2.2.10: Validation results include both errors and warnings
- AC 2.2.11: The function completes within 30 seconds (timeout limit)

### 3.3 Glosa Defender

**As an** IPS billing coordinator  
**I want** AI-generated defense letters for billing disputes  
**So that** I can respond professionally to EPS rejections with clinical justification

**Acceptance Criteria:**
- AC 2.3.1: Defense letter is generated in Spanish
- AC 2.3.2: Letter includes formal structure (date, recipient, subject, body, closing)
- AC 2.3.3: Letter cites relevant Colombian health regulations
- AC 2.3.4: Letter references patient vital signs from history
- AC 2.3.5: Letter references clinical notes from shifts
- AC 2.3.6: Letter addresses the specific rejection reason
- AC 2.3.7: Letter requests formal acceptance of the billing
- AC 2.3.8: The function provides a fallback template if AI fails
- AC 2.3.9: The function completes within 60 seconds (timeout limit)
- AC 2.3.10: Response includes success status and generation timestamp

---

## 4. Edge Cases and Error Scenarios

### 4.1 Roster Architect Edge Cases

**EC 3.1.1: Empty Inputs**
- No nurses available
- No unassigned shifts
- Both nurses and shifts arrays are empty

**EC 3.1.2: Skill Mismatches**
- No nurses have required skills for any shift
- Some shifts have no skill requirements
- Nurses have overlapping skill sets

**EC 3.1.3: Location Data**
- Missing GPS coordinates for nurses
- Missing GPS coordinates for shifts
- Invalid coordinate values (out of range)

**EC 3.1.4: AI Model Issues**
- Bedrock API timeout
- Bedrock API returns non-JSON response
- Bedrock API returns malformed JSON
- Bedrock API access denied (permissions)

**EC 3.1.5: Scale Testing**
- 100+ nurses and 100+ shifts
- Single nurse, many shifts
- Many nurses, single shift

### 3.2 RIPS Validator Edge Cases

**EC 3.2.1: Missing Required Fields**
- Missing date
- Missing procedures array
- Empty procedures array
- Missing diagnosis
- Missing EPS

**EC 3.2.2: Invalid Date Formats**
- Non-ISO format (DD/MM/YYYY)
- Invalid date values (February 30)
- Date in the future
- Date far in the past (>10 years)

**EC 3.2.3: Invalid CUPS Codes**
- Less than 6 digits
- More than 6 digits
- Contains letters or special characters
- Empty string in procedures array

**EC 3.2.4: Invalid ICD-10 Codes**
- Missing letter prefix
- Wrong number of digits
- Invalid decimal format
- Lowercase letters

**EC 3.2.5: Invalid EPS Codes**
- Empty string
- Single character
- Special characters only

**EC 3.2.6: Invalid Amounts**
- Negative values
- Zero values
- Extremely large values (>1 billion)
- Non-numeric values

### 3.3 Glosa Defender Edge Cases

**EC 3.3.1: Missing Input Data**
- Missing billing record fields
- Missing patient history
- Empty vital signs array
- Empty clinical notes array

**EC 3.3.2: Invalid Patient Data**
- Missing patient name
- Missing patient age
- Invalid vital signs values (negative, out of range)

**EC 3.3.3: AI Model Issues**
- Bedrock API timeout
- Bedrock API returns empty response
- Bedrock API access denied
- Response exceeds token limit

**EC 3.3.4: Language and Format**
- Letter not in Spanish
- Missing formal structure elements
- No regulation citations
- No clinical justification

---

## 4. Regulatory Compliance Requirements

### 4.1 Colombian RIPS Standards (Resolución 2275)

**REG 4.1.1: CUPS Code Format**
- Must be exactly 6 numeric digits
- Must correspond to valid Colombian procedure codes
- Reference: Resolución 2275 de 2014

**REG 4.1.2: ICD-10 Code Format**
- Must follow international ICD-10 format
- Must be valid for Colombian health system
- Reference: CIE-10 Colombia

**REG 4.1.3: EPS Validation**
- Must be a registered Colombian health insurance provider
- Common providers: SURA, SANITAS, COMPENSAR, FAMISANAR, SALUD_TOTAL

**REG 4.1.4: Date Requirements**
- Must be in ISO 8601 format
- Cannot be in the future
- Must be within reasonable timeframe (not >1 year old)

### 4.2 Colombian Health Regulations for Glosa Defense

**REG 4.2.1: Required Regulation Citations**
- Resolución 3100 de 2019 (billing procedures)
- Ley 100 de 1993 (health system law)
- Resolución 1995 de 1999 (electronic health records)

**REG 4.2.2: Clinical Justification Requirements**
- Must reference patient vital signs
- Must reference clinical notes
- Must explain medical necessity
- Must address rejection reason specifically

---

## 5. Performance Requirements

### 5.1 Response Time Targets

**PERF 5.1.1: Roster Architect**
- Target: <5 seconds for typical workload (10 nurses, 20 shifts)
- Maximum: 60 seconds (Lambda timeout)
- Scale: Must handle up to 100 nurses and 100 shifts

**PERF 5.1.2: RIPS Validator**
- Target: <500ms for single billing record
- Maximum: 30 seconds (Lambda timeout)
- Scale: Must validate records with up to 50 procedures

**PERF 5.1.3: Glosa Defender**
- Target: <10 seconds for typical case
- Maximum: 60 seconds (Lambda timeout)
- Scale: Must handle patient histories with 100+ vital signs records

### 5.2 Reliability Requirements

**PERF 5.2.1: Error Rate**
- Target: <0.1% error rate under normal conditions
- Must handle AI model failures gracefully
- Must provide meaningful error messages

**PERF 5.2.2: Availability**
- Target: 99.9% availability
- Must handle AWS service disruptions
- Must have fallback mechanisms

---

## 6. Data Quality Requirements

### 6.1 Roster Architect Data Quality

**DQ 6.1.1: Skill Matching Accuracy**
- Must correctly identify skill matches (100% accuracy)
- Must not assign nurses without required skills (0% false positives)

**DQ 6.1.2: Distance Calculation Accuracy**
- Must use correct GPS distance formula (Haversine)
- Must handle edge cases (same location, antipodal points)

### 6.2 RIPS Validator Data Quality

**DQ 6.2.1: Validation Accuracy**
- Must correctly identify all invalid fields (100% recall)
- Must not flag valid fields as invalid (0% false positives)

**DQ 6.2.2: Warning Appropriateness**
- Warnings should be actionable
- Warnings should not block valid submissions

### 6.3 Glosa Defender Data Quality

**DQ 6.3.1: Letter Quality**
- Must be grammatically correct Spanish
- Must be professionally formatted
- Must include all required elements

**DQ 6.3.2: Clinical Accuracy**
- Must accurately reference patient data
- Must not fabricate information
- Must correctly cite regulations

---

## 7. Security and Privacy Requirements

### 7.1 Data Protection

**SEC 7.1.1: Patient Data Handling**
- Must not log sensitive patient information
- Must comply with Colombian data protection law (Ley 1581 de 2012)
- Must maintain multi-tenant data isolation

**SEC 7.1.2: AI Model Security**
- Must not expose patient data to unauthorized systems
- Must use secure Bedrock API calls
- Must handle API credentials securely

---

## 8. Implementation Deliverables

### 8.1 Test Harness Structure

```
.local-tests/test-harness/
├── README.md                    # Complete testing guide
├── fixtures/                    # Synthetic Colombian test data
│   ├── nurses.json
│   ├── shifts.json
│   ├── rips-records.json
│   └── glosa-scenarios.json
├── unit/                        # Deterministic tests (no AI)
│   ├── rips-validator.test.ts
│   └── validation-rules.test.ts
├── integration/                 # Real Lambda + DynamoDB tests
│   ├── roster-architect.test.ts
│   ├── rips-validator.test.ts
│   └── glosa-defender.test.ts
├── performance/                 # Load tests
│   └── load-test.ts
├── ai-client-wrapper.ts         # VCR recording/replay logic
├── test-helpers.ts              # DynamoDB seed/cleanup
└── run-tests.sh                 # Main test runner
```

### 8.2 Lambda Code Changes (Minimal)

**Add AI client wrapper to each AI-using Lambda:**
- `amplify/functions/roster-architect/ai-client.ts`
- `amplify/functions/glosa-defender/ai-client.ts`

**Wrapper responsibilities:**
- Check `AI_TEST_MODE` environment variable
- LIVE: Call Bedrock, save recording to S3
- RECORDED: Load recording from S3, return cached response
- Generate stable request hash for recording lookup

### 8.3 Test Scripts (in .local-tests/)

```bash
# Unit tests (fast, deterministic)
npm run test:unit

# Integration tests (real Lambda invocations)
npm run test:integration

# AI tests with recordings (fast dev loop)
npm run test:ai:recorded

# AI tests with live calls (nightly)
npm run test:ai:live

# Performance tests
npm run test:perf

# Refresh recordings
npm run test:recordings:refresh
```

### 8.4 AWS Resources Needed

1. **S3 Bucket for Recordings:**
   - Name: `ips-erp-test-recordings`
   - Prefix: `ai-recordings/`
   - Lifecycle: Keep recordings for 90 days

2. **Test Environment Variables:**
   - Set in Lambda configuration for test stage
   - `STAGE=test`
   - `AI_TEST_MODE=LIVE` or `RECORDED`
   - `AI_RECORDINGS_S3_BUCKET=ips-erp-test-recordings`

3. **IAM Permissions:**
   - Lambda execution role needs S3 read/write to recordings bucket
   - Test runner needs Lambda invoke permissions

---

## 9. Testing Scope

### 9.1 In Scope

- Unit testing of deterministic validation logic (80%+ coverage target)
- Integration testing with real Lambda invocations
- AI-in-the-loop testing with VCR recording/replay
- Performance testing under load (real RECORDED mode)
- Edge case testing with synthetic Colombian data
- Regulatory compliance validation

### 9.2 Out of Scope

- Load testing beyond 1000 concurrent requests
- Testing of AWS infrastructure itself (DynamoDB, AppSync internals)
- Frontend integration testing (covered in Phase 8)
- Testing with real PHI data (only synthetic fixtures)

---

## 10. Success Criteria

**The Lambda business logic testing is considered successful when:**

1. ✅ All acceptance criteria validated with real Lambda invocations
2. ✅ All edge cases covered with synthetic Colombian test data
3. ✅ All regulatory requirements verified (RIPS, ICD-10, Colombian health laws)
4. ✅ Performance targets met: Roster <5s, Validation <500ms, Defense <10s
5. ✅ Test coverage >80% for deterministic validation modules
6. ✅ AI recordings captured from real Bedrock calls (no hand-authored mocks)
7. ✅ All tests pass in both LIVE and RECORDED modes
8. ✅ Test harness documented with clear commands

---

## 11. Dependencies

- AWS Bedrock access (Claude 3.5 Sonnet) - already configured
- S3 bucket for AI recordings - needs creation
- Test stage Lambda functions - already deployed
- Colombian CUPS and ICD-10 code references - for fixtures
- AWS SDK for Lambda invocation - for integration tests

---

## 12. Risks and Mitigations

**RISK 12.1: AI Model Cost**
- Risk: Frequent LIVE tests could incur high Bedrock costs
- Mitigation: Use RECORDED mode for dev/CI, LIVE only for nightly/regression

**RISK 12.2: Recording Staleness**
- Risk: Recordings may become outdated as model behavior changes
- Mitigation: Periodic refresh (weekly), version recordings with model ID

**RISK 12.3: Regulatory Changes**
- Risk: Colombian health regulations may change
- Mitigation: Parameterize validation rules, maintain regulation reference docs

**RISK 12.4: Test Data Privacy**
- Risk: Accidental inclusion of real patient data
- Mitigation: Use only synthetic fixtures, automated PHI detection in CI

---

## 13. Execution Plan (Implementation Order)

### Phase 1: Setup (Day 1)
1. Create S3 bucket for AI recordings
2. Add AI client wrapper to roster-architect and glosa-defender
3. Create test fixtures (synthetic Colombian data)

### Phase 2: Deterministic Tests (Day 2)
4. Implement unit tests for RIPS validator (80%+ coverage)
5. Test ICD-10 format validation
6. Test CUPS code validation
7. Test edge cases (missing fields, invalid formats)

### Phase 3: Integration Tests (Day 3)
8. Implement Lambda invocation tests
9. Add DynamoDB seed/cleanup helpers
10. Test roster-architect with RECORDED mode
11. Test glosa-defender with RECORDED mode

### Phase 4: Performance Tests (Day 4)
12. Implement load test script
13. Measure p50/p90/p99 latencies
14. Validate against performance targets

### Phase 5: Documentation & CI (Day 5)
15. Write test-harness/README.md
16. Add npm scripts for all test modes
17. Create checklist for running tests
18. Document recording refresh process

---

## 14. Open Questions

1. ✅ **RESOLVED:** Use real Bedrock API with VCR recording (no mocks)
2. What is the acceptable false positive rate for RIPS validation warnings? → **0.1%**
3. Should roster generation prioritize skill matching or distance minimization? → **Skills first, then distance**
4. How should we handle ties in roster assignment? → **First qualified nurse wins (deterministic)**
5. What is the minimum acceptable quality for AI-generated defense letters? → **Must include all required elements (regulations, vitals, clinical notes)**

---

**Next Steps:**
1. Review and approve requirements
2. Create design document with test strategy
3. Create tasks document with implementation plan
4. Begin test implementation

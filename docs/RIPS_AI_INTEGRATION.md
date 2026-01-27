# RIPS AI Validator Integration

**Date**: 2026-01-27  
**Commit**: `3f22f6d051c6dd9fd227e0ff9f683e8cdfb08236`  
**Status**: ✅ Complete

## Summary

Successfully integrated AI-powered Colombian RIPS compliance validation into the ERP system using AWS Bedrock (Claude 3.5 Sonnet).

## Changes Made

### 1. New File: `amplify/functions/rips-validator/ai-client.ts` (443 lines)

Created a comprehensive AI client with:

- **VCR-style recording/replay system** for testing
  - `LIVE` mode: Calls real Bedrock API and saves recordings to S3
  - `RECORDED` mode: Replays previously recorded responses from S3
  
- **`validateRIPSWithAI()` function** that:
  - Constructs expert prompt for Colombian RIPS validation
  - Validates CUPS codes, ICD-10 diagnoses, EPS data
  - Analyzes clinical coherence and glosa risk
  - Returns structured JSON with compliance status, issues, and suggestions
  - Includes confidence scoring (0-100)
  
- **Error handling** with fallback responses
- **Comprehensive logging** for debugging and monitoring

### 2. Updated: `amplify/functions/rips-validator/handler.ts` (+64 lines)

Enhanced the existing RIPS validator:

- Imported `validateRIPSWithAI` from ai-client
- Added AI validation step **after** basic field validation passes
- AI validation only runs if:
  - Basic validation is successful (`isValid === true`)
  - `MODEL_ID` environment variable is configured
  
- **Integration behavior**:
  - AI-detected issues are added as warnings (not errors) with ⚠️ prefix
  - AI suggestions are added as informational warnings with 💡 prefix
  - AI validation failure does not block the function (graceful degradation)
  
- **Persistence**:
  - Saves both basic validation result and AI validation result to DynamoDB
  - Field: `ripsAIValidation` (includes isCompliant, issues, suggestions, confidence)

### 3. Updated: `amplify/functions/rips-validator/resource.ts` (+3 lines)

Resource configuration updates:

- Increased timeout from 30s to 60s (AI inference can take 10-20s)
- Added `MODEL_ID` environment variable: `anthropic.claude-3-5-sonnet-20240620-v1:0`

## How It Works

### Validation Flow

```
1. Basic field validation (existing logic)
   ├─ Required fields check
   ├─ Format validation (CUPS, ICD-10, dates)
   └─ EPS provider validation
   
2. If basic validation PASSES:
   └─ AI validation (new)
      ├─ Constructs expert prompt with billing data
      ├─ Calls Bedrock Claude 3.5 Sonnet
      ├─ Parses JSON response
      └─ Adds issues/suggestions as warnings
      
3. Persist results to DynamoDB
   ├─ ripsValidationResult (basic)
   └─ ripsAIValidation (AI analysis)
```

### AI Validation Criteria

The AI evaluates:

1. **CUPS Code Validity**
   - Are codes valid and current in Colombia?
   - Do they match home healthcare service type?
   - Correct 6-digit format?

2. **ICD-10 Diagnosis Coherence**
   - Valid ICD-10 code?
   - Coherent with procedures billed?
   - Typical for home care?

3. **EPS Data Quality**
   - Recognized Colombian EPS?
   - Appropriate code format?

4. **Clinical Coherence**
   - Do procedures match diagnosis?
   - Is billing amount reasonable?
   - Any inconsistencies that could trigger glosas?

5. **Data Completeness**
   - Are mandatory fields per Resolución 3100 present?
   - Are optional-but-recommended fields included?

6. **Glosa Risk Assessment**
   - What might be rejected by EPS?
   - Any red flags in billing?

### AI Response Structure

```json
{
  "isCompliant": true,
  "confidence": 85,
  "issues": [],
  "suggestions": [
    "Consider adding patient ID for better audit trail"
  ],
  "clinicalCoherence": "Procedures align well with diagnosis",
  "glosaRisk": "bajo",
  "regulatoryNotes": "Compliant with Resolución 3100 de 2019"
}
```

## Environment Variables

Required for AI validation to run:

- `MODEL_ID`: Bedrock model identifier (configured in resource.ts)
- `BILLING_RECORD_TABLE_NAME`: DynamoDB table (auto-configured by Amplify)

Optional for testing:

- `AI_TEST_MODE`: `LIVE` | `RECORDED` (default: `LIVE`)
- `AI_RECORDINGS_S3_BUCKET`: S3 bucket for test recordings
- `AI_RECORDINGS_PREFIX`: S3 prefix (default: `ai-recordings`)

## Testing Strategy

### VCR-Style Recording System

Inspired by Ruby's VCR gem and Python's vcrpy:

1. **First run (LIVE mode)**:
   - Calls real Bedrock API
   - Saves request hash, response, and metadata to S3
   - Uses SHA-256 hash of canonical request JSON for deterministic keys

2. **Subsequent runs (RECORDED mode)**:
   - Loads previously saved response from S3
   - No API calls (fast, free, deterministic)
   - Perfect for CI/CD and integration tests

### Test Commands (to be added)

```bash
# Run tests in LIVE mode (calls real API, saves recordings)
AI_TEST_MODE=LIVE npm run test:rips:live

# Run tests in RECORDED mode (uses saved recordings)
AI_TEST_MODE=RECORDED npm run test:rips

# Refresh all recordings
npm run test:recordings:refresh
```

## Benefits

1. **Regulatory Compliance**: Deep validation against Resolución 3100 de 2019
2. **Glosa Prevention**: AI identifies potential rejection reasons before submission
3. **Clinical Coherence**: Validates logical consistency between diagnosis and procedures
4. **Cost Savings**: Reduced billing rejections = better cash flow
5. **Audit Trail**: Complete validation results stored in DynamoDB
6. **Graceful Degradation**: AI failure doesn't block basic validation
7. **Testability**: VCR-style recordings enable fast, deterministic tests

## IAM Configuration ✅

**Status**: Configured in `amplify/backend.ts`

Added Bedrock IAM policy to all AI-powered Lambda functions:

```typescript
const bedrockPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['bedrock:InvokeModel'],
    resources: [
        'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0'
    ]
});

backend.ripsValidator.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.glosaDefender.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.rosterArchitect.resources.lambda.addToRolePolicy(bedrockPolicy);
```

### Functions with Bedrock Access

| Function | Purpose | Model |
|----------|---------|-------|
| `ripsValidator` | Colombian RIPS compliance validation | Claude 3.5 Sonnet |
| `glosaDefender` | Billing defense letter generation | Claude 3.5 Sonnet |
| `rosterArchitect` | AI nurse scheduling | Claude 3.5 Sonnet |

### Verification Steps

To verify permissions are correctly applied after deployment:

```bash
# 1. Deploy the changes
npx ampx sandbox

# 2. Check Lambda execution role in AWS Console
# Navigate to: Lambda > rips-validator > Configuration > Permissions
# Verify: IAM role has "bedrock:InvokeModel" permission

# 3. Test AI validation
# Submit a billing record and check that AI validation runs successfully
```

## Next Steps

1. **Testing**:
   - Create integration tests with sample billing records
   - Record AI responses for CI/CD
   - Test glosa risk scenarios

3. **Monitoring**:
   - Add CloudWatch metrics for AI validation success/failure rate
   - Track average latency and token usage
   - Alert on high glosa risk detections

4. **Frontend Integration**:
   - Display AI suggestions in billing UI
   - Show confidence scores and glosa risk levels
   - Add "Explain" button to show AI reasoning

## References

- **Colombian RIPS Regulation**: Resolución 3100 de 2019 (Ministerio de Salud)
- **AWS Bedrock**: Claude 3.5 Sonnet model
- **Pattern Source**: `amplify/functions/glosa-defender/` (existing AI integration)

## Commit Details

```
commit 3f22f6d051c6dd9fd227e0ff9f683e8cdfb08236
Author: Luis Coy <luiscoy@amazon.com>
Date:   Tue Jan 27 04:55:31 2026 +0000

    feat(ai): Add Bedrock-powered RIPS validation

 amplify/functions/rips-validator/ai-client.ts | 443 ++++++++++++++++++++++++++
 amplify/functions/rips-validator/handler.ts   |  64 +++-
 amplify/functions/rips-validator/resource.ts  |   5 +-
 3 files changed, 506 insertions(+), 6 deletions(-)
```

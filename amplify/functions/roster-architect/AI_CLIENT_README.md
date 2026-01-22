# AI Client Wrapper - VCR-Style Testing

## Overview

The `AIClient` class provides a VCR-style recording/replay mechanism for AWS Bedrock API calls. This enables:

- **Cost-effective testing**: Record real AI responses once, replay them unlimited times
- **Deterministic tests**: Same inputs always produce same outputs in RECORDED mode
- **Fast development**: No API latency when using recordings
- **Real integration**: Recordings come from actual Bedrock API calls, not mocks

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Client                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LIVE Mode:                                                  │
│  1. Call Bedrock API                                         │
│  2. Compute request hash (SHA-256)                           │
│  3. Save response to S3 with metadata                        │
│  4. Return response                                          │
│                                                              │
│  RECORDED Mode:                                              │
│  1. Compute request hash (SHA-256)                           │
│  2. Load recording from S3                                   │
│  3. Return cached response                                   │
│  4. Fail if recording not found                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Usage

```typescript
import { AIClient } from './ai-client';

const aiClient = new AIClient();

const response = await aiClient.invokeModel({
  modelId: process.env.MODEL_ID,
  prompt: "Your prompt here",
  maxTokens: 1000,
  temperature: 0.7
});

// Response is the same format as Bedrock API response
const textOutput = response.content[0].text;
```

### Environment Variables

**Required:**
- `AI_RECORDINGS_S3_BUCKET` - S3 bucket for storing recordings (e.g., `ips-erp-test-recordings`)

**Optional:**
- `AI_TEST_MODE` - Mode selection: `LIVE` or `RECORDED` (default: `LIVE`)
- `AI_RECORDINGS_PREFIX` - S3 prefix for recordings (default: `ai-recordings`)
- `AWS_LAMBDA_FUNCTION_NAME` - Auto-detected in Lambda, used for organizing recordings

### Modes

#### LIVE Mode (Default)

Calls real Bedrock API and saves recordings:

```bash
# Set environment variable
export AI_TEST_MODE=LIVE
export AI_RECORDINGS_S3_BUCKET=ips-erp-test-recordings

# Lambda will call real Bedrock and save recordings
```

**When to use:**
- First time running tests (to create recordings)
- Refreshing recordings (weekly or when model changes)
- Validating against latest model behavior
- Performance benchmarking

**Cost:** ~$0.003 per 1000 tokens (Claude 3.5 Sonnet)

#### RECORDED Mode

Replays previously recorded responses:

```bash
# Set environment variable
export AI_TEST_MODE=RECORDED
export AI_RECORDINGS_S3_BUCKET=ips-erp-test-recordings

# Lambda will load recordings from S3
```

**When to use:**
- Development (fast iteration)
- CI/CD pipelines (deterministic tests)
- Unit testing (no API costs)
- Regression testing (consistent results)

**Cost:** Negligible (S3 GET requests only)

## Recording Format

Recordings are stored as JSON files in S3:

```json
{
  "requestHash": "fbff4eddd250de66",
  "modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "timestamp": "2026-01-21T20:30:00.000Z",
  "request": {
    "modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0",
    "prompt": "Your prompt here",
    "maxTokens": 1000,
    "temperature": 0.7
  },
  "response": {
    "content": [
      {
        "type": "text",
        "text": "AI response here"
      }
    ],
    "usage": {
      "input_tokens": 150,
      "output_tokens": 200
    }
  },
  "latencyMs": 1234,
  "tokenUsage": {
    "inputTokens": 150,
    "outputTokens": 200
  }
}
```

## S3 Structure

```
s3://ips-erp-test-recordings/
└── ai-recordings/
    ├── roster-architect/
    │   ├── fbff4eddd250de66.json
    │   ├── 56075fb443f8ce1f.json
    │   └── ...
    └── glosa-defender/
        ├── a1b2c3d4e5f6g7h8.json
        └── ...
```

## Request Hashing

The AI Client uses SHA-256 hashing to create stable, deterministic identifiers for requests:

1. **Canonical JSON**: Parameters are sorted alphabetically
2. **SHA-256**: Hash computed from canonical JSON
3. **Truncated**: First 16 characters used for shorter filenames

**Example:**
```typescript
// Input
{
  modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  prompt: "Test prompt",
  maxTokens: 1000,
  temperature: 0.7
}

// Hash: fbff4eddd250de66
```

**Properties:**
- ✅ Deterministic: Same input always produces same hash
- ✅ Unique: Different inputs produce different hashes
- ✅ Stable: Hash doesn't change across runs
- ✅ Short: 16 characters for readable filenames

## Error Handling

### Recording Not Found (RECORDED Mode)

```
[AI_CLIENT] ❌ Recording not found: ai-recordings/roster-architect/fbff4eddd250de66.json

This recording does not exist in S3. To create it:
1. Run tests in LIVE mode first:
   AI_TEST_MODE=LIVE npm run test:ai:live

2. Or refresh recordings:
   npm run test:recordings:refresh

Bucket: ips-erp-test-recordings
Key: ai-recordings/roster-architect/fbff4eddd250de66.json
```

**Solution:** Run in LIVE mode first to create the recording.

### Missing S3 Bucket Configuration

```
[AI_CLIENT] Cannot load recording: AI_RECORDINGS_S3_BUCKET not configured
Set environment variable: AI_RECORDINGS_S3_BUCKET=ips-erp-test-recordings
```

**Solution:** Set the `AI_RECORDINGS_S3_BUCKET` environment variable.

### Bedrock API Failure (LIVE Mode)

```
[AI_CLIENT] Bedrock API call failed: <error details>
```

**Solution:** Check AWS credentials, model permissions, and Bedrock service status.

## Logging

The AI Client provides detailed logging for debugging:

```
[AI_CLIENT] Initialized in LIVE mode
[AI_CLIENT] Request hash: fbff4eddd250de66
[AI_CLIENT] Calling Bedrock API (LIVE mode)
[AI_CLIENT] Bedrock API call completed in 1234ms
[AI_CLIENT] ✅ Saved recording: ai-recordings/roster-architect/fbff4eddd250de66.json
  - Latency: 1234ms
  - Tokens: 150/200
  - Size: 1024 bytes
```

## Best Practices

### 1. Create Recordings First

Always run in LIVE mode first to create recordings:

```bash
AI_TEST_MODE=LIVE npm run test:ai:live
```

### 2. Use RECORDED Mode for Development

Use recordings for fast development iteration:

```bash
AI_TEST_MODE=RECORDED npm run test:ai:recorded
```

### 3. Refresh Recordings Regularly

Refresh recordings weekly or when model behavior changes:

```bash
npm run test:recordings:refresh
```

### 4. Version Control Recordings

Consider storing recordings in version control for:
- Reproducible tests across environments
- Historical comparison of model behavior
- Offline development

### 5. Monitor Recording Costs

Track Bedrock API costs in LIVE mode:
- Set up CloudWatch alarms for unexpected usage
- Use RECORDED mode for 99% of tests
- Run LIVE mode only for nightly regression

## Integration Example

### Before (Direct Bedrock Call)

```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

const command = new InvokeModelCommand({
  modelId: process.env.MODEL_ID,
  contentType: "application/json",
  accept: "application/json",
  body: JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }]
  }),
});

const response = await bedrock.send(command);
const responseBody = JSON.parse(new TextDecoder().decode(response.body));
```

### After (With AI Client)

```typescript
import { AIClient } from './ai-client';

const aiClient = new AIClient();

const responseBody = await aiClient.invokeModel({
  modelId: process.env.MODEL_ID,
  prompt: prompt,
  maxTokens: 1000,
  temperature: 0.7
});
```

**Benefits:**
- ✅ Simpler code (no manual JSON encoding/decoding)
- ✅ Automatic recording/replay
- ✅ Better error messages
- ✅ Detailed logging
- ✅ Cost control

## Troubleshooting

### Issue: "Recording not found" in RECORDED mode

**Cause:** Recording doesn't exist in S3

**Solution:**
```bash
# Create recording by running in LIVE mode
AI_TEST_MODE=LIVE npm run test:ai:live
```

### Issue: "AI_RECORDINGS_S3_BUCKET not configured"

**Cause:** Environment variable not set

**Solution:**
```bash
export AI_RECORDINGS_S3_BUCKET=ips-erp-test-recordings
```

### Issue: Different hash for same input

**Cause:** Input parameters are not identical (whitespace, order, etc.)

**Solution:** Ensure exact same parameters are used. The hash is computed from canonical JSON, so parameter order doesn't matter, but values must be identical.

### Issue: S3 access denied

**Cause:** Lambda execution role lacks S3 permissions

**Solution:** Add S3 permissions to Lambda role:
```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::ips-erp-test-recordings/ai-recordings/*"
}
```

## Performance

### LIVE Mode
- **Latency:** 1-5 seconds (Bedrock API call)
- **Cost:** ~$0.003 per 1000 tokens
- **Use case:** Creating/refreshing recordings

### RECORDED Mode
- **Latency:** 50-200ms (S3 GET request)
- **Cost:** Negligible (~$0.0004 per 1000 requests)
- **Use case:** Development, CI/CD, regression testing

## Security

### Data Privacy
- Recordings may contain sensitive prompts/responses
- Store recordings in private S3 bucket (no public access)
- Use IAM policies to restrict access
- Consider encryption at rest (S3 default encryption)

### Secrets Management
- Never hardcode S3 bucket names in code
- Use environment variables for configuration
- Use IAM roles for AWS credentials (not access keys)

## Future Enhancements

Potential improvements for future versions:

1. **Recording Versioning**: Track model version in recordings
2. **Recording Expiration**: Auto-delete old recordings
3. **Recording Comparison**: Diff tool for comparing recordings
4. **Recording Validation**: Verify recording integrity
5. **Multi-Region Support**: Store recordings in multiple regions
6. **Recording Compression**: Compress large recordings
7. **Recording Metadata**: Add tags, labels, descriptions

## References

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [VCR Pattern](https://github.com/vcr/vcr)
- [Test Harness Documentation](../../.local-tests/test-harness/README.md)
- [Lambda Business Logic Spec](.kiro/specs/lambda-business-logic/)

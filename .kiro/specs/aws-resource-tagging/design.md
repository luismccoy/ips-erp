# Design Document

## Overview

This design implements AWS resource tagging for the IPS ERP backend infrastructure to prevent Spring cleaning deletion. The solution uses AWS CDK's Tags construct to apply global tags to all resources created by Amplify Gen 2's defineBackend() pattern.

The implementation adds two critical tags to all AWS resources:
- `auto-delete: no` - Prevents nightly Spring cleaning deletion
- `application: IPS-ERP` - Identifies resource ownership for tracking and cost allocation

## Architecture

### High-Level Design

```
amplify/backend.ts
    ↓
defineBackend() creates Backend Stack
    ↓
Tags.of(backend.stack).add() applies tags
    ↓
All resources inherit tags:
    - Cognito User Pool
    - AppSync GraphQL API
    - DynamoDB Tables (14)
    - Lambda Functions (8)
    - IAM Roles
    - CloudWatch Log Groups
    - S3 Buckets
    - CloudFormation Stacks
```

### Tagging Strategy

**Approach 1: CDK Stack-Level Tagging (Recommended)**
- Apply tags to the root stack using `Tags.of(backend.stack)`
- Tags automatically propagate to all child resources
- Minimal code changes required
- Compatible with Amplify Gen 2 pattern

**Approach 2: Resource-Level Tagging (Fallback)**
- Apply tags to individual resource constructs
- More granular control but requires more code
- Used only for resources that don't inherit stack tags

**Approach 3: Amplify Hosting App Tagging (Separate)**
- Amplify Hosting app requires separate tagging via AWS CLI or Console
- Not managed by backend.ts CloudFormation stack
- Manual or scripted tagging required

## Components and Interfaces

### Backend Configuration Module

**File:** `amplify/backend.ts`

**Responsibilities:**
- Define backend resources using Amplify Gen 2 pattern
- Apply global tags to all resources
- Export backend instance for tag application

**Interface:**
```typescript
import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';

// Define backend with all resources
const backend = defineBackend({
  auth,
  data,
  // ... Lambda functions
});

// Apply global tags
Tags.of(backend.stack).add('auto-delete', 'no');
Tags.of(backend.stack).add('application', 'IPS-ERP');
```

### Tag Verification Script

**File:** `.local-tests/verify-tags.sh`

**Responsibilities:**
- Query AWS resources for tag presence
- Validate tag values match requirements
- Report missing or incorrect tags
- Provide remediation guidance

**Interface:**
```bash
#!/bin/bash
# Usage: ./verify-tags.sh [--fix]
# Options:
#   --fix: Automatically add missing tags (requires AWS permissions)
```

### Amplify Hosting Tagging Script

**File:** `.local-tests/tag-amplify-app.sh`

**Responsibilities:**
- Tag Amplify Hosting app separately from backend stack
- Handle Amplify-specific tagging API
- Verify tag application

**Interface:**
```bash
#!/bin/bash
# Usage: ./tag-amplify-app.sh <app-id>
# Example: ./tag-amplify-app.sh d2wwgecog8smmr
```

## Data Models

### Tag Structure

```typescript
interface ResourceTag {
  key: string;    // Tag key (e.g., "auto-delete")
  value: string;  // Tag value (e.g., "no")
}

const REQUIRED_TAGS: ResourceTag[] = [
  { key: 'auto-delete', value: 'no' },
  { key: 'application', value: 'IPS-ERP' }
];
```

### Resource Inventory

```typescript
interface TaggableResource {
  type: string;           // Resource type (e.g., "AWS::DynamoDB::Table")
  id: string;             // Resource identifier
  arn: string;            // Resource ARN
  tags: ResourceTag[];    // Applied tags
  stackManaged: boolean;  // Whether resource is in CloudFormation stack
}

// Example resources requiring tags
const RESOURCES: TaggableResource[] = [
  {
    type: 'AWS::Cognito::UserPool',
    id: 'amplify-ips-erp-user-pool',
    arn: 'arn:aws:cognito-idp:us-east-1:747680064475:userpool/...',
    tags: [],
    stackManaged: true
  },
  {
    type: 'AWS::AppSync::GraphQLApi',
    id: 'amplify-ips-erp-api',
    arn: 'arn:aws:appsync:us-east-1:747680064475:apis/...',
    tags: [],
    stackManaged: true
  },
  {
    type: 'AWS::DynamoDB::Table',
    id: 'Patient-...',
    arn: 'arn:aws:dynamodb:us-east-1:747680064475:table/Patient-...',
    tags: [],
    stackManaged: true
  },
  // ... 13 more DynamoDB tables
  {
    type: 'AWS::Lambda::Function',
    id: 'roster-architect',
    arn: 'arn:aws:lambda:us-east-1:747680064475:function:roster-architect',
    tags: [],
    stackManaged: true
  },
  // ... 7 more Lambda functions
  {
    type: 'AWS::Amplify::App',
    id: 'd2wwgecog8smmr',
    arn: 'arn:aws:amplify:us-east-1:747680064475:apps/d2wwgecog8smmr',
    tags: [],
    stackManaged: false  // Requires separate tagging
  }
];
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Tag Inheritance

*For any* AWS resource created by the backend stack (including DynamoDB tables, Lambda functions, Cognito User Pool, AppSync API, IAM roles, CloudWatch log groups, and nested stacks), that resource SHALL have both required tags (auto-delete: no, application: IPS-ERP) immediately after deployment completes.

**Validates: Requirements 1.2, 1.4, 3.1, 3.4, 8.4**

### Property 2: Tag Value Consistency

*For any* resource with tags applied, the tag values SHALL exactly match the required values ("no" for auto-delete key, "IPS-ERP" for application key), with no variations in case, spacing, or formatting.

**Validates: Requirements 2.1, 2.5**

### Property 3: Tag Persistence

*For any* backend redeployment, stack update, or resource modification, all existing tags SHALL remain unchanged with their original values, and no tags SHALL be removed during the operation.

**Validates: Requirements 5.1, 5.2, 5.3, 9.2**

### Property 4: Validation Execution

*For any* deployment or stack update operation, the validation logic SHALL execute and verify tag presence on all resources before the operation is considered complete.

**Validates: Requirements 1.5, 5.5**

### Property 5: Verification Completeness

*For any* resource type in the system inventory (DynamoDB, Lambda, Cognito, AppSync, IAM, CloudWatch, S3, Amplify), the verification script SHALL check that resource type for tag presence and report its status.

**Validates: Requirements 6.2**

### Property 6: Verification Reporting

*For any* resource with missing or incorrect tags, the verification script SHALL report that resource with its ARN, current tag state, and required remediation commands.

**Validates: Requirements 6.3**

### Property 7: Nested Stack Inheritance

*For any* nested CloudFormation stack created by Amplify Gen 2, that nested stack SHALL inherit both required tags from the root stack automatically.

**Validates: Requirements 8.2**

### Property 8: Non-Blocking Error Handling

*For any* tagging failure during deployment, the deployment process SHALL continue without blocking resource creation, allowing the stack to complete successfully.

**Validates: Requirements 10.1**

### Property 9: Error Logging

*For any* tagging failure or validation error, the system SHALL log the error with resource details, error message, and timestamp for investigation.

**Validates: Requirements 10.2**

## Error Handling

### Tagging Failures

**Scenario:** CDK tag application fails during deployment

**Handling:**
1. Log error with resource details
2. Continue deployment (don't block)
3. Add resource to remediation list
4. Notify user of manual tagging requirement
5. Provide AWS CLI commands for manual tagging

**Example:**
```typescript
try {
  Tags.of(backend.stack).add('auto-delete', 'no');
  Tags.of(backend.stack).add('application', 'IPS-ERP');
} catch (error) {
  console.error('Failed to apply tags:', error);
  console.log('Manual remediation required:');
  console.log('aws resourcegroupstaggingapi tag-resources \\');
  console.log('  --resource-arn-list <arn> \\');
  console.log('  --tags auto-delete=no,application=IPS-ERP');
}
```

### Verification Failures

**Scenario:** Verification script finds missing tags

**Handling:**
1. Report missing tags with resource details
2. Provide AWS CLI commands for remediation
3. Optionally auto-fix with `--fix` flag
4. Update documentation with findings
5. Alert user to Spring cleaning risk

**Example Output:**
```
❌ Missing tags on 3 resources:
  - DynamoDB Table: Patient-abc123 (missing: auto-delete, application)
  - Lambda Function: roster-architect (missing: application)
  - Amplify App: d2wwgecog8smmr (missing: auto-delete, application)

Remediation commands:
  aws dynamodb tag-resource --resource-arn arn:aws:dynamodb:... --tags Key=auto-delete,Value=no Key=application,Value=IPS-ERP
  aws lambda tag-resource --resource arn:aws:lambda:... --tags auto-delete=no application=IPS-ERP
  aws amplify tag-resource --resource-arn arn:aws:amplify:... --tags auto-delete=no,application=IPS-ERP
```

### Amplify App Tagging Failures

**Scenario:** Amplify Hosting app tagging fails (not in CloudFormation stack)

**Handling:**
1. Detect Amplify app is not stack-managed
2. Provide separate tagging script
3. Document manual tagging in Amplify Console
4. Add to verification checklist
5. Create monitoring alert for untagged Amplify apps

**Manual Steps:**
```bash
# Option 1: AWS CLI
aws amplify tag-resource \
  --resource-arn arn:aws:amplify:us-east-1:747680064475:apps/d2wwgecog8smmr \
  --tags auto-delete=no,application=IPS-ERP

# Option 2: Amplify Console
1. Navigate to Amplify Console
2. Select app d2wwgecog8smmr
3. Go to App settings > Tags
4. Add tags: auto-delete=no, application=IPS-ERP
```

### Rollback Scenarios

**Scenario:** Stack update fails and CloudFormation rolls back

**Handling:**
1. CloudFormation automatically restores previous stack state
2. Tags revert to previous values
3. Verification script detects rollback
4. User notified of tag state
5. Manual intervention required if tags were added during failed update

## Testing Strategy

### Unit Tests

**Test 1: Tag Application**
- Create mock backend stack
- Apply tags using Tags.of()
- Verify tags are present in stack metadata
- Validates: Property 1

**Test 2: Tag Value Validation**
- Apply tags with various values
- Verify exact value matching
- Test case sensitivity
- Validates: Property 5

**Test 3: Error Handling**
- Simulate tagging failures
- Verify error logging
- Verify deployment continues
- Validates: Property 7

### Integration Tests

**Test 1: Full Deployment with Tags**
- Deploy backend with tags configured
- Query AWS resources for tags
- Verify all resources have required tags
- Validates: Properties 1, 2, 6

**Test 2: Amplify App Tagging**
- Run Amplify app tagging script
- Verify tags in Amplify Console
- Verify tags via AWS CLI
- Validates: Property 3

**Test 3: Verification Script**
- Run verification script on deployed resources
- Verify all resources are checked
- Verify accurate reporting
- Validates: Property 4

### Property-Based Tests

**Property Test 1: Tag Inheritance (Property 1)**
- Generate random resource configurations
- Deploy with tags
- For all resources, verify tags are present
- Run 100+ iterations with different resource combinations

**Property Test 2: Tag Persistence (Property 2)**
- Deploy backend with tags
- Perform stack updates (add/remove resources)
- For all updates, verify tags persist
- Run 100+ iterations with different update scenarios

**Property Test 3: Verification Completeness (Property 4)**
- Generate random resource inventories
- Run verification script
- For all resources, verify script checks them
- Run 100+ iterations with different resource types

### Manual Testing Procedures

**Test 1: AWS Console Verification**
1. Deploy backend with tags
2. Navigate to CloudFormation Console
3. Select stack and view tags
4. Navigate to individual resources (DynamoDB, Lambda, etc.)
5. Verify tags are visible on each resource

**Test 2: Resource Groups Verification**
1. Navigate to AWS Resource Groups Console
2. Create tag-based group: `auto-delete=no AND application=IPS-ERP`
3. Verify all expected resources appear in group
4. Verify count matches expected resource count

**Test 3: Cost Explorer Verification**
1. Navigate to AWS Cost Explorer
2. Filter by tag: `application=IPS-ERP`
3. Verify costs are attributed correctly
4. Verify all resource types are included

**Test 4: Spring Cleaning Simulation**
1. Create test resource without tags
2. Wait for Spring cleaning execution
3. Verify untagged resource is deleted
4. Verify tagged resources are preserved
5. Document Spring cleaning behavior

## Implementation Notes

### CDK Version Compatibility

Amplify Gen 2 uses AWS CDK v2. The Tags construct is available in `aws-cdk-lib`:

```typescript
import { Tags } from 'aws-cdk-lib';
```

### Stack Access Pattern

Amplify Gen 2's `defineBackend()` returns a backend object with a `stack` property:

```typescript
const backend = defineBackend({ /* resources */ });
// backend.stack is the root CloudFormation stack
```

### Tag Propagation Behavior

CDK's `Tags.of(construct).add()` propagates tags to all child constructs by default. This means:
- Tags applied to stack propagate to all resources
- No need to tag individual resources
- Exceptions: Resources created outside the stack (e.g., Amplify Hosting app)

### Amplify Hosting App Limitation

The Amplify Hosting app is created separately from the backend CloudFormation stack. It requires separate tagging via:
- AWS CLI: `aws amplify tag-resource`
- Amplify Console: Manual tag addition
- Amplify CDK Construct: If using custom CDK (not applicable here)

### Deployment Order

1. Update `amplify/backend.ts` with tag configuration
2. Deploy backend: `npx ampx sandbox --once`
3. Verify stack tags in CloudFormation Console
4. Run verification script: `.local-tests/verify-tags.sh`
5. Tag Amplify app separately: `.local-tests/tag-amplify-app.sh d2wwgecog8smmr`
6. Re-run verification script to confirm all resources tagged

### Monitoring and Alerts

Set up CloudWatch alarms for:
- Resources created without tags (EventBridge rule)
- Tag removal events (CloudTrail + EventBridge)
- Spring cleaning execution logs (CloudWatch Logs Insights)

Example EventBridge rule:
```json
{
  "source": ["aws.cloudformation"],
  "detail-type": ["CloudFormation Stack Status Change"],
  "detail": {
    "status-details": {
      "status": ["CREATE_COMPLETE", "UPDATE_COMPLETE"]
    }
  }
}
```

Trigger Lambda to verify tags on newly created/updated resources.

## Documentation Updates

### API_DOCUMENTATION.md

Add new section: "Phase 13: AWS Resource Tagging"

Include:
- Tagging implementation details
- Verification procedures
- Troubleshooting guide
- Manual remediation steps
- Amplify app tagging instructions

### KIRO IMPLEMENTATION GUIDE.md

Update Phase 13 section with:
- Tagging completion status
- File count impact (should remain ~10 files)
- Deployment summary
- Verification results
- Next phase planning

### AWS Resource Tagging Policy.md

Update with:
- Implementation completion date
- Verification results
- Monitoring setup details
- Lessons learned
- Future maintenance procedures

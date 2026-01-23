# AWS Resource Tagging Policy

## Critical Requirement

**ALL AWS resources in this project MUST be tagged to prevent Spring cleaning deletion.**

## Required Tags

Every AWS resource created in this project must have these two tags:

1. **auto-delete: no** - Prevents automatic deletion by Spring cleaning CloudFormation
2. **application: IPS-ERP** - Application identifier for tracking and cost allocation

## Implementation Rules

### For Amplify Gen 2 Backend Resources

When working with `amplify/backend.ts` or any Amplify Gen 2 configuration:

1. **ALWAYS** configure global tags in the backend definition
2. **NEVER** deploy resources without tags
3. **VERIFY** tags are applied after deployment
4. Use CDK tagging mechanisms compatible with Amplify Gen 2

### For Manual AWS Resource Creation

When creating AWS resources outside of Amplify (CLI, Console, CDK):

1. **ALWAYS** add both required tags before creation
2. **VERIFY** tags are visible in AWS Console
3. **DOCUMENT** any resources that cannot be tagged automatically

### For New Features

When implementing new features that create AWS resources:

1. **CHECK** if new resource types need tagging
2. **ADD** tags to new resource types in backend configuration
3. **TEST** tag presence after deployment
4. **UPDATE** verification scripts to include new resource types

## Resource Types Requiring Tags

The following resource types MUST be tagged:

- ✅ Amplify Hosting app (d2wwgecog8smmr)
- ✅ Cognito User Pool
- ✅ AppSync GraphQL API
- ✅ DynamoDB tables (all 14 tables)
- ✅ Lambda functions (all 8 functions)
- ✅ IAM roles
- ✅ CloudWatch log groups
- ✅ S3 buckets (if any)
- ✅ CloudFormation stacks
- ✅ Any additional resources created by Amplify

## Verification

Before considering any deployment complete:

1. Run tag verification script: `.local-tests/verify-tags.sh`
2. Check AWS Console for tag visibility
3. Verify tags in CloudFormation stack outputs
4. Confirm tags in Resource Groups

## Consequences of Missing Tags

**Resources without tags will be deleted by Spring cleaning nightly CloudFormation process.**

This includes:
- Loss of production data (DynamoDB tables)
- Loss of user authentication (Cognito)
- Loss of API functionality (AppSync, Lambda)
- Complete application downtime

## Emergency Remediation

If tags are missing after deployment:

1. **IMMEDIATELY** add tags manually via AWS Console
2. Update backend configuration to include tags
3. Redeploy to ensure tags persist
4. Document the incident and update verification procedures

## Documentation

All tagging implementations must be documented in:
- `docs/API_DOCUMENTATION.md` - Implementation details
- `.kiro/specs/aws-resource-tagging/` - Specification and design
- This file - Policy and requirements

## KIRO Instructions

When KIRO is asked to:
- Create new AWS resources
- Modify backend configuration
- Deploy infrastructure changes
- Add new features requiring AWS services

KIRO MUST:
1. Check if tags are configured
2. Add tags if missing
3. Verify tags after deployment
4. Update documentation with tagging approach
5. Remind user to verify tags in AWS Console

## Example Implementation

```typescript
// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';

const backend = defineBackend({
  // ... resource definitions
});

// Apply tags to all resources
Tags.of(backend.stack).add('auto-delete', 'no');
Tags.of(backend.stack).add('application', 'IPS-ERP');
```

## Monitoring

Set up CloudWatch alarms for:
- Resources created without tags
- Tag removal events
- Spring cleaning execution logs

## Compliance

This policy is **MANDATORY** and **NON-NEGOTIABLE**.

Failure to comply puts the entire production system at risk of deletion.

---

**Last Updated:** 2026-01-23
**Policy Owner:** Platform Owner (Luis)
**Enforcement:** Automated verification + Manual review

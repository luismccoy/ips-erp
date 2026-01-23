# Requirements Document

## Introduction

This specification defines the requirements for implementing AWS resource tagging across all IPS ERP backend infrastructure to prevent automatic deletion by Spring cleaning CloudFormation processes. The system currently lacks required tags, putting all production resources at risk of nightly deletion.

## Glossary

- **Spring_Cleaning**: Automated AWS process that deletes untagged resources nightly via CloudFormation
- **Amplify_Gen_2**: AWS Amplify's second-generation backend framework using CDK
- **CDK**: AWS Cloud Development Kit for infrastructure as code
- **Resource_Tag**: Key-value metadata attached to AWS resources for identification and management
- **Backend_Stack**: Collection of AWS resources created by Amplify Gen 2 defineBackend()
- **Auto_Delete_Tag**: Tag with key "auto-delete" that controls Spring cleaning behavior
- **Application_Tag**: Tag with key "application" that identifies resource ownership

## Requirements

### Requirement 1: Prevent Resource Deletion

**User Story:** As a platform owner, I want all AWS resources tagged to prevent Spring cleaning deletion, so that production infrastructure remains operational.

#### Acceptance Criteria

1. WHEN Spring cleaning runs, THE System SHALL preserve all resources with auto-delete tag set to "no"
2. THE System SHALL apply auto-delete tag to all Amplify-created resources
3. THE System SHALL apply auto-delete tag to all manually-created resources
4. WHEN resources are created, THE System SHALL automatically inherit tags from backend configuration
5. THE System SHALL validate tag presence before deployment completes

### Requirement 2: Resource Identification

**User Story:** As a platform owner, I want all resources tagged with application identifier, so that I can track resource ownership and costs.

#### Acceptance Criteria

1. THE System SHALL apply application tag with value "IPS-ERP" to all resources
2. WHEN viewing AWS Console, THE User SHALL see application tag on all resources
3. THE System SHALL support resource filtering by application tag
4. WHEN generating cost reports, THE System SHALL group costs by application tag
5. THE System SHALL maintain application tag consistency across all resource types

### Requirement 3: Amplify Gen 2 Integration

**User Story:** As a developer, I want tags configured in backend.ts, so that all resources inherit tags automatically.

#### Acceptance Criteria

1. WHEN backend.ts is deployed, THE System SHALL apply tags to all created resources
2. THE System SHALL use Amplify Gen 2 CDK tagging mechanisms
3. THE System SHALL support defineBackend() pattern without breaking changes
4. WHEN new resources are added, THE System SHALL automatically tag them
5. THE System SHALL preserve existing resource configurations

### Requirement 4: Comprehensive Resource Coverage

**User Story:** As a platform owner, I want all resource types tagged, so that no resources are missed by Spring cleaning.

#### Acceptance Criteria

1. THE System SHALL tag Amplify Hosting app (d2wwgecog8smmr)
2. THE System SHALL tag Cognito User Pool
3. THE System SHALL tag AppSync GraphQL API
4. THE System SHALL tag all 14 DynamoDB tables
5. THE System SHALL tag all 8 Lambda functions
6. THE System SHALL tag IAM roles
7. THE System SHALL tag CloudWatch log groups
8. THE System SHALL tag S3 buckets if present
9. THE System SHALL tag CloudFormation stacks
10. THE System SHALL tag any additional resources created by Amplify

### Requirement 5: Tag Persistence

**User Story:** As a platform owner, I want tags to persist across deployments, so that protection remains continuous.

#### Acceptance Criteria

1. WHEN backend is redeployed, THE System SHALL preserve existing tags
2. WHEN resources are updated, THE System SHALL maintain tag values
3. THE System SHALL not remove tags during stack updates
4. WHEN rollback occurs, THE System SHALL restore tags
5. THE System SHALL validate tag presence after each deployment

### Requirement 6: Verification and Validation

**User Story:** As a developer, I want to verify tags are applied correctly, so that I can confirm protection is active.

#### Acceptance Criteria

1. THE System SHALL provide verification script for tag validation
2. WHEN verification runs, THE System SHALL check all resource types
3. THE System SHALL report missing or incorrect tags
4. WHEN tags are missing, THE System SHALL provide remediation steps
5. THE System SHALL support automated tag verification in CI/CD

### Requirement 7: Documentation and Maintenance

**User Story:** As a developer, I want clear documentation on tagging approach, so that future changes maintain protection.

#### Acceptance Criteria

1. THE System SHALL document tagging implementation in API_DOCUMENTATION.md
2. THE System SHALL provide examples for adding new resource types
3. THE System SHALL document tag verification procedures
4. WHEN troubleshooting, THE User SHALL find tag-related guidance
5. THE System SHALL maintain tagging best practices documentation

### Requirement 8: CloudFormation Stack Tagging

**User Story:** As a platform owner, I want CloudFormation stacks tagged, so that stack-level operations respect protection.

#### Acceptance Criteria

1. THE System SHALL tag root CloudFormation stack
2. THE System SHALL tag nested CloudFormation stacks
3. WHEN stack is created, THE System SHALL apply tags immediately
4. THE System SHALL propagate tags to stack resources
5. THE System SHALL support stack-level tag queries

### Requirement 9: Amplify Hosting App Tagging

**User Story:** As a platform owner, I want Amplify Hosting app tagged separately, so that frontend infrastructure is protected.

#### Acceptance Criteria

1. THE System SHALL tag Amplify app d2wwgecog8smmr
2. WHEN app is updated, THE System SHALL preserve tags
3. THE System SHALL support Amplify Console tag visibility
4. THE System SHALL document Amplify-specific tagging approach
5. THE System SHALL validate Amplify app tags independently

### Requirement 10: Error Handling and Rollback

**User Story:** As a developer, I want safe tag deployment, so that failures don't break existing infrastructure.

#### Acceptance Criteria

1. WHEN tagging fails, THE System SHALL not block deployment
2. THE System SHALL log tagging errors for investigation
3. WHEN rollback occurs, THE System SHALL restore previous tag state
4. THE System SHALL support manual tag remediation
5. THE System SHALL provide clear error messages for tag failures

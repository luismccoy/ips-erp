# Requirements Document: Family Portal Access Control

## Introduction

The Family Portal Access Control feature addresses a critical security vulnerability in the IPS ERP system. Currently, the Family Portal uses a hardcoded mock access code (1234) that provides no real authentication, allowing anyone to potentially access approved visit summaries. This feature implements server-side access code validation to ensure that only authorized family members can view patient visit data.

This feature is essential for HIPAA-like compliance in Colombian healthcare (IPS) operations, where patient data privacy is legally mandated. The solution must be simple enough for non-technical family members to use (phone-based access code sharing) while maintaining enterprise-grade security.

## Glossary

- **Family_Portal**: Web interface where family members view approved visit summaries for their relatives
- **Access_Code**: Unique alphanumeric credential (6-8 characters) that grants read-only access to one patient's approved visit data
- **Admin**: Tenant owner or manager who creates patients and generates access codes
- **Family_Member**: Patient's relative who uses an access code to view approved visit summaries (does not use Cognito authentication)
- **Patient_Document_ID**: Colombian national ID (cédula) or passport number used to identify patients
- **Approved_Visit**: Visit record that has been reviewed and approved by Admin, making it visible to family members
- **Audit_Log**: Immutable record of all access attempts (successful and failed) for security monitoring
- **Lambda_Function**: AWS serverless function that validates access codes server-side
- **Multi_Tenant_Isolation**: Security mechanism ensuring data from one IPS agency cannot be accessed by another
- **Rate_Limiting**: Security control that restricts the number of authentication attempts within a time window
- **Access_Code_Hash**: Cryptographically hashed version of access code stored in database (not plaintext)

## Requirements

### Requirement 1: Access Code Generation

**User Story:** As an Admin, I want to generate unique access codes for each patient, so that I can securely share visit information with their family members.

#### Acceptance Criteria

1. WHEN an Admin creates a new patient record, THE System SHALL automatically generate a unique 6-8 character alphanumeric access code
2. WHEN an Admin edits an existing patient record, THE System SHALL provide an option to regenerate the access code
3. WHEN an access code is generated, THE System SHALL ensure it contains at least one uppercase letter, one lowercase letter, and one number
4. WHEN an access code is generated, THE System SHALL verify uniqueness across all patients within the tenant
5. WHEN an access code is stored, THE System SHALL hash it using a cryptographic algorithm before persisting to the database
6. WHEN an access code is displayed to Admin, THE System SHALL show it in a copyable format with clear instructions for sharing

### Requirement 2: Server-Side Access Code Validation

**User Story:** As a security architect, I want access codes validated server-side in Lambda functions, so that client-side bypasses are impossible.

#### Acceptance Criteria

1. WHEN a family member submits an access code, THE Lambda_Function SHALL validate it against the hashed value in the database
2. WHEN validating an access code, THE Lambda_Function SHALL verify the patient document ID matches the access code
3. WHEN an access code is invalid, THE Lambda_Function SHALL return an error without revealing whether the patient exists
4. WHEN an access code is valid, THE Lambda_Function SHALL return only approved visits for that specific patient
5. WHEN validating an access code, THE Lambda_Function SHALL enforce multi-tenant isolation using tenantId
6. IF the Patient.accessCode field is null or empty, THEN THE Lambda_Function SHALL reject the authentication attempt

### Requirement 3: Family Portal Authentication Flow

**User Story:** As a family member, I want to enter my relative's document ID and access code, so that I can view their approved visit summaries.

#### Acceptance Criteria

1. WHEN a family member visits the Family Portal, THE System SHALL display input fields for patient document ID and access code
2. WHEN a family member submits credentials, THE System SHALL send both values to the server for validation
3. WHEN authentication succeeds, THE System SHALL display approved visit summaries for that patient only
4. WHEN authentication fails, THE System SHALL display a generic error message without revealing specific failure reasons
5. WHEN a family member is authenticated, THE System SHALL maintain the session for 30 minutes of inactivity
6. WHEN the session expires, THE System SHALL require re-authentication before showing any data

### Requirement 4: Audit Logging for Access Attempts

**User Story:** As a compliance officer, I want all access attempts logged, so that I can audit security incidents and unauthorized access patterns.

#### Acceptance Criteria

1. WHEN a family member attempts authentication, THE System SHALL create an Audit_Log entry with timestamp, patient ID, and attempt result
2. WHEN authentication fails, THE Audit_Log SHALL record the failure reason (invalid code, patient not found, etc.)
3. WHEN authentication succeeds, THE Audit_Log SHALL record the family member's IP address and user agent
4. WHEN multiple failed attempts occur from the same IP, THE Audit_Log SHALL flag potential brute force attacks
5. THE Audit_Log entries SHALL be immutable and append-only
6. THE Audit_Log SHALL include tenantId for multi-tenant isolation

### Requirement 5: Rate Limiting and Brute Force Protection

**User Story:** As a security engineer, I want rate limiting on authentication attempts, so that brute force attacks are prevented.

#### Acceptance Criteria

1. WHEN a family member makes 5 failed authentication attempts within 15 minutes, THE System SHALL temporarily block further attempts from that IP address
2. WHEN an IP address is blocked, THE System SHALL return a rate limit error for 30 minutes
3. WHEN the block period expires, THE System SHALL allow authentication attempts to resume
4. WHEN rate limiting is triggered, THE System SHALL create an Audit_Log entry with severity level HIGH
5. THE System SHALL track failed attempts per IP address, not per patient (to prevent enumeration attacks)
6. WHERE rate limiting is enabled, THE System SHALL display remaining attempts to the user after each failure

### Requirement 6: Access Code Lifecycle Management

**User Story:** As an Admin, I want to manage access code lifecycle (generate, regenerate, revoke), so that I can maintain security when codes are compromised or family members change.

#### Acceptance Criteria

1. WHEN an Admin regenerates an access code, THE System SHALL invalidate the old code immediately
2. WHEN an access code is regenerated, THE System SHALL create an Audit_Log entry recording the change
3. WHEN an Admin views a patient record, THE System SHALL display the access code generation date
4. WHEN an Admin deletes a patient, THE System SHALL automatically revoke the associated access code
5. THE System SHALL allow Admins to manually revoke an access code without deleting the patient
6. WHEN an access code is revoked, THE System SHALL notify the Admin with a confirmation message

### Requirement 7: Multi-Tenant Isolation for Access Codes

**User Story:** As a platform owner, I want access codes isolated by tenant, so that one IPS agency cannot access another agency's patient data.

#### Acceptance Criteria

1. WHEN validating an access code, THE Lambda_Function SHALL filter patients by tenantId
2. WHEN a family member authenticates, THE System SHALL only return visits from the same tenant as the patient
3. IF a patient exists in multiple tenants (edge case), THEN THE System SHALL require tenant-specific access codes
4. WHEN generating access codes, THE System SHALL ensure uniqueness within the tenant scope only
5. THE System SHALL prevent cross-tenant access even if an access code collision occurs across tenants
6. WHEN auditing access attempts, THE System SHALL include tenantId in all log entries

### Requirement 8: Frontend User Experience

**User Story:** As a family member, I want clear instructions and helpful error messages, so that I can successfully access my relative's visit information without technical assistance.

#### Acceptance Criteria

1. WHEN a family member visits the Family Portal, THE System SHALL display clear instructions for obtaining an access code
2. WHEN authentication fails, THE System SHALL display user-friendly error messages in Spanish (primary language)
3. WHEN an access code is invalid, THE System SHALL suggest contacting the IPS agency for assistance
4. WHEN the session expires, THE System SHALL display a notification before redirecting to the login screen
5. WHEN displaying visit summaries, THE System SHALL show the patient's name and document ID for confirmation
6. THE System SHALL provide a logout button that clears the session and returns to the login screen

### Requirement 9: Access Code Communication

**User Story:** As an Admin, I want easy ways to share access codes with family members, so that I can quickly onboard them without technical barriers.

#### Acceptance Criteria

1. WHEN an access code is generated, THE System SHALL display it in a large, readable font with copy-to-clipboard functionality
2. WHEN an Admin copies an access code, THE System SHALL provide visual confirmation of the copy action
3. THE System SHALL display the access code alongside the patient document ID for easy reference
4. THE System SHALL provide a printable format for access codes (for phone-based sharing)
5. WHERE SMS integration is available, THE System SHALL offer to send the access code via SMS to the family member
6. THE System SHALL include instructions for family members on how to use the access code

### Requirement 10: Backward Compatibility

**User Story:** As a developer, I want the new access control system to work with existing data, so that no patient records are lost during migration.

#### Acceptance Criteria

1. WHEN the feature is deployed, THE System SHALL handle existing patients with null accessCode fields gracefully
2. WHEN an Admin edits a patient with no access code, THE System SHALL prompt to generate one
3. THE System SHALL maintain compatibility with the existing Patient model schema
4. THE System SHALL not require database migrations for existing patient records
5. WHEN a family member attempts to access a patient with no access code, THE System SHALL display a message to contact the Admin
6. THE System SHALL allow gradual rollout by supporting both authenticated and legacy access patterns during transition


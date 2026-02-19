import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import * as location from 'aws-cdk-lib/aws-location';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { rosterArchitect } from './functions/roster-architect/resource';
import { ripsValidator } from './functions/rips-validator/resource';
import { glosaDefender } from './functions/glosa-defender/resource';
import { listApprovedVisitSummaries } from './functions/list-approved-visit-summaries/resource';
import { createVisitDraft } from './functions/create-visit-draft/resource';
import { submitVisit } from './functions/submit-visit/resource';
import { rejectVisit } from './functions/reject-visit/resource';
import { approveVisit } from './functions/approve-visit/resource';
import { verifyFamilyAccess } from './functions/verify-family-access/resource';
import { createNurseValidated } from './functions/create-nurse-validated/resource';
import { routeOptimizer } from './functions/route-optimizer/resource';
import { deteriorationDetector } from './functions/deterioration-detector/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
const backend = defineBackend({
    auth,
    data,
    rosterArchitect,
    ripsValidator,
    glosaDefender,
    listApprovedVisitSummaries,
    createVisitDraft,
    submitVisit,
    rejectVisit,
    approveVisit,
    verifyFamilyAccess,
    createNurseValidated,
    routeOptimizer,
    deteriorationDetector,
});

// Grant Bedrock permissions to AI-powered Lambda functions
// Required for: ripsValidator, glosaDefender, rosterArchitect
// These functions use AWS Bedrock (Claude 3.5 Sonnet) for AI inference
const bedrockPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['bedrock:InvokeModel'],
    resources: [
        // Anthropic Claude 3.5 Sonnet model used by all AI functions
        'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0'
    ]
});

backend.ripsValidator.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.glosaDefender.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.rosterArchitect.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.deteriorationDetector.resources.lambda.addToRolePolicy(bedrockPolicy);

// ============================================
// AWS LOCATION SERVICE - Route Optimization
// ============================================

// Create Place Index for geocoding patient addresses
const placeIndex = new location.CfnPlaceIndex(backend.stack, 'IPSPlaceIndex', {
    indexName: 'IPS-ERP-PlaceIndex',
    dataSource: 'Esri', // Best for Colombia/South America
    pricingPlan: 'RequestBasedUsage',
    description: 'Geocoding for IPS ERP patient addresses in Colombia',
});

// Create Route Calculator for travel time/distance calculations
const routeCalculator = new location.CfnRouteCalculator(backend.stack, 'IPSRouteCalculator', {
    calculatorName: 'IPS-ERP-RouteCalculator',
    dataSource: 'Esri', // Best for Colombia/South America
    pricingPlan: 'RequestBasedUsage',
    description: 'Route calculation for IPS ERP nurse visit optimization',
});

// Grant Location Service permissions to route-optimizer Lambda
const locationPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
        'geo:SearchPlaceIndexForText',
        'geo:CalculateRoute',
    ],
    resources: [
        placeIndex.attrArn,
        routeCalculator.attrArn,
    ],
});

backend.routeOptimizer.resources.lambda.addToRolePolicy(locationPolicy);

// ============================================
// DYNAMODB TABLE NAME INJECTION
// Wire table names from Amplify data layer into Lambda env vars
// This replaces hardcoded table names and ensures proper tagging
// ============================================
const tables = backend.data.resources.tables;

// approve-visit: needs Visit, Nurse, Patient, AuditLog, Notification
backend.approveVisit.resources.lambda.addEnvironment('VISIT_TABLE_NAME', tables['Visit'].tableName);
backend.approveVisit.resources.lambda.addEnvironment('NURSE_TABLE_NAME', tables['Nurse'].tableName);
backend.approveVisit.resources.lambda.addEnvironment('PATIENT_TABLE_NAME', tables['Patient'].tableName);
backend.approveVisit.resources.lambda.addEnvironment('AUDIT_TABLE_NAME', tables['AuditLog'].tableName);
backend.approveVisit.resources.lambda.addEnvironment('NOTIFICATION_TABLE_NAME', tables['Notification'].tableName);

// reject-visit: needs Visit, Nurse, AuditLog, Notification
backend.rejectVisit.resources.lambda.addEnvironment('VISIT_TABLE_NAME', tables['Visit'].tableName);
backend.rejectVisit.resources.lambda.addEnvironment('NURSE_TABLE_NAME', tables['Nurse'].tableName);
backend.rejectVisit.resources.lambda.addEnvironment('AUDIT_TABLE_NAME', tables['AuditLog'].tableName);
backend.rejectVisit.resources.lambda.addEnvironment('NOTIFICATION_TABLE_NAME', tables['Notification'].tableName);

// submit-visit: needs Visit, Nurse, AuditLog, Notification
backend.submitVisit.resources.lambda.addEnvironment('VISIT_TABLE_NAME', tables['Visit'].tableName);
backend.submitVisit.resources.lambda.addEnvironment('NURSE_TABLE_NAME', tables['Nurse'].tableName);
backend.submitVisit.resources.lambda.addEnvironment('AUDIT_TABLE_NAME', tables['AuditLog'].tableName);
backend.submitVisit.resources.lambda.addEnvironment('NOTIFICATION_TABLE_NAME', tables['Notification'].tableName);

// create-visit-draft: needs Shift, Visit, AuditLog, Nurse
backend.createVisitDraft.resources.lambda.addEnvironment('SHIFT_TABLE_NAME', tables['Shift'].tableName);
backend.createVisitDraft.resources.lambda.addEnvironment('VISIT_TABLE_NAME', tables['Visit'].tableName);
backend.createVisitDraft.resources.lambda.addEnvironment('AUDIT_TABLE_NAME', tables['AuditLog'].tableName);
backend.createVisitDraft.resources.lambda.addEnvironment('NURSE_TABLE_NAME', tables['Nurse'].tableName);

// list-approved-visit-summaries: needs Visit, Nurse, Patient, Shift
backend.listApprovedVisitSummaries.resources.lambda.addEnvironment('VISIT_TABLE_NAME', tables['Visit'].tableName);
backend.listApprovedVisitSummaries.resources.lambda.addEnvironment('NURSE_TABLE_NAME', tables['Nurse'].tableName);
backend.listApprovedVisitSummaries.resources.lambda.addEnvironment('PATIENT_TABLE_NAME', tables['Patient'].tableName);
backend.listApprovedVisitSummaries.resources.lambda.addEnvironment('SHIFT_TABLE_NAME', tables['Shift'].tableName);

// create-nurse-validated: needs Nurse
backend.createNurseValidated.resources.lambda.addEnvironment('NURSE_TABLE_NAME', tables['Nurse'].tableName);

// verify-family-access: needs Patient, AuditLog
backend.verifyFamilyAccess.resources.lambda.addEnvironment('PATIENT_TABLE_NAME', tables['Patient'].tableName);
backend.verifyFamilyAccess.resources.lambda.addEnvironment('AUDITLOG_TABLE_NAME', tables['AuditLog'].tableName);

// glosa-defender: needs BillingRecord
backend.glosaDefender.resources.lambda.addEnvironment('BILLING_RECORD_TABLE_NAME', tables['BillingRecord'].tableName);

// rips-validator: needs BillingRecord
backend.ripsValidator.resources.lambda.addEnvironment('BILLING_RECORD_TABLE_NAME', tables['BillingRecord'].tableName);

// ============================================
// DYNAMODB TABLE ACCESS POLICIES
// Grant Lambda functions read/write access to the tables they need
// ============================================
const visitWorkflowPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:Query',
        'dynamodb:Scan',
    ],
    resources: [
        tables['Visit'].tableArn,
        `${tables['Visit'].tableArn}/index/*`,
        tables['Nurse'].tableArn,
        `${tables['Nurse'].tableArn}/index/*`,
        tables['Patient'].tableArn,
        `${tables['Patient'].tableArn}/index/*`,
        tables['Shift'].tableArn,
        `${tables['Shift'].tableArn}/index/*`,
        tables['AuditLog'].tableArn,
        `${tables['AuditLog'].tableArn}/index/*`,
        tables['Notification'].tableArn,
        `${tables['Notification'].tableArn}/index/*`,
    ],
});

backend.approveVisit.resources.lambda.addToRolePolicy(visitWorkflowPolicy);
backend.rejectVisit.resources.lambda.addToRolePolicy(visitWorkflowPolicy);
backend.submitVisit.resources.lambda.addToRolePolicy(visitWorkflowPolicy);
backend.createVisitDraft.resources.lambda.addToRolePolicy(visitWorkflowPolicy);
backend.listApprovedVisitSummaries.resources.lambda.addToRolePolicy(visitWorkflowPolicy);

const nurseTablePolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:Query'],
    resources: [
        tables['Nurse'].tableArn,
        `${tables['Nurse'].tableArn}/index/*`,
    ],
});
backend.createNurseValidated.resources.lambda.addToRolePolicy(nurseTablePolicy);

const familyAccessPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:PutItem'],
    resources: [
        tables['Patient'].tableArn,
        `${tables['Patient'].tableArn}/index/*`,
        tables['AuditLog'].tableArn,
    ],
});
backend.verifyFamilyAccess.resources.lambda.addToRolePolicy(familyAccessPolicy);

const billingTablePolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
    resources: [
        tables['BillingRecord'].tableArn,
        `${tables['BillingRecord'].tableArn}/index/*`,
    ],
});
backend.glosaDefender.resources.lambda.addToRolePolicy(billingTablePolicy);
backend.ripsValidator.resources.lambda.addToRolePolicy(billingTablePolicy);

// deterioration-detector: needs Patient, PatientAssessment, VitalSigns, Notification, Nurse
backend.deteriorationDetector.resources.lambda.addEnvironment('PATIENT_TABLE_NAME', tables['Patient'].tableName);
backend.deteriorationDetector.resources.lambda.addEnvironment('PATIENT_ASSESSMENT_TABLE_NAME', tables['PatientAssessment'].tableName);
backend.deteriorationDetector.resources.lambda.addEnvironment('VITAL_SIGNS_TABLE_NAME', tables['VitalSigns'].tableName);
backend.deteriorationDetector.resources.lambda.addEnvironment('NOTIFICATION_TABLE_NAME', tables['Notification'].tableName);
backend.deteriorationDetector.resources.lambda.addEnvironment('NURSE_TABLE_NAME', tables['Nurse'].tableName);

const deteriorationDetectorPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:PutItem'],
    resources: [
        tables['Patient'].tableArn,
        `${tables['Patient'].tableArn}/index/*`,
        tables['PatientAssessment'].tableArn,
        `${tables['PatientAssessment'].tableArn}/index/*`,
        tables['VitalSigns'].tableArn,
        `${tables['VitalSigns'].tableArn}/index/*`,
        tables['Notification'].tableArn,
        `${tables['Notification'].tableArn}/index/*`,
        tables['Nurse'].tableArn,
        `${tables['Nurse'].tableArn}/index/*`,
    ],
});
backend.deteriorationDetector.resources.lambda.addToRolePolicy(deteriorationDetectorPolicy);

// Apply AWS resource tags to prevent Spring cleaning deletion
// These tags are inherited by all resources in the stack (DynamoDB, Lambda, Cognito, AppSync, etc.)
try {
    Tags.of(backend.stack).add('auto-delete', 'no');        // Prevents nightly Spring cleaning deletion
    Tags.of(backend.stack).add('application', 'IPS-ERP');   // Identifies resource ownership for tracking and cost allocation
    Tags.of(backend.stack).add('Project', 'IPS-ERP');       // Project identifier for resource grouping
    Tags.of(backend.stack).add('Environment', 'production'); // Environment classification
    Tags.of(backend.stack).add('Owner', 'luiscoy');         // Resource owner for accountability
} catch (error) {
    console.error('⚠️  Failed to apply tags to backend stack:', error);
    console.log('📝 Manual remediation required - add tags via AWS Console or CLI');
    console.log('   aws resourcegroupstaggingapi tag-resources --resource-arn-list <arn> --tags auto-delete=no,application=IPS-ERP,Project=IPS-ERP,Environment=production,Owner=luiscoy');
}

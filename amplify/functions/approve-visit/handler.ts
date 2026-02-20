import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Table names from environment
const VISIT_TABLE = process.env.VISIT_TABLE_NAME!;
const NURSE_TABLE = process.env.NURSE_TABLE_NAME!;
const PATIENT_TABLE = process.env.PATIENT_TABLE_NAME!;
const AUDIT_TABLE = process.env.AUDIT_TABLE_NAME!;
const NOTIFICATION_TABLE = process.env.NOTIFICATION_TABLE_NAME!;

type Handler = Schema['approveVisit']['functionHandler'];

export const handler: Handler = async (event) => {
  const { shiftId } = event.arguments;
  
  // Extract user sub from identity context
  // Works with both ID tokens and Access tokens
  const rawIdentity = event.identity as any;
  const userId = rawIdentity?.sub || rawIdentity?.claims?.sub;

  if (!userId) {
    console.error('No user sub found in identity:', JSON.stringify(event.identity));
    throw new Error('Unauthorized: Missing user identity');
  }

  try {
    // 1. Look up caller's record by cognitoSub (Scan since we don't have tenantId from Access tokens)
    const callerResult = await docClient.send(new ScanCommand({
      TableName: NURSE_TABLE,
      FilterExpression: 'cognitoSub = :sub',
      ExpressionAttributeValues: {
        ':sub': userId
      }
    }));
    const caller = callerResult.Items?.[0];
    if (!caller) {
      throw new Error('Unauthorized: No nurse/admin record found for this user');
    }
    const tenantId = caller.tenantId;

    if (caller.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only admins can approve visits');
    }

    // 2. Query Visit by id=shiftId
    const visitResult = await docClient.send(new GetCommand({
      TableName: VISIT_TABLE,
      Key: { id: shiftId },
      ProjectionExpression: 'id, tenantId, #status, nurseId, patientId',
      ExpressionAttributeNames: { '#status': 'status' }
    }));
    
    const visit = visitResult.Item;
    if (!visit) {
      throw new Error('Visit not found');
    }

    // 3. Verify visit.tenantId === tenantId
    if (visit.tenantId !== tenantId) {
      throw new Error('Unauthorized: Visit belongs to different tenant');
    }

    // 4. Verify visit.status === 'SUBMITTED'
    if (visit.status !== 'SUBMITTED') {
      throw new Error(`Cannot approve visit with status: ${visit.status}. Visit must be SUBMITTED.`);
    }

    // 5. Update Visit.status = 'APPROVED' (IMMUTABLE - final state)
    const now = new Date().toISOString();
    await docClient.send(new UpdateCommand({
      TableName: VISIT_TABLE,
      Key: { id: shiftId },
      UpdateExpression: 'SET #status = :status, approvedAt = :approvedAt, approvedBy = :approvedBy, reviewedAt = :reviewedAt, reviewedBy = :reviewedBy, updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'APPROVED',
        ':approvedAt': now,
        ':approvedBy': userId,
        ':reviewedAt': now,
        ':reviewedBy': userId,
        ':updatedAt': now
      }
    }));

    // 6. Create AuditLog entry
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    await docClient.send(new PutCommand({
      TableName: AUDIT_TABLE,
      Item: {
        id: auditId,
        tenantId,
        userId,
        userRole: 'Admin',
        action: 'VISIT_APPROVED',
        entityType: 'Visit',
        entityId: shiftId,
        timestamp: now,
        details: JSON.stringify({
          previousStatus: 'SUBMITTED',
          newStatus: 'APPROVED',
        }),
        ipAddress: event.request?.headers?.['x-forwarded-for'] || 'unknown',
        createdAt: now,
        updatedAt: now,
      }
    }));

    // 7. Create Notification for assigned nurse
    const nurseNotifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    await docClient.send(new PutCommand({
      TableName: NOTIFICATION_TABLE,
      Item: {
        id: nurseNotifId,
        tenantId,
        userId: visit.nurseId,
        type: 'VISIT_APPROVED',
        message: 'Your visit has been approved',
        entityType: 'Visit',
        entityId: shiftId,
        read: false,
        createdAt: now,
        updatedAt: now,
      }
    }));

    // 8. Get patient to find family members
    const patientResult = await docClient.send(new GetCommand({
      TableName: PATIENT_TABLE,
      Key: { id: visit.patientId },
      ProjectionExpression: 'id, tenantId, #name, familyMembers',
      ExpressionAttributeNames: { '#name': 'name' }
    }));

    const patient = patientResult.Item;
    if (patient && patient.familyMembers && patient.familyMembers.length > 0) {
      // 9. Create Notification for each family member
      for (const familyMemberId of patient.familyMembers) {
        const familyNotifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        await docClient.send(new PutCommand({
          TableName: NOTIFICATION_TABLE,
          Item: {
            id: familyNotifId,
            tenantId,
            userId: familyMemberId,
            type: 'VISIT_AVAILABLE_FOR_FAMILY',
            message: `New visit summary available for ${patient.name}`,
            entityType: 'Visit',
            entityId: shiftId,
            read: false,
            createdAt: now,
            updatedAt: now,
          }
        }));
      }
    }

    return {
      success: true,
      visitId: shiftId,
      status: 'APPROVED',
      message: 'Visit approved and now visible to family',
    };
  } catch (error) {
    console.error('Error approving visit:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to approve visit: ${error.message}`);
    }
    throw new Error('Failed to approve visit');
  }
};

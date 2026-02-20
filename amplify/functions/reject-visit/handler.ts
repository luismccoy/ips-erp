import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Table names from environment
const VISIT_TABLE = process.env.VISIT_TABLE_NAME!;
const NURSE_TABLE = process.env.NURSE_TABLE_NAME!;
const AUDIT_TABLE = process.env.AUDIT_TABLE_NAME!;
const NOTIFICATION_TABLE = process.env.NOTIFICATION_TABLE_NAME!;

type Handler = Schema['rejectVisit']['functionHandler'];

export const handler: Handler = async (event) => {
  const { shiftId, reason } = event.arguments;
  
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
      throw new Error('Unauthorized: Only admins can reject visits');
    }

    // 2. Query Visit by id=shiftId
    const visitResult = await docClient.send(new GetCommand({
      TableName: VISIT_TABLE,
      Key: { id: shiftId },
      ProjectionExpression: 'id, tenantId, #status, nurseId',
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
      throw new Error(`Cannot reject visit with status: ${visit.status}. Visit must be SUBMITTED.`);
    }

    // 5. Verify reason is provided and non-empty
    if (!reason || reason.trim() === '') {
      throw new Error('Rejection reason is required');
    }

    // 6. Update Visit.status = 'REJECTED' with strong consistency
    const now = new Date().toISOString();
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: VISIT_TABLE,
      Key: { id: shiftId },
      UpdateExpression: 'SET #status = :status, rejectionReason = :rejectionReason, reviewedAt = :reviewedAt, reviewedBy = :reviewedBy, updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'REJECTED',
        ':rejectionReason': reason,
        ':reviewedAt': now,
        ':reviewedBy': userId,
        ':updatedAt': now
      },
      ReturnValues: 'ALL_NEW' // Return updated item immediately
    }));

    const updatedVisit = updateResult.Attributes;

    // 7. Create AuditLog entry
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    await docClient.send(new PutCommand({
      TableName: AUDIT_TABLE,
      Item: {
        id: auditId,
        tenantId,
        userId,
        userRole: 'Admin',
        action: 'VISIT_REJECTED',
        entityType: 'Visit',
        entityId: shiftId,
        timestamp: now,
        details: JSON.stringify({
          previousStatus: 'SUBMITTED',
          newStatus: 'REJECTED',
          reason,
        }),
        ipAddress: event.request?.headers?.['x-forwarded-for'] || 'unknown',
        createdAt: now,
        updatedAt: now,
      }
    }));

    // 8. Create Notification for assigned nurse
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    await docClient.send(new PutCommand({
      TableName: NOTIFICATION_TABLE,
      Item: {
        id: notifId,
        tenantId,
        userId: visit.nurseId,
        type: 'VISIT_REJECTED',
        message: `Your visit has been rejected: ${reason}`,
        entityType: 'Visit',
        entityId: shiftId,
        read: false,
        createdAt: now,
        updatedAt: now,
      }
    }));

    return {
      success: true,
      visitId: shiftId,
      status: 'REJECTED',
      message: 'Visit rejected and returned to nurse',
      visit: updatedVisit, // Return complete updated Visit object
      rejectedAt: now,
      rejectionReason: reason
    };
  } catch (error) {
    console.error('Error rejecting visit:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to reject visit: ${error.message}`);
    }
    throw new Error('Failed to reject visit');
  }
};

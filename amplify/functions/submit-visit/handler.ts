import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const safeGet = async (params: any) => {
  try {
    return await docClient.send(new GetCommand(params));
  } catch (error: any) {
    if (error?.name === 'ConditionalCheckFailedException') {
      return { Item: undefined };
    }
    throw error;
  }
};

// Table names from environment
const VISIT_TABLE = process.env.VISIT_TABLE_NAME!;
const NURSE_TABLE = process.env.NURSE_TABLE_NAME!;
const AUDIT_TABLE = process.env.AUDIT_TABLE_NAME!;
const NOTIFICATION_TABLE = process.env.NOTIFICATION_TABLE_NAME!;

type Handler = Schema['submitVisit']['functionHandler'];

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
    // 0. Look up caller's Nurse record by cognitoSub
    const callerNurseResult = await docClient.send(new ScanCommand({
      TableName: NURSE_TABLE,
      FilterExpression: 'cognitoSub = :sub',
      ExpressionAttributeValues: {
        ':sub': userId
      }
    }));
    const callerNurse = callerNurseResult.Items?.[0];
    if (!callerNurse) {
      throw new Error('Unauthorized: No nurse record found for this user');
    }
    const nurseRecordId = callerNurse.id;
    const tenantId = callerNurse.tenantId;

    // 1. Query Visit by id=shiftId
    const visitResult = await safeGet({
      TableName: VISIT_TABLE,
      Key: { id: shiftId },
    });

    const visit = visitResult.Item;
    if (!visit) {
      throw new Error('Visit not found');
    }

    // 2. Verify visit.nurseId === caller's nurse record ID (assigned nurse only)
    if (visit.nurseId !== nurseRecordId) {
      throw new Error('Unauthorized: Only the assigned nurse can submit this visit');
    }

    // 3. Verify visit.tenantId === tenantId
    if (visit.tenantId !== tenantId) {
      throw new Error('Unauthorized: Visit belongs to different tenant');
    }

    // 4. Verify visit.status === 'DRAFT' OR visit.status === 'REJECTED'
    if (visit.status !== 'DRAFT' && visit.status !== 'REJECTED') {
      throw new Error(`Cannot submit visit with status: ${visit.status}. Visit must be DRAFT or REJECTED.`);
    }

    // 5. Validate required KARDEX fields
    const kardex = visit.kardex || {};
    if (!kardex.generalObservations || kardex.generalObservations.trim() === '') {
      throw new Error('Cannot submit visit: KARDEX general observations are required');
    }

    // 6. Update Visit.status = 'SUBMITTED'
    const now = new Date().toISOString();
    await docClient.send(new UpdateCommand({
      TableName: VISIT_TABLE,
      Key: { id: shiftId },
      UpdateExpression: 'SET #status = :status, submittedAt = :submittedAt, updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'SUBMITTED',
        ':submittedAt': now,
        ':updatedAt': now
      }
    }));

    // 7. Create AuditLog entry
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    await docClient.send(new PutCommand({
      TableName: AUDIT_TABLE,
      Item: {
        id: auditId,
        tenantId,
        userId,
        userRole: 'Nurse',
        action: 'VISIT_SUBMITTED',
        entityType: 'Visit',
        entityId: shiftId,
        timestamp: now,
        details: JSON.stringify({
          previousStatus: visit.status,
          newStatus: 'SUBMITTED',
        }),
        ipAddress: event.request?.headers?.['x-forwarded-for'] || 'unknown',
        createdAt: now,
        updatedAt: now,
      }
    }));

    // 8. Find admins in the same tenant and notify them
    const nursesResult = await docClient.send(new ScanCommand({
      TableName: NURSE_TABLE,
      FilterExpression: 'tenantId = :tenantId AND #role = :role',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: {
        ':tenantId': tenantId,
        ':role': 'ADMIN'
      }
    }));

    const admins = nursesResult.Items || [];

    // 9. Create Notification for each admin
    for (const admin of admins) {
      const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      await docClient.send(new PutCommand({
        TableName: NOTIFICATION_TABLE,
        Item: {
          id: notifId,
          tenantId,
          userId: admin.id,
          type: 'VISIT_PENDING_REVIEW',
          message: `New visit submitted for review by ${callerNurse.name || visit.nurseId}`,
          entityType: 'Visit',
          entityId: shiftId,
          read: false,
          createdAt: now,
          updatedAt: now,
        }
      }));
    }

    return {
      success: true,
      visitId: shiftId,
      status: 'SUBMITTED',
      message: 'Visit submitted for admin review',
    };
  } catch (error) {
    console.error('Error submitting visit:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to submit visit: ${error.message}`);
    }
    throw new Error('Failed to submit visit');
  }
};

import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

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
const SHIFT_TABLE = process.env.SHIFT_TABLE_NAME!;
const VISIT_TABLE = process.env.VISIT_TABLE_NAME!;
const AUDIT_TABLE = process.env.AUDIT_TABLE_NAME!;
const NURSE_TABLE = process.env.NURSE_TABLE_NAME!;

type Handler = Schema['createVisitDraftFromShift']['functionHandler'];

export const handler: Handler = async (event) => {
  const { shiftId } = event.arguments;
  
  // Extract identity with type assertion (Cognito user pool auth)
  const identity = event.identity as { sub: string; claims: Record<string, string> };
  const userId = identity?.sub;
  const tenantId = identity?.claims?.['custom:tenantId'];

  if (!userId || !tenantId) {
    throw new Error('Unauthorized: Missing user identity or tenant');
  }

  try {
    // 0. Look up caller's Nurse record by cognitoSub
    const callerNurseResult = await docClient.send(new QueryCommand({
      TableName: NURSE_TABLE,
      IndexName: 'gsi-Tenant.nurses',
      KeyConditionExpression: 'tenantId = :tenantId',
      FilterExpression: 'cognitoSub = :sub',
      ExpressionAttributeValues: {
        ':tenantId': tenantId,
        ':sub': userId
      }
    }));
    const callerNurse = callerNurseResult.Items?.[0];
    if (!callerNurse) {
      throw new Error('Unauthorized: No nurse record found for this user');
    }
    const nurseRecordId = callerNurse.id;

    // 1. Query Shift by shiftId
    const shiftResult = await safeGet({
      TableName: SHIFT_TABLE,
      Key: { id: shiftId },
      ProjectionExpression: 'id, tenantId, #status, nurseId, patientId, scheduledTime, completedAt',
      ConditionExpression: 'tenantId = :tenantId',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':tenantId': tenantId
      }
    });
    
    const shift = shiftResult.Item;
    if (!shift) {
      throw new Error('Shift not found');
    }

    // 2. Verify shift is in a valid status for starting documentation
    const allowedStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    if (!allowedStatuses.includes(shift.status)) {
      throw new Error(`Cannot create visit from shift with status: ${shift.status}. Shift must be PENDING, IN_PROGRESS, or COMPLETED.`);
    }

    // 3. Verify shift.nurseId === caller's nurse record ID (assigned nurse only)
    if (shift.nurseId !== nurseRecordId) {
      throw new Error('Unauthorized: Only the assigned nurse can create a visit for this shift');
    }

    // 4. Verify shift.tenantId === tenantId
    if (shift.tenantId !== tenantId) {
      throw new Error('Unauthorized: Shift belongs to different tenant');
    }

    // 5. Check if Visit with id=shiftId already exists (1:1 enforcement)
    const existingVisitResult = await safeGet({
      TableName: VISIT_TABLE,
      Key: { id: shiftId },
      ProjectionExpression: 'id, tenantId',
      ConditionExpression: 'tenantId = :tenantId',
      ExpressionAttributeValues: {
        ':tenantId': tenantId
      }
    });

    if (existingVisitResult.Item) {
      // Idempotent: return existing visit instead of failing
      return {
        success: true,
        visitId: shiftId,
        status: existingVisitResult.Item.status || 'DRAFT',
        message: 'Visit already exists for this shift',
      };
    }

    // 6. Create Visit with id=shiftId (enforces 1:1 relationship)
    const now = new Date().toISOString();
    const visit = {
      id: shiftId, // PRIMARY KEY = shiftId (1:1 enforcement)
      tenantId,
      shiftId,
      patientId: shift.patientId,
      nurseId: shift.nurseId,
      status: 'DRAFT',
      kardex: { generalObservations: '' },
      vitalsRecorded: null,
      medicationsAdministered: [],
      tasksCompleted: [],
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: VISIT_TABLE,
      Item: visit
    }));

    // 7. Update Shift: set visitId and transition status to IN_PROGRESS if still PENDING
    const shiftUpdateExpression = shift.status === 'PENDING'
      ? 'SET visitId = :visitId, #status = :inProgress, updatedAt = :updatedAt'
      : 'SET visitId = :visitId, updatedAt = :updatedAt';
    const shiftUpdateValues: Record<string, any> = {
      ':visitId': shiftId,
      ':updatedAt': now,
    };
    if (shift.status === 'PENDING') {
      shiftUpdateValues[':inProgress'] = 'IN_PROGRESS';
    }
    await docClient.send(new UpdateCommand({
      TableName: SHIFT_TABLE,
      Key: { id: shiftId },
      UpdateExpression: shiftUpdateExpression,
      ...(shift.status === 'PENDING' ? { ExpressionAttributeNames: { '#status': 'status' } } : {}),
      ExpressionAttributeValues: shiftUpdateValues,
    }));

    // 8. Create AuditLog entry
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await docClient.send(new PutCommand({
      TableName: AUDIT_TABLE,
      Item: {
        id: auditId,
        tenantId,
        userId,
        userRole: 'Nurse',
        action: 'VISIT_CREATED',
        entityType: 'Visit',
        entityId: shiftId,
        timestamp: now,
        details: JSON.stringify({ shiftId, patientId: shift.patientId, nurseId: shift.nurseId }),
        createdAt: now,
        updatedAt: now,
      }
    }));

    return {
      success: true,
      visitId: shiftId,
      status: 'DRAFT',
      message: 'Visit draft created successfully',
    };
  } catch (error) {
    console.error('Error creating visit draft:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create visit draft: ${error.message}`);
    }
    throw new Error('Failed to create visit draft');
  }
};

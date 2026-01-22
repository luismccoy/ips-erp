import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Table names from environment
const SHIFT_TABLE = process.env.SHIFT_TABLE_NAME!;
const VISIT_TABLE = process.env.VISIT_TABLE_NAME!;
const AUDIT_TABLE = process.env.AUDIT_TABLE_NAME!;

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
    // 1. Query Shift by shiftId
    const shiftResult = await docClient.send(new GetCommand({
      TableName: SHIFT_TABLE,
      Key: { id: shiftId }
    }));
    
    const shift = shiftResult.Item;
    if (!shift) {
      throw new Error('Shift not found');
    }

    // 2. Verify shift.status === 'COMPLETED'
    if (shift.status !== 'COMPLETED') {
      throw new Error(`Cannot create visit from shift with status: ${shift.status}. Shift must be COMPLETED.`);
    }

    // 3. Verify shift.nurseId === userId (assigned nurse only)
    if (shift.nurseId !== userId) {
      throw new Error('Unauthorized: Only the assigned nurse can create a visit for this shift');
    }

    // 4. Verify shift.tenantId === tenantId
    if (shift.tenantId !== tenantId) {
      throw new Error('Unauthorized: Shift belongs to different tenant');
    }

    // 5. Check if Visit with id=shiftId already exists (1:1 enforcement)
    const existingVisitResult = await docClient.send(new GetCommand({
      TableName: VISIT_TABLE,
      Key: { id: shiftId }
    }));

    if (existingVisitResult.Item) {
      throw new Error('Visit already exists for this shift. Each shift can have only one visit.');
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

    // 7. Update Shift.visitId = shiftId
    await docClient.send(new UpdateCommand({
      TableName: SHIFT_TABLE,
      Key: { id: shiftId },
      UpdateExpression: 'SET visitId = :visitId, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':visitId': shiftId,
        ':updatedAt': now
      }
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

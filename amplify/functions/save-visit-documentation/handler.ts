import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Table names from environment
const VISIT_TABLE = process.env.VISIT_TABLE_NAME!;
const NURSE_TABLE = process.env.NURSE_TABLE_NAME!;

type Handler = Schema['saveVisitDocumentation']['functionHandler'];

export const handler: Handler = async (event) => {
  const { shiftId, kardex, vitalsRecorded, medicationsAdministered, tasksCompleted } = event.arguments;

  // Extract user sub from identity context
  const rawIdentity = event.identity as any;
  const userId = rawIdentity?.sub || rawIdentity?.claims?.sub;

  if (!userId) {
    console.error('No user sub found in identity:', JSON.stringify(event.identity));
    throw new Error('Unauthorized: Missing user identity');
  }

  try {
    // 1. Look up caller's Nurse record by cognitoSub
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

    // 2. Verify visit exists
    const visitResult = await docClient.send(new GetCommand({
      TableName: VISIT_TABLE,
      Key: { id: shiftId },
    }));

    const visit = visitResult.Item;
    if (!visit) {
      throw new Error('Visit not found');
    }

    // 3. Verify visit belongs to the caller's tenant
    if (visit.tenantId !== tenantId) {
      throw new Error('Unauthorized: Visit belongs to different tenant');
    }

    // 4. Verify visit is assigned to the caller (nurse) or caller is admin
    if (visit.nurseId !== nurseRecordId && callerNurse.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only the assigned nurse or an admin can update this visit');
    }

    // 5. Verify visit is in an editable state
    if (visit.status !== 'DRAFT' && visit.status !== 'REJECTED') {
      throw new Error(`Cannot update visit with status: ${visit.status}. Visit must be DRAFT or REJECTED.`);
    }

    // 6. Parse JSON arguments
    const parsedKardex = typeof kardex === 'string' ? JSON.parse(kardex) : kardex;
    const parsedVitals = vitalsRecorded || null;
    const parsedMeds = typeof medicationsAdministered === 'string'
      ? JSON.parse(medicationsAdministered)
      : (medicationsAdministered || []);
    const parsedTasks = typeof tasksCompleted === 'string'
      ? JSON.parse(tasksCompleted)
      : (tasksCompleted || []);

    // 7. Update Visit record directly in DynamoDB
    const now = new Date().toISOString();
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: VISIT_TABLE,
      Key: { id: shiftId },
      UpdateExpression: 'SET kardex = :kardex, vitalsRecorded = :vitals, medicationsAdministered = :meds, tasksCompleted = :tasks, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':kardex': parsedKardex,
        ':vitals': parsedVitals,
        ':meds': parsedMeds,
        ':tasks': parsedTasks,
        ':updatedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    }));

    return {
      success: true,
      visitId: shiftId,
      status: updateResult.Attributes?.status || visit.status,
      message: 'Visit documentation saved successfully',
    };
  } catch (error) {
    console.error('Error saving visit documentation:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to save visit documentation: ${error.message}`);
    }
    throw new Error('Failed to save visit documentation');
  }
};

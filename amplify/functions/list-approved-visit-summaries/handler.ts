import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Table names from environment
const VISIT_TABLE = process.env.VISIT_TABLE_NAME!;
const NURSE_TABLE = process.env.NURSE_TABLE_NAME!;
const PATIENT_TABLE = process.env.PATIENT_TABLE_NAME!;
const SHIFT_TABLE = process.env.SHIFT_TABLE_NAME!;

type Handler = Schema['listApprovedVisitSummariesForFamily']['functionHandler'];

export const handler: Handler = async (event) => {
  const { patientId } = event.arguments;
  
  // Extract identity with type assertion (Cognito user pool auth)
  const identity = event.identity as { sub: string; claims: Record<string, string> };
  const userId = identity?.sub;
  const tenantId = identity?.claims?.['custom:tenantId'];

  if (!userId || !tenantId) {
    throw new Error('Unauthorized: Missing user identity or tenant');
  }

  try {
    // 1. Fetch patient and verify family member access
    const patientResult = await docClient.send(new GetCommand({
      TableName: PATIENT_TABLE,
      Key: { id: patientId }
    }));
    
    const patient = patientResult.Item;
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Verify tenant isolation
    if (patient.tenantId !== tenantId) {
      throw new Error('Unauthorized: Patient belongs to different tenant');
    }

    // Verify family member access
    const familyMembers = patient.familyMembers || [];
    if (!familyMembers.includes(userId)) {
      throw new Error('Unauthorized: User is not linked to this patient');
    }

    // 2. Fetch APPROVED visits only (using scan with filter - consider GSI for production)
    const visitsResult = await docClient.send(new ScanCommand({
      TableName: VISIT_TABLE,
      FilterExpression: 'tenantId = :tenantId AND patientId = :patientId AND #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':tenantId': tenantId,
        ':patientId': patientId,
        ':status': 'APPROVED'
      }
    }));

    const visits = visitsResult.Items || [];
    if (visits.length === 0) {
      return [];
    }

    // 3. Compute VisitSummary for each visit
    const summaries = await Promise.all(
      visits.map(async (visit) => {
        // Fetch nurse name
        const nurseResult = await docClient.send(new GetCommand({
          TableName: NURSE_TABLE,
          Key: { id: visit.nurseId }
        }));
        const nurseName = nurseResult.Item?.name || 'Unknown Nurse';

        // Fetch shift for duration
        const shiftResult = await docClient.send(new GetCommand({
          TableName: SHIFT_TABLE,
          Key: { id: visit.shiftId }
        }));
        const shift = shiftResult.Item;
        
        // Compute duration (if shift has start/end times)
        let duration: number | undefined;
        if (shift?.completedAt && shift?.scheduledTime) {
          const start = new Date(shift.scheduledTime).getTime();
          const end = new Date(shift.completedAt).getTime();
          duration = Math.round((end - start) / 60000); // minutes
        }

        // Extract key activities (sanitized)
        const keyActivities: string[] = [];
        if (visit.vitalsRecorded) {
          keyActivities.push('Vitals checked');
        }
        if (visit.medicationsAdministered && visit.medicationsAdministered.length > 0) {
          keyActivities.push('Medications administered');
        }
        if (visit.tasksCompleted && visit.tasksCompleted.length > 0) {
          keyActivities.push(`${visit.tasksCompleted.length} tasks completed`);
        }

        // Overall status (simplified from KARDEX)
        const overallStatus = visit.kardex?.generalObservations?.includes('stable') 
          ? 'Stable' 
          : 'Monitored';

        return {
          visitDate: shift?.scheduledTime || visit.createdAt || new Date().toISOString(),
          nurseName,
          duration,
          overallStatus,
          keyActivities,
          nextVisitDate: undefined, // TODO: Fetch next scheduled shift
        };
      })
    );

    return summaries;
  } catch (error) {
    console.error('Error listing approved visit summaries:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve visit summaries: ${error.message}`);
    }
    throw new Error('Failed to retrieve visit summaries');
  }
};

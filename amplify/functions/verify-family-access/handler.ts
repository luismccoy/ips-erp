import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Phase 16: Family Portal Access Code Verification
 * 
 * Verifies that a family member has the correct access code for a patient.
 * This replaces the hardcoded mock check (accessCode === '1234') in the frontend.
 * 
 * Security:
 * - Access codes are stored in Patient.accessCode field
 * - Verification happens server-side (not in frontend)
 * - Failed attempts are logged for security monitoring
 * 
 * @param patientId - Patient ID to verify access for
 * @param accessCode - Access code provided by family member
 * @returns { authorized: boolean, patientName?: string, error?: string }
 */
export const handler: Schema['verifyFamilyAccessCode']['functionHandler'] = async (event) => {
    console.log('🔐 Family Portal Access Verification:', JSON.stringify(event, null, 2));
    
    const { patientId, accessCode } = event.arguments;
    
    // Validation
    if (!patientId || !accessCode) {
        return {
            authorized: false,
            error: 'Código de acceso y ID de paciente son requeridos'
        };
    }
    
    try {
        // Fetch patient record from DynamoDB
        const getCommand = new GetCommand({
            TableName: process.env.PATIENT_TABLE_NAME!,
            Key: { id: patientId }
        });
        
        const result = await docClient.send(getCommand);
        
        if (!result.Item) {
            console.warn('⚠️  Patient not found:', patientId);
            return {
                authorized: false,
                error: 'Paciente no encontrado'
            };
        }
        
        const patient = result.Item;
        
        // Verify access code
        if (patient.accessCode === accessCode) {
            console.log('✅ Access granted for patient:', patient.name);
            return {
                authorized: true,
                patientName: patient.name
            };
        } else {
            console.warn('❌ Invalid access code for patient:', patientId);
            return {
                authorized: false,
                error: 'Código de acceso inválido'
            };
        }
        
    } catch (error) {
        console.error('❌ Error verifying family access:', error);
        return {
            authorized: false,
            error: 'Error al verificar acceso. Intente nuevamente.'
        };
    }
};

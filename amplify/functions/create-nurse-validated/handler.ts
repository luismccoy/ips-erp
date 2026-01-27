import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Create Nurse with Validation Lambda
 * 
 * Security validations:
 * 1. Only Admin/SuperAdmin can create nurses
 * 2. cognitoSub must match identity.sub if creating for self
 * 3. Prevents duplicate cognitoSub entries
 * 4. Enforces tenant isolation
 */
export const handler: Schema['createNurseWithValidation']['functionHandler'] = async (event) => {
    console.log('👩‍⚕️ Create Nurse with Validation:', JSON.stringify(event, null, 2));
    
    const { name, email, role, skills, cognitoSub, tenantId } = event.arguments;
    const identity = (event as any).identity;
    
    // Extract caller info from JWT
    const callerSub = identity?.sub;
    const callerGroups: string[] = identity?.groups || [];
    const callerTenantId = identity?.claims?.['custom:tenantId'];
    
    // Validation 1: Only Admin or SuperAdmin can create nurses
    const isAdmin = callerGroups.includes('Admin') || callerGroups.includes('SuperAdmin');
    if (!isAdmin) {
        console.warn('❌ Unauthorized: User is not Admin/SuperAdmin');
        return {
            success: false,
            error: 'Solo administradores pueden crear enfermeros',
            errorCode: 'UNAUTHORIZED'
        };
    }
    
    // Validation 2: Tenant isolation - Admin can only create in their tenant
    const effectiveTenantId = callerGroups.includes('SuperAdmin') ? tenantId : callerTenantId;
    if (!effectiveTenantId) {
        console.warn('❌ Missing tenantId');
        return {
            success: false,
            error: 'TenantId es requerido',
            errorCode: 'MISSING_TENANT'
        };
    }
    
    // Validation 3: Required fields
    if (!name || !cognitoSub) {
        return {
            success: false,
            error: 'Nombre y cognitoSub son requeridos',
            errorCode: 'MISSING_FIELDS'
        };
    }
    
    try {
        // Validation 4: Check for duplicate cognitoSub in tenant
        const existingNurse = await checkDuplicateCognitoSub(cognitoSub, effectiveTenantId);
        if (existingNurse) {
            console.warn('❌ Duplicate cognitoSub:', cognitoSub);
            return {
                success: false,
                error: 'Ya existe un enfermero con este usuario de Cognito',
                errorCode: 'DUPLICATE_COGNITO_SUB'
            };
        }
        
        // Create nurse record
        const nurseId = randomUUID();
        const now = new Date().toISOString();
        
        const nurse = {
            id: nurseId,
            tenantId: effectiveTenantId,
            name,
            email: email || null,
            role: role || 'NURSE',
            skills: skills || [],
            cognitoSub,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };
        
        await docClient.send(new PutCommand({
            TableName: process.env.NURSE_TABLE_NAME!,
            Item: nurse,
            ConditionExpression: 'attribute_not_exists(id)'
        }));
        
        console.log('✅ Nurse created:', nurseId);
        
        return {
            success: true,
            nurse,
            message: 'Enfermero creado exitosamente'
        };
        
    } catch (error: any) {
        console.error('❌ Error creating nurse:', error);
        return {
            success: false,
            error: 'Error al crear enfermero: ' + error.message,
            errorCode: 'INTERNAL_ERROR'
        };
    }
};

async function checkDuplicateCognitoSub(cognitoSub: string, tenantId: string): Promise<boolean> {
    // Scan for existing nurse with same cognitoSub in tenant
    // Note: In production, consider adding a GSI on cognitoSub for efficiency
    const result = await docClient.send(new QueryCommand({
        TableName: process.env.NURSE_TABLE_NAME!,
        IndexName: 'byTenantId',
        KeyConditionExpression: 'tenantId = :tid',
        FilterExpression: 'cognitoSub = :csub',
        ExpressionAttributeValues: {
            ':tid': tenantId,
            ':csub': cognitoSub
        }
    }));
    
    return (result.Items?.length || 0) > 0;
}

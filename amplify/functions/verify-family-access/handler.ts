import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Rate limiting constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Phase 16 + Phase 19: Family Portal Access Code Verification with Rate Limiting
 * 
 * Security Features:
 * - Access codes stored in Patient.accessCode field
 * - Server-side verification (not in frontend)
 * - Rate limiting: 5 failed attempts = 15 min lockout (Task 2.2)
 * - Audit logging for security events
 * 
 * @param patientId - Patient ID to verify access for
 * @param accessCode - Access code provided by family member
 * @returns { authorized: boolean, patientName?: string, error?: string, remainingAttempts?: number }
 */
export const handler: Schema['verifyFamilyAccessCode']['functionHandler'] = async (event) => {
    console.log('🔐 Family Portal Access Verification:', JSON.stringify(event, null, 2));
    
    const { patientId, accessCode } = event.arguments;
    const identity = (event as any).identity;
    const callerSub = identity?.sub || 'anonymous';
    
    // Validation
    if (!patientId || !accessCode) {
        return {
            authorized: false,
            error: 'Código de acceso y ID de paciente son requeridos'
        };
    }
    
    try {
        // Task 2.2: Check rate limiting
        const rateLimitKey = `${patientId}:${callerSub}`;
        const rateLimitResult = await checkRateLimit(rateLimitKey);
        
        if (rateLimitResult.isLocked) {
            const remainingMinutes = Math.ceil(rateLimitResult.remainingLockoutMs! / 60000);
            console.warn('🚫 Rate limit exceeded for:', rateLimitKey);
            
            // Log security event
            await logSecurityEvent(patientId, callerSub, 'RATE_LIMIT_EXCEEDED');
            
            return {
                authorized: false,
                error: `Demasiados intentos fallidos. Intente de nuevo en ${remainingMinutes} minutos.`,
                remainingAttempts: 0
            };
        }
        
        // Fetch patient record from DynamoDB
        const getCommand = new GetCommand({
            TableName: process.env.PATIENT_TABLE_NAME!,
            Key: { id: patientId }
        });
        
        const result = await docClient.send(getCommand);
        
        if (!result.Item) {
            console.warn('⚠️  Patient not found:', patientId);
            await incrementFailedAttempts(rateLimitKey);
            return {
                authorized: false,
                error: 'Paciente no encontrado',
                remainingAttempts: MAX_FAILED_ATTEMPTS - rateLimitResult.failedAttempts - 1
            };
        }
        
        const patient = result.Item;
        
        // Verify access code
        if (patient.accessCode === accessCode) {
            console.log('✅ Access granted for patient:', patient.name);
            
            // Reset failed attempts on success
            await resetFailedAttempts(rateLimitKey);
            
            // Log successful access
            await logSecurityEvent(patientId, callerSub, 'ACCESS_GRANTED', patient.tenantId);
            
            return {
                authorized: true,
                patientName: patient.name
            };
        } else {
            console.warn('❌ Invalid access code for patient:', patientId);
            
            // Increment failed attempts
            const newAttempts = await incrementFailedAttempts(rateLimitKey);
            const remaining = MAX_FAILED_ATTEMPTS - newAttempts;
            
            // Log failed attempt
            await logSecurityEvent(patientId, callerSub, 'ACCESS_DENIED', patient.tenantId);
            
            return {
                authorized: false,
                error: remaining > 0 
                    ? `Código de acceso inválido. ${remaining} intentos restantes.`
                    : 'Código de acceso inválido. Cuenta bloqueada por 15 minutos.',
                remainingAttempts: Math.max(0, remaining)
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

/**
 * Check rate limit status for a given key
 */
async function checkRateLimit(key: string): Promise<{
    isLocked: boolean;
    failedAttempts: number;
    remainingLockoutMs?: number;
}> {
    try {
        const result = await docClient.send(new GetCommand({
            TableName: process.env.RATE_LIMIT_TABLE_NAME || process.env.PATIENT_TABLE_NAME!,
            Key: { id: `ratelimit:${key}` }
        }));
        
        if (!result.Item) {
            return { isLocked: false, failedAttempts: 0 };
        }
        
        const { failedAttempts, lockedUntil } = result.Item;
        
        if (lockedUntil) {
            const now = Date.now();
            if (now < lockedUntil) {
                return {
                    isLocked: true,
                    failedAttempts,
                    remainingLockoutMs: lockedUntil - now
                };
            }
            // Lockout expired, reset
            await resetFailedAttempts(key);
            return { isLocked: false, failedAttempts: 0 };
        }
        
        return { isLocked: false, failedAttempts: failedAttempts || 0 };
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return { isLocked: false, failedAttempts: 0 };
    }
}

/**
 * Increment failed attempts counter
 */
async function incrementFailedAttempts(key: string): Promise<number> {
    try {
        const now = Date.now();
        const result = await docClient.send(new UpdateCommand({
            TableName: process.env.RATE_LIMIT_TABLE_NAME || process.env.PATIENT_TABLE_NAME!,
            Key: { id: `ratelimit:${key}` },
            UpdateExpression: 'SET failedAttempts = if_not_exists(failedAttempts, :zero) + :inc, updatedAt = :now',
            ExpressionAttributeValues: {
                ':zero': 0,
                ':inc': 1,
                ':now': now
            },
            ReturnValues: 'ALL_NEW'
        }));
        
        const newAttempts = result.Attributes?.failedAttempts || 1;
        
        // If max attempts reached, set lockout
        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
            await docClient.send(new UpdateCommand({
                TableName: process.env.RATE_LIMIT_TABLE_NAME || process.env.PATIENT_TABLE_NAME!,
                Key: { id: `ratelimit:${key}` },
                UpdateExpression: 'SET lockedUntil = :lockout',
                ExpressionAttributeValues: {
                    ':lockout': now + LOCKOUT_DURATION_MS
                }
            }));
        }
        
        return newAttempts;
    } catch (error) {
        console.error('Error incrementing failed attempts:', error);
        return 1;
    }
}

/**
 * Reset failed attempts counter
 */
async function resetFailedAttempts(key: string): Promise<void> {
    try {
        await docClient.send(new UpdateCommand({
            TableName: process.env.RATE_LIMIT_TABLE_NAME || process.env.PATIENT_TABLE_NAME!,
            Key: { id: `ratelimit:${key}` },
            UpdateExpression: 'SET failedAttempts = :zero, lockedUntil = :null, updatedAt = :now',
            ExpressionAttributeValues: {
                ':zero': 0,
                ':null': null,
                ':now': Date.now()
            }
        }));
    } catch (error) {
        console.error('Error resetting failed attempts:', error);
    }
}

/**
 * Log security event to AuditLog table
 */
async function logSecurityEvent(
    patientId: string,
    userId: string,
    action: string,
    tenantId?: string
): Promise<void> {
    try {
        const auditTableName = process.env.AUDITLOG_TABLE_NAME;
        if (!auditTableName) {
            console.warn('AUDITLOG_TABLE_NAME not configured, skipping audit log');
            return;
        }
        
        await docClient.send(new PutCommand({
            TableName: auditTableName,
            Item: {
                id: `audit:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
                tenantId: tenantId || 'SYSTEM',
                userId,
                userRole: 'FAMILY',
                action: 'FAMILY_ACCESS_ATTEMPT',
                entityType: 'Patient',
                entityId: patientId,
                timestamp: new Date().toISOString(),
                details: JSON.stringify({ action, patientId })
            }
        }));
    } catch (error) {
        console.error('Error logging security event:', error);
    }
}

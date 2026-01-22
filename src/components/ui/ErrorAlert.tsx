import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';


interface ErrorAlertProps {
    /** Title displayed at the top of the error alert */
    title?: string;
    /** Error message to display */
    message: string;
    /** Callback when dismiss button is clicked */
    onDismiss?: () => void;
    /** Callback when retry button is clicked - displays retry button when provided */
    onRetry?: () => void;
    /** Label for the retry button (default: "Reintentar") */
    retryLabel?: string;
    /** Whether the retry operation is in progress */
    isRetrying?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * ErrorAlert Component
 * 
 * A reusable error display component with optional retry functionality.
 * Supports dismissal, retry actions, and loading state during retry.
 * 
 * Features:
 * - Displays error title and message
 * - Optional dismiss button
 * - Optional retry button with customizable label
 * - Loading state during retry operation
 * - Spanish language labels (Colombian IPS context)
 * 
 * Requirements: 9.4, 9.6
 * 
 * @example
 * // Basic error alert
 * <ErrorAlert message="Error al cargar datos" />
 * 
 * @example
 * // With retry functionality
 * <ErrorAlert 
 *   title="Error de conexión"
 *   message="No se pudo conectar al servidor"
 *   onRetry={() => fetchData()}
 *   isRetrying={isLoading}
 * />
 * 
 * @example
 * // With dismiss and retry
 * <ErrorAlert 
 *   message="Error al guardar"
 *   onDismiss={() => setError(null)}
 *   onRetry={() => handleSave()}
 *   retryLabel="Intentar de nuevo"
 * />
 */
export function ErrorAlert({ 
    title = 'Error', 
    message, 
    onDismiss, 
    onRetry,
    retryLabel = 'Reintentar',
    isRetrying = false,
    className = '' 
}: ErrorAlertProps) {
    return (
        <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`} role="alert">
            <div className="flex items-start gap-4">
                {/* Error Icon */}
                <div className="flex-shrink-0 text-red-500 mt-1">
                    <AlertTriangle size={20} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-red-700">{message}</p>
                    
                    {/* Retry Button - Requirement 9.6 */}
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            disabled={isRetrying}
                            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={retryLabel}
                        >
                            <RefreshCw 
                                size={14} 
                                className={isRetrying ? 'animate-spin' : ''} 
                            />
                            {isRetrying ? 'Reintentando...' : retryLabel}
                        </button>
                    )}
                </div>
                
                {/* Dismiss Button */}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        disabled={isRetrying}
                        className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        <XCircle size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * Error type classification for appropriate error messages.
 * Used to determine the appropriate user-facing message based on error type.
 */
export type ErrorType = 'network' | 'auth' | 'validation' | 'server' | 'unknown';

/**
 * Gets a user-friendly error message based on error type.
 * All messages are in Spanish for the Colombian IPS context.
 * 
 * @param errorType - The type of error that occurred
 * @param details - Optional additional details to include
 * @returns User-friendly error message in Spanish
 * 
 * Validates: Requirement 9.4
 */
export function getErrorMessage(errorType: ErrorType, details?: string): string {
    const messages: Record<ErrorType, string> = {
        network: 'Error de conexión. Verifique su conexión a internet.',
        auth: 'Sesión expirada. Por favor inicie sesión nuevamente.',
        validation: details || 'Los datos ingresados no son válidos.',
        server: 'Error del servidor. Por favor intente más tarde.',
        unknown: 'Ha ocurrido un error inesperado. Por favor intente de nuevo.',
    };
    
    return messages[errorType];
}

/**
 * Classifies an error into an ErrorType based on its characteristics.
 * Useful for determining the appropriate error message to display.
 * 
 * @param error - The error to classify
 * @returns The classified error type
 */
export function classifyError(error: unknown): ErrorType {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        // Network errors
        if (
            message.includes('network') ||
            message.includes('fetch') ||
            message.includes('connection') ||
            message.includes('timeout') ||
            message.includes('offline')
        ) {
            return 'network';
        }
        
        // Authentication errors
        if (
            message.includes('unauthorized') ||
            message.includes('401') ||
            message.includes('403') ||
            message.includes('forbidden') ||
            message.includes('token') ||
            message.includes('session') ||
            message.includes('authentication')
        ) {
            return 'auth';
        }
        
        // Validation errors
        if (
            message.includes('validation') ||
            message.includes('invalid') ||
            message.includes('required') ||
            message.includes('400')
        ) {
            return 'validation';
        }
        
        // Server errors
        if (
            message.includes('500') ||
            message.includes('502') ||
            message.includes('503') ||
            message.includes('server')
        ) {
            return 'server';
        }
    }
    
    return 'unknown';
}

/**
 * Creates a standardized error handler that classifies errors and returns
 * appropriate user-facing messages.
 * 
 * @param error - The error to handle
 * @returns Object with error type and user-friendly message
 * 
 * @example
 * try {
 *   await fetchData();
 * } catch (error) {
 *   const { type, message } = handleError(error);
 *   setError(message);
 *   if (type === 'auth') {
 *     redirectToLogin();
 *   }
 * }
 */
export function handleError(error: unknown): { type: ErrorType; message: string } {
    const type = classifyError(error);
    const message = getErrorMessage(type, error instanceof Error ? error.message : undefined);
    
    // Log error for debugging
    console.error('[ErrorAlert] Error classified as:', type, error);
    
    return { type, message };
}

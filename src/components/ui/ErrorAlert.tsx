import { AlertTriangle, XCircle } from 'lucide-react';


interface ErrorAlertProps {
    title?: string;
    message: string;
    onDismiss?: () => void;
    className?: string;
}

export function ErrorAlert({ title = 'Error', message, onDismiss, className = '' }: ErrorAlertProps) {
    return (
        <div className={`bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 ${className}`} role="alert">
            <div className="flex-shrink-0 text-red-500 mt-1">
                <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-1">{title}</h3>
                <p className="text-sm text-red-700">{message}</p>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Dismiss"
                >
                    <XCircle size={20} />
                </button>
            )}
        </div>
    );
}

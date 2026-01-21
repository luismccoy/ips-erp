

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    className?: string;
}

export function LoadingSpinner({ size = 'md', label, className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-4',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-slate-200 border-t-blue-600 rounded-full animate-spin mb-2`}
                role="status"
                aria-label="Loading"
            />
            {label && (
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    {label}
                </p>
            )}
        </div>
    );
}

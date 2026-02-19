import React from 'react';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: Variant;
    /** Renders a small dot indicator before the text */
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    dot = false,
    className = '',
    ...props
}) => {
    const variants = {
        default: "bg-blue-50 text-blue-700",
        success: "bg-green-50 text-green-700",
        warning: "bg-amber-50 text-amber-700",
        error: "bg-red-50 text-red-700",
        info: "bg-sky-50 text-sky-700",
        neutral: "bg-slate-100 text-slate-600",
    };

    const dotColors = {
        default: "bg-blue-500",
        success: "bg-green-500",
        warning: "bg-amber-500",
        error: "bg-red-500",
        info: "bg-sky-500",
        neutral: "bg-slate-400",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${variants[variant]} ${className}`}
            {...props}
        >
            {dot && (
                <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]} flex-shrink-0`} />
            )}
            {children}
        </span>
    );
};

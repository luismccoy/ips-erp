import React from 'react';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: Variant;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = '',
    ...props
}) => {
    const variants = {
        default: "bg-indigo-100 text-indigo-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        error: "bg-red-100 text-red-800",
        info: "bg-sky-100 text-sky-800",
        neutral: "bg-slate-100 text-slate-800",
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};

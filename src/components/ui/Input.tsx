import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    fullWidth = true,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''} ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-bold text-slate-700"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
                    px-4 py-2.5 rounded-xl border border-slate-200 bg-white
                    text-slate-900 font-medium placeholder:text-slate-400
                    transition-all duration-200 outline-none
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-50
                    disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
                    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : ''}
                `}
                {...props}
            />
            {error && (
                <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                    {/* Optional: Add icon here if desired */}
                    {error}
                </span>
            )}
        </div>
    );
};

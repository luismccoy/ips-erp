import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'cta';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
    icon?: React.ReactNode;
    /** Show success animation (check + green flash) after click resolves */
    showSuccess?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    showSuccess = false,
    className = '',
    disabled,
    onClick,
    ...props
}) => {
    const [successFlash, setSuccessFlash] = useState(false);
    const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleKey = useRef(0);

    const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
        // Ripple effect
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            rippleKey.current += 1;
            setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, key: rippleKey.current });
            setTimeout(() => setRipple(null), 500);
        }

        if (onClick) {
            const result = onClick(e) as any;
            if (showSuccess && result?.then) {
                try {
                    await result;
                    setSuccessFlash(true);
                    setTimeout(() => setSuccessFlash(false), 1200);
                } catch { /* let caller handle errors */ }
            }
        }
    }, [onClick, showSuccess]);

    const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg overflow-hidden";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus:ring-blue-500",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm focus:ring-slate-200",
        outline: "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm focus:ring-green-500",
        cta: "bg-[#E8594F] text-white hover:bg-[#D14940] shadow-sm shadow-red-200/50 focus:ring-red-400",
    };

    const sizes = {
        sm: "text-xs px-3 py-1.5 gap-1.5",
        md: "text-sm px-4 py-2 gap-2",
        lg: "text-base px-6 py-3 gap-2.5",
        xl: "h-14 rounded-lg px-8 text-lg gap-3",
    };

    const activeVariant = successFlash ? 'success' : variant;

    return (
        <motion.button
            ref={buttonRef as any}
            className={`${baseStyles} ${variants[activeVariant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
            whileTap={disabled || isLoading ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={handleClick}
            {...props}
        >
            {/* Ripple */}
            {ripple && (
                <motion.span
                    key={ripple.key}
                    className="absolute bg-white/30 rounded-full pointer-events-none"
                    initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y, opacity: 0.5 }}
                    animate={{ width: 200, height: 200, x: ripple.x - 100, y: ripple.y - 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            )}

            {isLoading ? (
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : successFlash ? (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                    <Check size={16} />
                </motion.span>
            ) : (
                icon
            )}
            {!isLoading && !successFlash && children}
            {successFlash && <span className="text-sm">Listo</span>}
        </motion.button>
    );
};

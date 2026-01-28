import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
    disableAnimation?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    noPadding = false,
    disableAnimation = false,
    ...props
}) => {
    return (
        <motion.div
            className={`bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}
            initial={disableAnimation ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={disableAnimation ? {} : { scale: 1.01 }}
            transition={{ 
                duration: 0.2,
                ease: "easeOut"
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

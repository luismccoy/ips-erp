import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
    disableAnimation?: boolean;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    noPadding = false,
    disableAnimation = false,
    hoverable = false,
    ...props
}) => {
    return (
        <motion.div
            className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${noPadding ? '' : 'p-6'} ${hoverable ? 'hover:shadow-md transition-shadow duration-200' : ''} ${className}`}
            initial={disableAnimation ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.25,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    return <div className={`p-6 pt-0 ${className}`} {...props} />;
};

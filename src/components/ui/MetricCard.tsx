import React from 'react';
import { motion } from 'framer-motion';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';

type TrendDirection = 'up' | 'down' | 'neutral';
type ColorVariant = 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'teal' | 'slate';

interface MetricCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    trend?: string;
    trendDirection?: TrendDirection;
    color?: ColorVariant;
    className?: string;
    delay?: number;
}

const colorMap: Record<ColorVariant, { iconBg: string; iconText: string }> = {
    blue:   { iconBg: 'bg-blue-50',   iconText: 'text-blue-600' },
    green:  { iconBg: 'bg-green-50',  iconText: 'text-green-600' },
    purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-600' },
    amber:  { iconBg: 'bg-amber-50',  iconText: 'text-amber-600' },
    red:    { iconBg: 'bg-red-50',    iconText: 'text-red-600' },
    teal:   { iconBg: 'bg-teal-50',   iconText: 'text-teal-600' },
    slate:  { iconBg: 'bg-slate-100', iconText: 'text-slate-600' },
};

const trendConfig: Record<TrendDirection, { icon: React.FC<any>; color: string }> = {
    up:      { icon: TrendUp,   color: 'text-green-600 bg-green-50' },
    down:    { icon: TrendDown, color: 'text-red-600 bg-red-50' },
    neutral: { icon: Minus,        color: 'text-slate-500 bg-slate-100' },
};

export function MetricCard({
    icon,
    value,
    label,
    trend,
    trendDirection = 'neutral',
    color = 'blue',
    className = '',
    delay = 0,
}: MetricCardProps) {
    const colors = colorMap[color];
    const trendCfg = trendConfig[trendDirection];
    const TrendIcon = trendCfg.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 ${className}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${colors.iconBg} ${colors.iconText}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trendCfg.color}`}>
                        <TrendIcon size={12} />
                        {trend}
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</div>
        </motion.div>
    );
}

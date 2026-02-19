import React from 'react';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'busy';

interface AvatarProps {
    name: string;
    src?: string;
    size?: AvatarSize;
    status?: AvatarStatus;
    className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
};

const statusDotSizes: Record<AvatarSize, string> = {
    sm: 'h-2 w-2 border',
    md: 'h-2.5 w-2.5 border-[1.5px]',
    lg: 'h-3 w-3 border-2',
    xl: 'h-3.5 w-3.5 border-2',
};

const statusColors: Record<AvatarStatus, string> = {
    online: 'bg-green-500',
    offline: 'bg-slate-400',
    busy: 'bg-red-500',
};

// Stable color palette for initials backgrounds
const bgColors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-teal-100 text-teal-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-sky-100 text-sky-700',
];

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function getColorIndex(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % bgColors.length;
}

export function Avatar({ name, src, size = 'md', status, className = '' }: AvatarProps) {
    const [imgError, setImgError] = React.useState(false);
    const showImage = src && !imgError;

    return (
        <div className={`relative inline-flex flex-shrink-0 ${className}`}>
            {showImage ? (
                <img
                    src={src}
                    alt={name}
                    onError={() => setImgError(true)}
                    className={`${sizeClasses[size]} rounded-full object-cover`}
                />
            ) : (
                <div className={`${sizeClasses[size]} ${bgColors[getColorIndex(name)]} rounded-full flex items-center justify-center font-semibold`}>
                    {getInitials(name)}
                </div>
            )}
            {status && (
                <span className={`absolute bottom-0 right-0 ${statusDotSizes[size]} ${statusColors[status]} border-white rounded-full`} />
            )}
        </div>
    );
}

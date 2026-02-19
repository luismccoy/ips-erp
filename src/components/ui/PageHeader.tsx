import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
    label: string;
    onClick?: () => void;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
    className?: string;
}

export function PageHeader({
    title,
    subtitle,
    actions,
    breadcrumbs,
    className = '',
}: PageHeaderProps) {
    return (
        <div className={`mb-6 ${className}`}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 mb-2 text-xs text-slate-400">
                    {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <ChevronRight size={12} className="text-slate-300" />}
                            {crumb.onClick ? (
                                <button
                                    onClick={crumb.onClick}
                                    className="hover:text-slate-600 transition-colors"
                                >
                                    {crumb.label}
                                </button>
                            ) : (
                                <span className="text-slate-500 font-medium">{crumb.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}

import React from 'react';
import { AlertTriangle, Info, XCircle, X, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export type SuggestionSeverity = 'error' | 'warning' | 'info';

export interface AISuggestion {
    id: string;
    severity: SuggestionSeverity;
    field: string;
    message: string;
    recommendedAction?: string;
    autoFixAvailable?: boolean;
}

interface AISuggestionCardProps {
    suggestion: AISuggestion;
    onDismiss: (suggestionId: string) => void;
    onApply?: (suggestionId: string) => void;
    className?: string;
}

export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
    suggestion,
    onDismiss,
    onApply,
    className = '',
}) => {
    const { id, severity, field, message, recommendedAction, autoFixAvailable } = suggestion;

    // Icon and color configuration based on severity
    const severityConfig = {
        error: {
            icon: XCircle,
            badgeVariant: 'error' as const,
            borderColor: 'border-red-200',
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            label: 'Error',
        },
        warning: {
            icon: AlertTriangle,
            badgeVariant: 'warning' as const,
            borderColor: 'border-amber-200',
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
            label: 'Advertencia',
        },
        info: {
            icon: Info,
            badgeVariant: 'info' as const,
            borderColor: 'border-sky-200',
            bgColor: 'bg-sky-50',
            iconColor: 'text-sky-600',
            label: 'Información',
        },
    };

    const config = severityConfig[severity];
    const SeverityIcon = config.icon;

    return (
        <Card
            className={`relative ${config.borderColor} border-l-4 ${config.bgColor} ${className}`}
            noPadding
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                        {/* Icon */}
                        <div className={`flex-shrink-0 ${config.iconColor}`}>
                            <SeverityIcon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant={config.badgeVariant}>
                                    {config.label}
                                </Badge>
                                <span className="text-xs font-medium text-slate-600">
                                    Campo: {field}
                                </span>
                            </div>

                            <p className="text-sm text-slate-800 font-medium mb-1">
                                {message}
                            </p>

                            {recommendedAction && (
                                <p className="text-sm text-slate-600 mt-2">
                                    <span className="font-semibold">Recomendación:</span> {recommendedAction}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                        onClick={() => onDismiss(id)}
                        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Dismiss suggestion"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Actions */}
                {autoFixAvailable && onApply && (
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                        <Button
                            size="sm"
                            variant="primary"
                            icon={<Check className="w-4 h-4" />}
                            onClick={() => onApply(id)}
                        >
                            Aplicar Corrección
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

/**
 * Container component for displaying multiple AI suggestions
 */
interface AISuggestionListProps {
    suggestions: AISuggestion[];
    onDismiss: (suggestionId: string) => void;
    onApply?: (suggestionId: string) => void;
    className?: string;
}

export const AISuggestionList: React.FC<AISuggestionListProps> = ({
    suggestions,
    onDismiss,
    onApply,
    className = '',
}) => {
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" />
                Sugerencias de IA ({suggestions.length})
            </h3>
            {suggestions.map((suggestion) => (
                <AISuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onDismiss={onDismiss}
                    onApply={onApply}
                />
            ))}
        </div>
    );
};

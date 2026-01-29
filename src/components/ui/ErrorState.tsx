import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Error al cargar datos',
    message,
    onRetry
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in duration-300">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-red-600" size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-6 font-medium">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 min-h-[44px]"
                >
                    <RefreshCw size={18} />
                    Reintentar
                </button>
            )}
        </div>
    );
};

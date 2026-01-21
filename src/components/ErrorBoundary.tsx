import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleRetry = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-slate-800 mb-2">
                                Algo salió mal
                            </h1>

                            <p className="text-slate-500 mb-8">
                                Ha ocurrido un error inesperado. Nuestro equipo técnico ha sido notificado automáticamente.
                            </p>

                            {/* Show error details only in development */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="text-left bg-slate-100 p-4 rounded-lg mb-6 overflow-auto max-h-48 text-xs font-mono text-slate-700">
                                    <p className="font-bold mb-1 text-red-600">{this.state.error.toString()}</p>
                                    {this.state.errorInfo?.componentStack}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={this.handleRetry}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
                                >
                                    Intentar Nuevamente
                                </button>

                                <button
                                    onClick={this.handleGoHome}
                                    className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border border-slate-200 transition-all duration-200 text-sm"
                                >
                                    Ir al Inicio
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400">
                                Si el problema persiste, contacte a soporte técnico.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

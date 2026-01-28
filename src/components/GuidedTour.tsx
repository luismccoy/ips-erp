/**
 * GuidedTour Component
 * 
 * Interactive guided tour for demo users using React Joyride.
 * Walks users through key features of the IPS ERP system.
 */

import { useState, useEffect } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';
import type { Step, CallBackProps } from 'react-joyride';

interface GuidedTourProps {
    /** Current view in the admin dashboard */
    currentView: string;
    /** Callback to change the current view */
    onViewChange: (view: string) => void;
    /** Whether to start the tour automatically */
    autoStart?: boolean;
}

// Custom styles matching IPS ERP design system
const tourStyles = {
    options: {
        primaryColor: '#2563eb',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        arrowColor: '#ffffff',
        overlayColor: 'rgba(15, 23, 42, 0.4)', // Reduced opacity to 0.4 for less intrusive overlay
        zIndex: 10000,
    },
    overlay: {
        backgroundColor: 'rgba(15, 23, 42, 0.4)', // Ensure consistent overlay color
    },
    buttonNext: {
        backgroundColor: '#2563eb',
        borderRadius: '12px',
        color: '#ffffff',
        fontWeight: 700,
        padding: '10px 20px',
    },
    buttonBack: {
        color: '#64748b',
        fontWeight: 600,
    },
    buttonSkip: {
        color: '#64748b',
        fontWeight: 600,
        fontSize: '14px',
        padding: '8px 16px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
    },
    tooltip: {
        borderRadius: '16px',
        padding: '20px',
    },
    tooltipTitle: {
        fontSize: '18px',
        fontWeight: 800,
    },
    tooltipContent: {
        fontSize: '14px',
        lineHeight: '1.6',
    },
};

export function GuidedTour({ currentView, onViewChange, autoStart = false }: GuidedTourProps) {
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [showWelcome, setShowWelcome] = useState(true);

    // Centralized cleanup function to ensure consistent state reset
    const cleanupTour = () => {
        setRun(false);
        setStepIndex(0);
        setShowWelcome(false);
        sessionStorage.setItem('ips-demo-tour-completed', 'true');
        onViewChange('dashboard');
    };

    // Check if user has seen the tour before
    useEffect(() => {
        const hasSeenTour = sessionStorage.getItem('ips-demo-tour-completed');
        if (!hasSeenTour && autoStart) {
            setShowWelcome(true);
        }
    }, [autoStart]);

    // Cleanup on unmount - ensure tour state is reset if component unmounts while running
    useEffect(() => {
        return () => {
            // Reset tour state on unmount to prevent stuck overlays
            setRun(false);
            setStepIndex(0);
            setShowWelcome(false);
        };
    }, []);

    // ESC key handler - allow users to exit tour with ESC key
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && (run || showWelcome)) {
                cleanupTour();
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [run, showWelcome, cleanupTour]);

    const steps: Step[] = [
        // Step 0: Dashboard Overview
        {
            target: '[data-tour="dashboard-stats"]',
            content: (
                <div>
                    <p className="mb-2">📊 <strong>Panel de Control</strong></p>
                    <p>Aquí ve un resumen en tiempo real: <strong>8 pacientes activos</strong>, <strong>12 turnos programados</strong>, y alertas de inventario.</p>
                </div>
            ),
            title: '¡Bienvenido al Centro de Comando!',
            placement: 'bottom',
            disableBeacon: true,
        },
        // Step 1: Navigate to Roster
        {
            target: '[data-tour="nav-roster"]',
            content: (
                <div>
                    <p className="mb-2">📅 <strong>Programación de Turnos</strong></p>
                    <p>Gestione todos los turnos de enfermería. Haga clic aquí para ver la <strong>magia de la IA</strong>.</p>
                </div>
            ),
            title: 'Gestión Inteligente de Turnos',
            placement: 'right',
            spotlightClicks: true,
        },
        // Step 2: AI Optimizer Button
        {
            target: '[data-tour="ai-optimizer"]',
            content: (
                <div>
                    <p className="mb-2">🤖 <strong>¡Pruébelo Ahora!</strong></p>
                    <p>Tenemos <strong>3 turnos sin asignar</strong>. Haga clic en este botón y observe cómo la IA asigna enfermeras automáticamente basándose en habilidades y ubicación.</p>
                </div>
            ),
            title: 'Optimización con IA',
            placement: 'bottom',
            spotlightClicks: true,
        },
        // Step 3: Navigate to Billing
        {
            target: '[data-tour="nav-billing"]',
            content: (
                <div>
                    <p className="mb-2">💰 <strong>Facturación y RIPS</strong></p>
                    <p>Aquí es donde la IA realmente brilla. Vamos a ver cómo <strong>defiende sus glosas automáticamente</strong>.</p>
                </div>
            ),
            title: 'Facturación Inteligente',
            placement: 'right',
            spotlightClicks: true,
        },
        // Step 4: AI Glosa Defender
        {
            target: '[data-tour="ai-glosa"]',
            content: (
                <div>
                    <p className="mb-2">⚖️ <strong>Defensor de Glosas con IA</strong></p>
                    <p>Tenemos <strong>2 facturas glosadas</strong>. Haga clic aquí para generar una carta de defensa técnica basada en la historia clínica del paciente.</p>
                    <p className="mt-2 text-sm text-slate-500">La IA cita regulaciones colombianas (Res 3100, Ley 100) automáticamente.</p>
                </div>
            ),
            title: 'Recupere su Dinero',
            placement: 'left',
            spotlightClicks: true,
        },
        // Step 5: Navigate to Pending Reviews
        {
            target: '[data-tour="nav-pending"]',
            content: (
                <div>
                    <p className="mb-2">✅ <strong>Flujo de Aprobación</strong></p>
                    <p>Las enfermeras documentan visitas en campo. Usted las revisa y aprueba aquí. Veamos las <strong>2 visitas pendientes</strong>.</p>
                </div>
            ),
            title: 'Control de Calidad',
            placement: 'right',
            spotlightClicks: true,
        },
        // Step 6: Pending Reviews Panel
        {
            target: '[data-tour="pending-list"]',
            content: (
                <div>
                    <p className="mb-2">📋 <strong>Documentación Completa</strong></p>
                    <p>Cada visita incluye: <strong>KARDEX</strong>, signos vitales, medicamentos administrados, y tareas completadas. Todo auditable para la Supersalud.</p>
                </div>
            ),
            title: 'Visitas Pendientes de Revisión',
            placement: 'top',
        },
        // Step 7: Navigate to Inventory
        {
            target: '[data-tour="nav-inventory"]',
            content: (
                <div>
                    <p className="mb-2">📦 <strong>Control de Inventario</strong></p>
                    <p>Vea alertas de stock bajo y productos agotados. El sistema tiene <strong>4 items en bajo stock</strong> y <strong>2 agotados</strong>.</p>
                </div>
            ),
            title: 'Nunca se Quede Sin Insumos',
            placement: 'right',
            spotlightClicks: true,
        },
        // Step 8: Final - Patients
        {
            target: '[data-tour="nav-patients"]',
            content: (
                <div>
                    <p className="mb-2">👥 <strong>Gestión de Pacientes</strong></p>
                    <p>Acceda a los <strong>8 perfiles de pacientes</strong> con diagnósticos, EPS, historial de signos vitales, y medicamentos activos.</p>
                </div>
            ),
            title: 'Historias Clínicas Completas',
            placement: 'right',
            spotlightClicks: true,
        },
        // Step 9: Completion
        {
            target: '[data-tour="dashboard-stats"]',
            content: (
                <div>
                    <p className="mb-3">🎉 <strong>¡Tour Completado!</strong></p>
                    <p>Ha visto las funciones principales de IPS ERP:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>IA para optimizar turnos</li>
                        <li>IA para defender glosas</li>
                        <li>Flujo de aprobación de visitas</li>
                        <li>Control de inventario</li>
                        <li>Gestión de pacientes y personal</li>
                    </ul>
                    <p className="mt-3 text-sm text-slate-500">Explore libremente o use el botón de feedback para compartir sus impresiones.</p>
                </div>
            ),
            title: '¡Gracias por Explorar IPS ERP!',
            placement: 'center',
        },
    ];

    // Handle tour callbacks
    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, index, action } = data;

        // Handle step changes that require navigation
        if (type === EVENTS.STEP_AFTER) {
            if (index === 1 && action === 'next') {
                // After clicking nav-roster, navigate to roster
                onViewChange('roster');
            } else if (index === 3 && action === 'next') {
                // After clicking nav-billing, navigate to billing
                onViewChange('billing');
            } else if (index === 5 && action === 'next') {
                // After clicking nav-pending, navigate to pending-reviews
                onViewChange('pending-reviews');
            } else if (index === 7 && action === 'next') {
                // After clicking nav-inventory, navigate to inventory
                onViewChange('inventory');
            } else if (index === 8 && action === 'next') {
                // After clicking nav-patients, navigate to patients then back to dashboard
                onViewChange('patients');
                setTimeout(() => onViewChange('dashboard'), 500);
            }
            setStepIndex(index + 1);
        }

        // Handle target click navigation
        if (type === EVENTS.TARGET_NOT_FOUND) {
            // If target not found, try to navigate to the right view
            console.log('Target not found, current step:', index);
        }

        // Handle tour completion - ensure ALL exit paths clear state properly
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            cleanupTour();
        }

        // Also handle close button click (X button)
        if (action === 'close' || action === 'skip') {
            cleanupTour();
        }
    };

    const startTour = () => {
        setShowWelcome(false);
        setRun(true);
        setStepIndex(0);
        onViewChange('dashboard');
    };

    const skipTour = () => {
        cleanupTour();
    };

    // Welcome Modal
    if (showWelcome) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-300">
                    <div className="text-center">
                        <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                            <span className="text-4xl">🏥</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3">
                            ¡Bienvenido a IPS ERP!
                        </h2>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Le guiaremos por las funciones principales del sistema en <strong>menos de 2 minutos</strong>. 
                            Verá cómo la <strong>Inteligencia Artificial</strong> optimiza su operación de atención domiciliaria.
                        </p>
                        
                        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                            <p className="text-sm font-bold text-slate-700 mb-2">Lo que verá:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">🤖 IA Roster</span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">⚖️ IA Glosas</span>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">✅ Aprobaciones</span>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">📦 Inventario</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={startTour}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                            >
                                <span>🚀</span> Comenzar Tour Guiado
                            </button>
                            <button
                                onClick={skipTour}
                                className="w-full py-3 text-slate-500 font-medium hover:text-slate-700 transition-colors"
                            >
                                Explorar por mi cuenta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Joyride
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            continuous
            showProgress
            showSkipButton
            hideCloseButton={false}
            disableOverlayClose={false} // Allow clicking overlay to close (was true, changed to false)
            disableScrolling={false}
            spotlightClicks={true}
            spotlightPadding={0}
            callback={handleJoyrideCallback}
            styles={tourStyles}
            locale={{
                back: 'Atrás',
                close: 'Cerrar',
                last: '¡Finalizar!',
                next: 'Siguiente',
                skip: '✕ Saltar Tour', // Added icon for better visibility
            }}
            floaterProps={{
                disableAnimation: false,
            }}
        />
    );
}

// Export a button to restart the tour
export function RestartTourButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={() => {
                sessionStorage.removeItem('ips-demo-tour-completed');
                onClick();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
            <span>🎯</span> Reiniciar Tour
        </button>
    );
}

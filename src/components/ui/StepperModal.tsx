import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

export interface Step {
    label: string;
    content: React.ReactNode;
    validate?: () => boolean;
}

interface StepperModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void | Promise<void>;
    title: string;
    steps: Step[];
    maxWidth?: 'md' | 'lg' | 'xl' | '2xl';
    submitLabel?: string;
}

export function StepperModal({
    isOpen,
    onClose,
    onComplete,
    title,
    steps,
    maxWidth = 'lg',
    submitLabel = 'Confirmar',
}: StepperModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
    const [isSubmitting, setIsSubmitting] = useState(false);

    const maxWidthClasses = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    const handleNext = useCallback(() => {
        const step = steps[currentStep];
        if (step.validate && !step.validate()) return;

        if (currentStep < steps.length - 1) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, steps]);

    const handleBack = useCallback(() => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleSubmit = useCallback(async () => {
        const step = steps[currentStep];
        if (step.validate && !step.validate()) return;

        setIsSubmitting(true);
        try {
            await onComplete();
            setCurrentStep(0);
        } finally {
            setIsSubmitting(false);
        }
    }, [currentStep, steps, onComplete]);

    const handleClose = useCallback(() => {
        setCurrentStep(0);
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    const isLastStep = currentStep === steps.length - 1;

    const slideVariants = {
        enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className={`w-full ${maxWidthClasses[maxWidth]} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Stepper Progress */}
                        <div className="px-6 py-4 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                {steps.map((step, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                animate={{
                                                    backgroundColor: index < currentStep ? '#2563EB' : index === currentStep ? '#FFFFFF' : '#F1F5F9',
                                                    borderColor: index <= currentStep ? '#2563EB' : '#E2E8F0',
                                                    scale: index === currentStep ? 1.1 : 1,
                                                }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                className="h-8 w-8 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                            >
                                                {index < currentStep ? (
                                                    <Check size={14} className="text-white" />
                                                ) : (
                                                    <span className={`text-xs font-bold ${index === currentStep ? 'text-blue-600' : 'text-slate-400'}`}>
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </motion.div>
                                            <span className={`text-xs font-medium hidden sm:block ${
                                                index <= currentStep ? 'text-slate-700' : 'text-slate-400'
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className="flex-1 mx-3 h-[2px] bg-slate-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: index < currentStep ? '100%' : '0%' }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 relative min-h-[200px]">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                >
                                    {steps[currentStep].content}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-0 disabled:pointer-events-none"
                            >
                                <ChevronLeft size={16} />
                                Atrás
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 mr-2">
                                    {currentStep + 1} de {steps.length}
                                </span>
                                {isLastStep ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Check size={16} />
                                        )}
                                        {submitLabel}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                                    >
                                        Siguiente
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

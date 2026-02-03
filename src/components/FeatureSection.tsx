import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
    BillingAuditIcon,
    ProcessFlowIcon,
    SchedulingIcon,
    ComplianceShieldIcon,
} from './ui/healthcare-icons';

const FEATURES = [
    {
        id: 'glosas',
        title: 'Glosas',
        label: 'Glosas',
        description: 'Reduzca objeciones con auditoría de IA en tiempo real.',
        points: [
            'Detección automática de inconsistencias.',
            'Respuestas legales basadas en normativa.',
            'Trazabilidad total de cada objeción.'
        ],
        image: '/images/challenge-glosadas.png',
        icon: BillingAuditIcon,
        color: '#ef4444'
    },
    {
        id: 'manuales',
        title: 'Manuales',
        label: 'Manuales',
        description: 'Digitalice su operación. Cero papel.',
        points: [
            'Conversión a registros digitales.',
            'Estandarización de procesos.',
            'Acceso desde cualquier lugar.'
        ],
        image: '/images/challenge-manuales.png',
        icon: ProcessFlowIcon,
        color: '#f59e0b'
    },
    {
        id: 'planillas',
        title: 'Planillas',
        label: 'Planillas',
        description: 'Rutas y turnos optimizados por IA.',
        points: [
            'Asignación inteligente por ubicación.',
            'Seguimiento en tiempo real.',
            'Reducción de costos operativos.'
        ],
        image: '/images/challenge-planillas.png',
        icon: SchedulingIcon,
        color: '#3b82f6'
    },
    {
        id: 'cumplimiento',
        title: 'Cumplimiento',
        label: 'Cumplimiento',
        description: 'Cumplimiento total con Res. 3100.',
        points: [
            'Monitoreo de indicadores de calidad.',
            'Alertas preventivas automáticas.',
            'Reportes para entes de control.'
        ],
        image: '/images/challenge-cumplimiento.png',
        icon: ComplianceShieldIcon,
        color: '#8b5cf6'
    }
];

export default function FeatureSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Map scroll progress to feature index
    const indexThresholds = FEATURES.map((_, i) => i / FEATURES.length);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Find the closest index based on scroll progress
            const newIndex = FEATURES.findIndex((_, i) => {
                const start = i / FEATURES.length;
                const end = (i + 1) / FEATURES.length;
                return latest >= start && latest < end;
            });

            if (newIndex !== -1 && newIndex !== activeIndex) {
                setActiveIndex(newIndex);
            } else if (latest >= 0.99) {
                setActiveIndex(FEATURES.length - 1);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, activeIndex]);

    const handleTabClick = (index: number) => {
        if (!containerRef.current) return;
        const sectionHeight = containerRef.current.offsetHeight;
        const targetScroll = containerRef.current.offsetTop + (index / FEATURES.length) * sectionHeight;
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    };

    return (
        <section ref={containerRef} className="relative h-[400vh] bg-slate-50">
            {/* STICKY CONTAINER */}
            <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">

                        {/* LEFT: VERTICAL NAV - HIDDEN ON MOBILE */}
                        <div className="hidden lg:flex lg:w-1/5 flex-col gap-10 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />

                            {/* SLIDING INDICATOR */}
                            <motion.div
                                className="absolute left-0 w-1.5 bg-primary z-10"
                                initial={false}
                                animate={{
                                    top: `${(activeIndex * 100) / FEATURES.length}%`,
                                    height: `${100 / FEATURES.length}%`
                                }}
                                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                            />

                            {FEATURES.map((feature, index) => (
                                <button
                                    key={feature.id}
                                    onClick={() => handleTabClick(index)}
                                    className={`pl-10 py-3 text-left transition-all duration-500 group relative ${activeIndex === index
                                        ? 'text-slate-900 font-bold'
                                        : 'text-slate-400 font-medium hover:text-slate-600'
                                        }`}
                                >
                                    <span className="text-2xl tracking-tight block transition-transform group-hover:translate-x-1">{feature.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* RIGHT: ANIMATED CONTENT - ULTRA WIDE */}
                        <div className="lg:w-[80%] xl:w-[85%] w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 lg:p-20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100/60 flex flex-col lg:flex-row gap-12 lg:gap-24 items-center min-h-[600px] lg:min-h-[700px] relative overflow-hidden"
                                >
                                    {/* Subtle decorative background element */}
                                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-slate-50/50 -rotate-12 translate-x-1/2 -translate-y-1/2 rounded-[100px] -z-0" />

                                    {/* Content Text */}
                                    <div className="flex-[4] space-y-6 lg:space-y-8 relative z-10">
                                        <div className="flex items-center gap-3 lg:gap-5">
                                            <div className="p-3 lg:p-4 rounded-2xl bg-white text-primary border border-slate-100 shadow-lg shadow-blue-500/5">
                                                {React.createElement(FEATURES[activeIndex].icon, { size: 32 })}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]">Sistema IPS-ERP</div>
                                                <div className="text-primary font-bold text-xs tracking-wide">
                                                    Módulo: <span className="text-slate-900">{FEATURES[activeIndex].label}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight leading-snug" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)' }}>
                                            {FEATURES[activeIndex].description}
                                        </h3>

                                        <ul className="space-y-4">
                                            {FEATURES[activeIndex].points.map((point, i) => (
                                                <li key={i} className="flex gap-3 text-slate-600 text-sm lg:text-base leading-relaxed">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0 opacity-60" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Content Image - CINEMATIC */}
                                    <div className="flex-[6] w-full h-[500px] lg:h-[650px] rounded-[32px] overflow-hidden shadow-2xl bg-slate-200 relative group/img z-10">
                                        <motion.img
                                            src={FEATURES[activeIndex].image}
                                            alt={FEATURES[activeIndex].title}
                                            className="w-full h-full object-cover"
                                            initial={{ scale: 1.2, filter: 'blur(4px)' }}
                                            animate={{ scale: 1, filter: 'blur(0px)' }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/20 to-transparent opacity-60"></div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

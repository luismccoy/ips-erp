import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import {
    Heartbeat,
    ShieldCheck,
    FileText,
    MapPin,
    Warning,
    Invoice,
    FlowArrow,
    CalendarBlank
} from '@phosphor-icons/react';

// Real Application UI Replicas
const GlosasUI = () => (
    <div className="w-full h-full bg-slate-50 p-6 flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
            <div className="text-slate-800 font-bold text-lg">Auditoría Clínica</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md">
                        <Heartbeat size={16} />
                    </div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Monto Recuperado</div>
                </div>
                <div className="text-3xl font-black text-slate-800">$4.2M</div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-orange-100 text-orange-600 rounded-md">
                        <Warning size={16} />
                    </div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Glosas Detectadas</div>
                </div>
                <div className="text-3xl font-black text-slate-800">240</div>
            </motion.div>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-4 relative overflow-hidden flex flex-col">
            <div className="text-sm font-semibold text-slate-800 mb-4">Tendencia de Auditoría</div>
            <div className="flex-1 flex items-end gap-2 pb-2">
                {[40, 70, 45, 90, 65, 85].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.3 + (i * 0.1), duration: 0.8, type: 'spring' }}
                        className="flex-1 bg-blue-500 rounded-t-sm"
                    />
                ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
            </div>
        </div>
    </div>
);

const ManualesUI = () => (
    <div className="w-full h-full bg-slate-50 p-6 flex flex-col relative overflow-hidden">
        <div className="text-slate-800 font-bold text-lg mb-6">Documentos Recientes</div>

        <div className="flex flex-col gap-3 z-10 relative">
            {[
                { title: 'Historia Clínica - Perez J.', date: 'Hoy, 09:41 AM', status: 'Aprobado' },
                { title: 'Evolución Médica - Gomez M.', date: 'Hoy, 08:15 AM', status: 'Aprobado' },
                { title: 'Consentimiento Informado', date: 'Ayer, 16:30 PM', status: 'Pendiente' },
                { title: 'Resultados Laboratorio', date: 'Ayer, 11:20 AM', status: 'Aprobado' }
            ].map((doc, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-4 shadow-sm"
                >
                    <div className="bg-blue-50 text-blue-500 p-2 rounded-lg">
                        <FileText size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{doc.title}</div>
                        <div className="text-xs text-slate-500">{doc.date}</div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${doc.status === 'Aprobado' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {doc.status}
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

const PlanillasUI = () => (
    <div className="w-full h-full bg-slate-50 p-6 flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 z-10 relative">
            <div className="text-slate-800 font-bold text-lg">Turnos Activos</div>
        </div>

        <div className="relative z-10 w-full max-w-sm">
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200" />
            <div className="flex flex-col gap-4">
                {[
                    { patient: 'Carlos Ramirez', address: 'Calle 123 #45-67', status: 'active' },
                    { patient: 'Maria Lopez', address: 'Cra 42 #12-8', status: 'pending' },
                    { patient: 'Juan Muñoz', address: 'Av Principal #9-11', status: 'pending' },
                ].map((shift, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 * i }}
                        className="flex gap-4 relative z-10"
                    >
                        <div className="pt-3">
                            {shift.status === 'active' ? (
                                <span className="relative flex h-3 w-3 mt-1 ml-0.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-white"></span>
                                </span>
                            ) : (
                                <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white mt-1 ml-0.5" />
                            )}
                        </div>
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {shift.patient.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div className="">
                                    <div className="text-sm font-bold text-slate-800">{shift.patient}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={10} /> {shift.address}
                                    </div>
                                </div>
                            </div>
                            {shift.status === 'active' && (
                                <button className="bg-[#E8594F] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#d4483e] transition-colors">
                                    Optimizar
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </div>
);

const CumplimientoUI = () => (
    <div className="w-full h-full bg-slate-50 p-6 flex flex-col relative overflow-hidden items-center justify-center">
        <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Res 3100
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm w-full max-w-sm flex flex-col items-center z-10 relative">
            <div className="text-sm font-bold text-slate-800 mb-6 w-full text-left">Distribución de Cumplimiento</div>

            <div className="relative w-32 h-32 mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                    {/* Orange segment */}
                    <motion.circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="12" fill="none" strokeDasharray="60 251.2" initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} />
                    {/* Emerald segment */}
                    <motion.circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="100 251.2" strokeDashoffset="-60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
                    {/* Indigo/Blue segment (85%) */}
                    <motion.circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="12" fill="none" strokeDasharray="150 251.2" strokeDashoffset="-160" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-black text-slate-800">85%</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Eficiencia</div>
                </div>
            </div>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3">
                <div className="bg-red-100 text-red-600 p-1.5 rounded-lg mt-0.5">
                    <Warning size={14} />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-800">Alertas Clínicas</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">2 revisiones pendientes requieren atención.</div>
                </div>
            </div>
        </div>
    </div>
);

const FEATURES = [
    {
        id: 'glosas',
        title: 'Glosas',
        label: 'Auditoría',
        description: 'Reduzca objeciones con auditoría de IA en tiempo real.',
        points: [
            'Detección automática de inconsistencias.',
            'Respuestas legales basadas en normativa.',
            'Trazabilidad total de cada objeción.'
        ],
        component: GlosasUI,
        icon: Invoice,
        color: '#ef4444'
    },
    {
        id: 'manuales',
        title: 'Manuales',
        label: 'Digitalización',
        description: 'Digitalice su operación. Cero papel.',
        points: [
            'Conversión a registros digitales.',
            'Estandarización de procesos.',
            'Acceso desde cualquier lugar.'
        ],
        component: ManualesUI,
        icon: FlowArrow,
        color: '#f59e0b'
    },
    {
        id: 'planillas',
        title: 'Planillas',
        label: 'Logística',
        description: 'Rutas y turnos optimizados por IA.',
        points: [
            'Asignación inteligente por ubicación.',
            'Seguimiento en tiempo real.',
            'Reducción de costos operativos.'
        ],
        component: PlanillasUI,
        icon: CalendarBlank,
        color: '#3b82f6'
    },
    {
        id: 'cumplimiento',
        title: 'Cumplimiento',
        label: 'Normativa',
        description: 'Cumplimiento total con Res. 3100.',
        points: [
            'Monitoreo de indicadores de calidad.',
            'Alertas preventivas automáticas.',
            'Reportes para entes de control.'
        ],
        component: CumplimientoUI,
        icon: ShieldCheck,
        color: '#8b5cf6'
    }
];

// Removed duplicate FEATURES array.

export default function FeatureSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
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
                                className="absolute left-0 w-1.5 z-10 rounded-full"
                                style={{ backgroundColor: FEATURES[activeIndex].color }}
                                initial={false}
                                animate={{
                                    top: `${(activeIndex * 100) / FEATURES.length}%`,
                                    height: `${100 / FEATURES.length}%`,
                                    backgroundColor: FEATURES[activeIndex].color
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />

                            {FEATURES.map((feature, index) => (
                                <button
                                    key={feature.id}
                                    onClick={() => handleTabClick(index)}
                                    className={`pl-10 py-3 text-left transition-all duration-300 group relative ${activeIndex === index
                                        ? 'text-slate-900 font-bold'
                                        : 'text-slate-400 font-medium hover:text-slate-600'
                                        }`}
                                >
                                    <span className={`text-2xl tracking-tight block transition-transform duration-300 ${activeIndex === index ? 'translate-x-2' : 'group-hover:translate-x-1'}`}>
                                        {feature.title}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* RIGHT: ANIMATED CONTENT - ULTRA WIDE */}
                        <div className="lg:w-[80%] xl:w-[85%] w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                                    className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 lg:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center min-h-[600px] relative overflow-hidden group"
                                >
                                    {/* Subtle decorative background element */}
                                    <motion.div
                                        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -z-0 opacity-20 pointer-events-none transition-colors duration-1000"
                                        style={{ backgroundColor: FEATURES[activeIndex].color, transform: 'translate(30%, -30%)' }}
                                    />

                                    {/* Content Text */}
                                    <div className="flex-[4] space-y-6 lg:space-y-8 relative z-10 w-full">
                                        <div className="flex items-center gap-3 lg:gap-4">
                                            <div
                                                className="p-3 lg:p-4 rounded-2xl bg-white shadow-xl flex items-center justify-center transition-colors duration-500"
                                                style={{ color: FEATURES[activeIndex].color, shadowColor: FEATURES[activeIndex].color }}
                                            >
                                                {React.createElement(FEATURES[activeIndex].icon, { size: 32 })}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">IPS-ERP</div>
                                                <div className="font-bold text-sm tracking-wide" style={{ color: FEATURES[activeIndex].color }}>
                                                    Módulo: <span className="text-slate-900">{FEATURES[activeIndex].label}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
                                            {FEATURES[activeIndex].description}
                                        </h3>

                                        <ul className="space-y-4 pt-2">
                                            {FEATURES[activeIndex].points.map((point, i) => (
                                                <li key={i} className="flex gap-4 text-slate-600 font-medium text-base lg:text-lg leading-relaxed items-start">
                                                    <div
                                                        className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                                                        style={{ backgroundColor: FEATURES[activeIndex].color }}
                                                    />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Authentic Dashboard Presentation Window */}
                                    <div className="flex-[5] w-full h-[400px] lg:h-[500px] rounded-[24px] overflow-hidden shadow-2xl relative z-10 border border-slate-200 bg-slate-50 flex flex-col">
                                        {/* Minimal browser/app header matching light mode */}
                                        <div className="h-10 bg-slate-50/80 backdrop-blur-md w-full flex items-center px-4 gap-2 border-b border-slate-200">
                                            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                            <div className="ml-4 h-5 flex-1 bg-white rounded-md border border-slate-100 flex items-center px-2">
                                                <div className="w-full max-w-[150px] h-1.5 bg-slate-100 rounded-full mx-auto" />
                                            </div>
                                        </div>
                                        {/* Render the specific authentic animated UI */}
                                        <div className="flex-1 relative bg-slate-50">
                                            {React.createElement(FEATURES[activeIndex].component)}
                                        </div>
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


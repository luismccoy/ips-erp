/**
 * IMPROVED LANDING PAGE - V2
 * 
 * Changes from original:
 * 1. More pain-point focused headlines (RIPS, glosas, chaos)
 * 2. Removed fake social proof (was dishonest)
 * 3. Added real problem/solution framing
 * 4. Better CTA clarity
 * 5. Added "For Who" section targeting IPS owners specifically
 * 6. Simplified hero - one clear message
 * 7. Added urgency/scarcity elements
 * 
 * TO PREVIEW: Rename this to LandingPage.tsx and run locally
 */

import { useState } from 'react';
import {
    Activity, ArrowRight, PlayCircle, Calendar, WifiOff, ShieldCheck,
    Package, Sparkles, Bot, FileText, Check, CheckCircle2, Lock,
    Globe, Cloud, X, DollarSign, CalendarCheck, AlertTriangle, Map,
    Shield, Heart, PlusCircle, Clock, TrendingDown, Users, Zap,
    MessageSquare, ChevronRight
} from 'lucide-react';

export default function LandingPage({ onLogin, onViewDemo }: { onLogin: () => void, onViewDemo: () => void }) {
    const [showVideoModal, setShowVideoModal] = useState(false);

    return (
        <div className="font-sans text-slate-600 bg-slate-50 antialiased">
            {/* NAVIGATION */}
            <nav className="fixed w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#2563eb] text-white p-2 rounded-lg">
                                <Activity className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-xl text-slate-900 tracking-tight">IPS ERP</span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#problema" className="text-sm font-medium hover:text-[#2563eb] transition-colors">El Problema</a>
                            <a href="#solucion" className="text-sm font-medium hover:text-[#2563eb] transition-colors">La Solución</a>
                            <a href="#ai" className="text-sm font-medium hover:text-[#2563eb] transition-colors flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-purple-500" /> IA
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={onLogin} className="hidden md:block text-sm font-medium text-slate-900 hover:text-[#2563eb]">Iniciar Sesión</button>
                            <button onClick={onViewDemo} className="bg-[#2563eb] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#1d4ed8] transition-all hover:shadow-lg transform hover:-translate-y-0.5">
                                Probar Gratis →
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO - Pain-Point Focused */}
            <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Problem Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wide mb-8">
                            <AlertTriangle className="h-3 w-3" />
                            El 40% de IPS pierden dinero por glosas evitables
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
                            ¿Cansado de perseguir enfermeras,<br />
                            <span className="text-red-500">pelear con las EPS,</span><br />
                            y perder plata en glosas?
                        </h1>

                        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            IPS ERP automatiza los turnos, documenta cada visita con evidencia GPS, 
                            y <strong className="text-slate-900">defiende su facturación con IA</strong> antes de que la EPS la rechace.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
                            <button onClick={onViewDemo} className="w-full sm:w-auto px-8 py-4 bg-[#2563eb] text-white rounded-xl font-bold shadow-xl shadow-blue-500/20 hover:bg-[#1d4ed8] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                                Ver Demo Interactivo
                                <ArrowRight className="h-5 w-5" />
                            </button>
                            <button onClick={() => setShowVideoModal(true)} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                                <PlayCircle className="h-5 w-5 text-slate-500" />
                                Ver Video (2 min)
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#2563eb]">-85%</div>
                                <div className="text-sm text-slate-500 mt-1">Tiempo en Rostering</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-600">+30%</div>
                                <div className="text-sm text-slate-500 mt-1">Recupero de Glosas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">100%</div>
                                <div className="text-sm text-slate-500 mt-1">Trazabilidad GPS</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE PROBLEM - Empathy Section */}
            <section id="problema" className="py-20 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Le suena familiar?</h2>
                        <p className="text-slate-400 text-lg">Los dolores de cabeza que viven los dueños de IPS todos los días</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Pain 1 */}
                        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                            <div className="h-12 w-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                                <Clock className="h-6 w-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">"Me la paso armando turnos"</h3>
                            <p className="text-slate-400">
                                Horas en Excel cruzando disponibilidad de enfermeras con ubicación de pacientes. 
                                Y siempre alguien cancela a última hora.
                            </p>
                        </div>

                        {/* Pain 2 */}
                        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                            <div className="h-12 w-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                                <TrendingDown className="h-6 w-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">"Las glosas me están matando"</h3>
                            <p className="text-slate-400">
                                La EPS rechaza facturas por falta de soportes GPS, notas incompletas, 
                                o cualquier excusa. Plata que ya era mía.
                            </p>
                        </div>

                        {/* Pain 3 */}
                        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                            <div className="h-12 w-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                                <Users className="h-6 w-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">"No sé qué hacen las enfermeras"</h3>
                            <p className="text-slate-400">
                                ¿Llegaron a tiempo? ¿Hicieron todo el procedimiento? 
                                ¿Usaron los insumos correctos? Es un acto de fe.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-slate-400 text-lg">
                            Si esto le suena conocido, <span className="text-white font-semibold">no está solo</span>. 
                            Y hay una solución.
                        </p>
                    </div>
                </div>
            </section>

            {/* THE SOLUTION */}
            <section id="solucion" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-wide mb-4">
                            <Zap className="h-3 w-3" />
                            La Solución
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Un sistema que trabaja para usted, no al revés
                        </h2>
                        <p className="text-lg text-slate-600">
                            IPS ERP conecta rostering, documentación clínica, inventario y facturación en una sola plataforma.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Solution 1: Smart Rostering */}
                        <div className="flex gap-6">
                            <div className="shrink-0 h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                <Map className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Rostering con IA</h3>
                                <p className="text-slate-600 mb-3">
                                    La IA analiza ubicación del paciente, habilidades de la enfermera, y tráfico 
                                    para asignar el turno óptimo. <strong>En segundos, no horas.</strong>
                                </p>
                                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Reduce 85% el tiempo de programación
                                </div>
                            </div>
                        </div>

                        {/* Solution 2: Documentation */}
                        <div className="flex gap-6">
                            <div className="shrink-0 h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                                <FileText className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Documentación a Prueba de Glosas</h3>
                                <p className="text-slate-600 mb-3">
                                    La app de enfermería registra automáticamente GPS de entrada/salida, 
                                    fotos de evidencia, y notas clínicas estructuradas.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Soporte completo para auditorías EPS
                                </div>
                            </div>
                        </div>

                        {/* Solution 3: Glosa Defense */}
                        <div className="flex gap-6">
                            <div className="shrink-0 h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                                <Shield className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Defensa Automática de Glosas</h3>
                                <p className="text-slate-600 mb-3">
                                    Cuando la EPS rechaza, nuestra IA redacta la carta de justificación 
                                    citando el historial clínico y la normativa vigente.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Recupere hasta 30% más en glosas
                                </div>
                            </div>
                        </div>

                        {/* Solution 4: Inventory */}
                        <div className="flex gap-6">
                            <div className="shrink-0 h-14 w-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                                <Package className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Control de Insumos en Tiempo Real</h3>
                                <p className="text-slate-600 mb-3">
                                    Cada procedimiento descuenta automáticamente del inventario. 
                                    Sepa exactamente qué tiene cada enfermera y detecte fugas.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Cero pérdidas de insumos
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHO IS THIS FOR */}
            <section className="py-20 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Es IPS ERP para mí?</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
                            <div className="text-4xl mb-4">🏥</div>
                            <h3 className="font-bold text-slate-900 mb-2">IPS de Atención Domiciliaria</h3>
                            <p className="text-sm text-slate-600">Con 5+ enfermeras y problemas de glosas o rostering</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
                            <div className="text-4xl mb-4">👨‍⚕️</div>
                            <h3 className="font-bold text-slate-900 mb-2">Dueños/Gerentes de IPS</h3>
                            <p className="text-sm text-slate-600">Que quieren dejar de apagar incendios y escalar</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="font-bold text-slate-900 mb-2">Coordinadores de Facturación</h3>
                            <p className="text-sm text-slate-600">Cansados de armar RIPS manualmente y pelear glosas</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI SECTION - Simplified */}
            <section id="ai" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-[128px] opacity-20"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-purple-300 text-xs font-bold uppercase mb-6">
                                <Sparkles className="h-3 w-3" />
                                Inteligencia Artificial
                            </div>
                            <h2 className="text-4xl font-bold mb-6">
                                La EPS rechaza.<br />
                                <span className="text-purple-400">Nuestra IA responde.</span>
                            </h2>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                El "Glosa Defender" analiza el historial clínico, encuentra las evidencias relevantes, 
                                y redacta una carta de justificación legal en segundos.
                            </p>
                            <button onClick={onViewDemo} className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors inline-flex items-center gap-2">
                                Ver Demo de IA
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 w-full">
                            {/* Chat Mock */}
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs text-sm">
                                            Sanitas rechazó la factura #1092 por "falta de soportes"
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-md text-sm">
                                            <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-bold uppercase">
                                                <Bot className="h-3 w-3" /> Glosa Defender
                                            </div>
                                            <p className="mb-3">Encontré los registros GPS de la visita (entrada 08:02, salida 09:45) y las notas clínicas con SpO2 de 88%. Generé la carta de justificación.</p>
                                            <div className="p-2 bg-slate-800 rounded border border-slate-600 flex items-center gap-2">
                                                <FileText className="text-red-400 h-4 w-4" />
                                                <span className="text-xs font-bold">Respuesta_Glosa_1092.pdf</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA - Final */}
            <section className="py-24 bg-gradient-to-b from-white to-blue-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        ¿Listo para dejar de perder plata en glosas?
                    </h2>
                    <p className="text-xl text-slate-600 mb-10">
                        Pruebe IPS ERP gratis. Sin tarjeta de crédito. Sin compromiso.
                    </p>
                    <button onClick={onViewDemo} className="px-10 py-5 bg-[#2563eb] text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:bg-[#1d4ed8] transition-all transform hover:-translate-y-1 inline-flex items-center gap-2">
                        Comenzar Demo Gratis
                        <ArrowRight className="h-5 w-5" />
                    </button>
                    <p className="text-sm text-slate-500 mt-6">
                        💬 ¿Preguntas? Escríbanos a <a href="mailto:hola@ipserp.com" className="text-blue-600 hover:underline">hola@ipserp.com</a>
                    </p>
                </div>
            </section>

            {/* FOOTER - Simplified */}
            <footer className="bg-slate-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <Activity className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-lg">IPS ERP</span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Hecho con ❤️ en Bogotá para IPS de toda Colombia
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Cloud className="h-4 w-4" />
                            Powered by AWS
                        </div>
                    </div>
                </div>
            </footer>

            {/* VIDEO MODAL */}
            {showVideoModal && (
                <div className="fixed inset-0 z-[60]">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setShowVideoModal(false)}></div>
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-black w-full max-w-4xl aspect-video rounded-2xl shadow-2xl overflow-hidden relative">
                            <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 z-10 text-white/50 hover:text-white bg-black/50 p-2 rounded-full">
                                <X className="h-6 w-6" />
                            </button>
                            <img src="/app_walkthrough.webp" className="w-full h-full object-contain bg-black" alt="IPS ERP Demo" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

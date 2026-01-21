import { useState } from 'react';
import {
    Activity, ArrowRight, PlayCircle, Calendar, WifiOff, ShieldCheck,
    Package, Sparkles, Bot, FileText, Check, CheckCircle2, Lock,
    Globe, Cloud, X, DollarSign, CalendarCheck, AlertTriangle, Map,
    Shield, Heart, PlusCircle
} from 'lucide-react';

export default function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
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
                            <a href="#features" className="text-sm font-medium hover:text-[#2563eb] transition-colors">Plataforma</a>
                            <a href="#ai" className="text-sm font-medium hover:text-[#2563eb] transition-colors flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-purple-500" /> Generative AI
                            </a>
                            <a href="#infrastructure" className="text-sm font-medium hover:text-[#2563eb] transition-colors">Infrastructure</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={onEnterApp} className="hidden md:block text-sm font-medium text-slate-900 hover:text-[#2563eb]">Login</button>
                            <button onClick={onEnterApp} className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5">
                                Agendar Demo
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50" style={{
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '32px 32px'
            }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white to-transparent pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#2563eb] text-xs font-semibold uppercase tracking-wide mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Powered by Generative AI Models
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
                        No gestione pacientes.<br />
                        <span className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] bg-clip-text text-transparent">Gestione su Margen.</span>
                    </h1>

                    <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
                        El primer ERP "Admin-First" para Atención Domiciliaria.
                        Proteja su facturación, elimine glosas y automatice sus turnos con
                        <strong> Inteligencia Artificial Predictiva</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button onClick={onEnterApp} className="w-full sm:w-auto px-8 py-4 bg-[#2563eb] text-white rounded-xl font-semibold shadow-xl shadow-blue-500/20 hover:bg-[#1d4ed8] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                            Comenzar Prueba Gratis
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button onClick={() => setShowVideoModal(true)} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                            <div className="bg-slate-100 rounded-full p-1 group-hover:scale-110 transition-transform">
                                <PlayCircle className="h-5 w-5 text-slate-600" />
                            </div>
                            Ver Demo (30s)
                        </button>
                    </div>

                    {/* ANIMATED UI MOCKUP */}
                    <div className="mt-20 relative max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-700">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 animate-pulse"></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden h-[500px] md:h-[600px] flex flex-col">
                            {/* Browser Chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50 shrink-0">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border rounded-md text-[10px] text-slate-400 font-mono shadow-sm">
                                        <Lock className="h-3 w-3" /> dashboard.ipserp.com/admin
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-1 overflow-hidden">
                                {/* Sidebar */}
                                <div className="hidden md:flex w-64 bg-slate-900 flex-col p-4 border-r border-slate-800 shrink-0">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="h-8 w-8 bg-blue-600 rounded-lg"></div>
                                        <div className="h-4 w-24 bg-slate-700 rounded"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-10 w-full bg-slate-800 rounded-lg"></div>
                                        <div className="h-10 w-full bg-transparent border border-slate-800 rounded-lg"></div>
                                        <div className="h-10 w-full bg-transparent border border-slate-800 rounded-lg"></div>
                                    </div>
                                </div>
                                {/* Main Area */}
                                <div className="flex-1 bg-slate-50 p-6 md:p-8 overflow-hidden">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800">Resumen General</h2>
                                            <p className="text-sm text-slate-500">Bienvenido de nuevo, Dr. Martinez</p>
                                        </div>
                                    </div>
                                    {/* Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><DollarSign className="h-5 w-5" /></div>
                                                <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">+12%</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-800 mb-1">$42.5M</div>
                                            <div className="text-xs text-slate-400">Facturación Mes</div>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><CalendarCheck className="h-5 w-5" /></div>
                                                <span className="text-xs text-slate-500 font-medium">98%</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-800 mb-1">485/500</div>
                                            <div className="text-xs text-slate-400">Turnos Completados</div>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute inset-0 bg-red-50/50 animate-pulse"></div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertTriangle className="h-5 w-5" /></div>
                                                    <span className="text-xs text-red-600 font-bold bg-white px-2 py-1 rounded-full border border-red-100">Acción Requerida</span>
                                                </div>
                                                <div className="text-lg font-bold text-slate-800 mb-1">2 Glosas</div>
                                                <div className="text-xs text-red-500 font-medium">Falta Soporte GPS</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF */}
            <div className="border-y border-slate-100 bg-white py-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Confían en IPS ERP más de 50 agencias en Colombia</p>
                    <div className="flex justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="text-xl font-bold text-slate-800 flex items-center gap-2"><Shield className="fill-current" /> IPS Cuidar</div>
                        <div className="text-xl font-bold text-slate-800 flex items-center gap-2"><Heart className="fill-current" /> SaludCasa</div>
                        <div className="text-xl font-bold text-slate-800 flex items-center gap-2"><PlusCircle className="fill-current" /> MedicaLife</div>
                        <div className="text-xl font-bold text-slate-800 flex items-center gap-2"><Activity className="fill-current" /> VitalHome</div>
                    </div>
                </div>
            </div>

            {/* BENTO GRID (FEATURES) */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-base font-bold text-[#2563eb] uppercase tracking-wide">La Suite Completa</h2>
                        <p className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Todo lo que su IPS necesita para escalar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[300px]">
                        {/* Card 1: Rostering (Large) */}
                        <div className="md:col-span-2 row-span-1 bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-blue-200 transition-all group overflow-hidden relative">
                            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent"></div>
                            <div className="relative z-10 max-w-md">
                                <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-[#2563eb]">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Rostering Inteligente</h3>
                                <p className="text-slate-500">Nuestro agente de IA analiza la ubicación del paciente y las habilidades de la enfermera para asignar el turno perfecto en segundos. Optimice costos de desplazamiento automáticamente.</p>
                            </div>
                            <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-white rounded-full shadow-2xl border-4 border-white opacity-80 group-hover:scale-105 transition-transform">
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <Map className="h-24 w-24" />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Offline */}
                        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="h-12 w-12 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center mb-6">
                                    <WifiOff className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Modo "Zona Roja"</h3>
                                <p className="text-slate-400 text-sm">La App de Enfermería funciona 100% offline. Sincronización automática cuando vuelve la señal.</p>
                            </div>
                        </div>

                        {/* Card 3: Compliance */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center mb-6 text-green-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Habilitación 3100</h3>
                            <p className="text-slate-500 text-sm">Alertas automáticas de vencimiento de documentos ReTHUS y calibración de equipos biomédicos.</p>
                        </div>

                        {/* Card 4: Inventory (Large) */}
                        <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-50 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                                <div className="flex-1">
                                    <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Control de Farmacia</h3>
                                    <p className="text-slate-500">Kardex Digital. Cada procedimiento registrado descuenta automáticamente los insumos del inventario virtual de la enfermera. Detecte fugas al instante.</p>
                                </div>
                                <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg p-4 border border-slate-100 transform rotate-2 hover:rotate-0 transition-transform">
                                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                                        <span className="text-xs font-bold text-slate-400">ITEM</span>
                                        <span className="text-xs font-bold text-slate-400">STOCK</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-700">Jeringa 5cc</span>
                                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Bajo (12)</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-700">Guantes Nitrilo</span>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">OK (45)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI SECTION */}
            <section id="ai" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-[128px] opacity-20"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[128px] opacity-20"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-bold uppercase mb-6">
                                <Sparkles className="h-3 w-3" />
                                Powered by AWS Bedrock
                            </div>
                            <h2 className="text-4xl font-bold mb-6">Su Defensa contra las Glosas es una IA Generativa.</h2>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                Nuestro agente "Glosa Defender" utiliza <strong>Large Language Models (LLMs)</strong> para analizar historiales clínicos y la normativa vigente, redactando justificaciones legales automáticamente ante rechazos de las EPS.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-400 mt-1" />
                                    <span className="text-slate-300">Validación automática de JSON RIPS (Res 2275).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-400 mt-1" />
                                    <span className="text-slate-300">Motores predictivos para auditoría de notas clínicas.</span>
                                </li>
                            </ul>
                            <button onClick={() => setShowVideoModal(true)} className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors">
                                Ver Demo IA
                            </button>
                        </div>
                        <div className="flex-1 w-full">
                            {/* Chat Interface Mock */}
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs text-sm">
                                            La EPS rechazó la factura #1092 por falta de soportes de oxigenoterapia.
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-md text-sm shadow-lg">
                                            <div className="flex items-center gap-2 mb-2 text-blue-400 text-xs font-bold uppercase">
                                                <Bot className="h-3 w-3" /> Glosa Defender
                                            </div>
                                            <p className="mb-3">Analizando historial del paciente Roberto Gomez...</p>
                                            <p>He generado una carta de justificación citando los registros de SpO2 del 12/01 (88%) y 13/01 (85%), que justifican el soporte según la Res 3100. El PDF está listo para descargar.</p>
                                            <div className="mt-3 p-2 bg-slate-800 rounded border border-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-900">
                                                <FileText className="text-red-400 h-4 w-4" />
                                                <span className="text-xs font-bold">Justificacion_Glosa_1092.pdf</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* INFRASTRUCTURE */}
            <section id="infrastructure" className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">Infraestructura de Clase Mundial</h2>
                        <p className="mt-4 text-lg text-slate-500">
                            IPS ERP es un software 100% en la nube, impulsado por el proveedor líder mundial para garantizar que sus datos estén seguros y disponibles 24/7.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-16 bg-slate-900 rounded flex items-center justify-center text-white font-bold tracking-tighter">AWS</div>
                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Technology Partner</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Cloud-Native Reliability</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="bg-green-100 p-1 rounded-full text-green-600 mt-0.5"><Check className="h-4 w-4" /></div>
                                        <div>
                                            <span className="font-bold text-slate-800">99.99% SLA Uptime</span>
                                            <p className="text-sm text-slate-500">Arquitectura sin servidor (Serverless) para máxima disponibilidad.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="bg-green-100 p-1 rounded-full text-green-600 mt-0.5"><Lock className="h-4 w-4" /></div>
                                        <div>
                                            <span className="font-bold text-slate-800">Seguridad Grado Hospitalario</span>
                                            <p className="text-sm text-slate-500">Encriptación AES-256 en reposo y TLS 1.3 en tránsito.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="bg-green-100 p-1 rounded-full text-green-600 mt-0.5"><Globe className="h-4 w-4" /></div>
                                        <div>
                                            <span className="font-bold text-slate-800">Residencia de Datos Local</span>
                                            <p className="text-sm text-slate-500">Cumplimiento de soberanía de datos utilizando AWS Local Zones (Bogotá).</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl transform rotate-3"></div>
                                <div className="relative bg-slate-900 rounded-xl p-6 text-white shadow-2xl">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                        <span className="font-mono text-xs text-green-400">● System Operational</span>
                                        <span className="font-mono text-xs text-slate-400">us-east-1 / bog-1</span>
                                    </div>
                                    <div className="space-y-3 font-mono text-xs text-slate-300">
                                        <div className="flex justify-between"><span>Database Latency</span><span className="text-green-400">12ms</span></div>
                                        <div className="flex justify-between"><span>Encryption Status</span><span className="text-green-400">Active (KMS)</span></div>
                                        <div className="flex justify-between"><span>Backup Policy</span><span className="text-blue-400">Hourly (PITR)</span></div>
                                        <div className="h-1 w-full bg-slate-700 rounded mt-4 overflow-hidden">
                                            <div className="h-full bg-green-500 w-[98%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-slate-900 text-white p-1.5 rounded-md">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-lg text-slate-900">IPS ERP</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                Tecnología diseñada en Bogotá para el sector salud colombiano.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Producto</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-[#2563eb]">Rostering</a></li>
                                <li><a href="#" className="hover:text-[#2563eb]">Billing Defense</a></li>
                                <li><a href="#" className="hover:text-[#2563eb]">App Enfermería</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-[#2563eb]">Habeas Data</a></li>
                                <li><a href="#" className="hover:text-[#2563eb]">Términos</a></li>
                                <li><a href="#" className="hover:text-[#2563eb]">SLA</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Contacto</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li>ventas@ipserp.com</li>
                                <li>Bogotá, Colombia</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-slate-400">© 2026 IPS ERP S.A.S. Todos los derechos reservados.</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            <Cloud className="h-3 w-3" />
                            Powered by AWS LatAm
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
                            <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 z-10 text-white/50 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                            <video className="w-full h-full object-cover" controls autoPlay>
                                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                <h3 className="text-white font-bold text-xl">IPS ERP Demo</h3>
                                <p className="text-slate-300 text-sm">Mostrando flujo de Rostering Automático y Validación de RIPS.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

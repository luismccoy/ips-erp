import { Activity, Stethoscope, Users, Building2, ArrowLeft, Sparkles } from 'lucide-react';
import { enableDemoMode } from '../amplify-utils';

interface DemoSelectionProps {
    onSelectAdmin: () => void;
    onSelectNurse: () => void;
    onSelectFamily: () => void;
    onBack: () => void;
}

export default function DemoSelection({ onSelectAdmin, onSelectNurse, onSelectFamily, onBack }: DemoSelectionProps) {
    
    const handleSelectAdmin = () => {
        enableDemoMode();
        onSelectAdmin();
    };

    const handleSelectNurse = () => {
        enableDemoMode();
        onSelectNurse();
    };

    const handleSelectFamily = () => {
        enableDemoMode();
        onSelectFamily();
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects similar to login */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-5xl w-full relative z-10">
                <div className="mb-12 text-center md:text-left">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center text-slate-400 hover:text-slate-600 transition-colors mb-6 font-medium text-sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Inicio
                    </button>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Seleccione una Experiencia</h1>
                    <p className="text-slate-500 text-lg max-w-2xl">
                        Explore la plataforma IPS ERP desde diferentes perspectivas. Elija un rol para entrar al ambiente demo interactivo.
                    </p>
                    
                    {/* Demo Mode Badge */}
                    <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 text-violet-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Sparkles className="h-4 w-4" />
                        Modo Demo: Datos de muestra precargados
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Admin Card */}
                    <button
                        onClick={handleSelectAdmin}
                        className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                            <Building2 className="h-48 w-48 text-blue-600" />
                        </div>
                        <div className="relative z-10">
                            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <Building2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Portal Administrativo</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Centro de control para turnos, defensa de facturación, analítica y gestión de personal.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">8 Pacientes</span>
                                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">12 Turnos</span>
                                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">2 Glosas</span>
                            </div>
                            <div className="mt-6 flex items-center text-blue-600 font-bold text-sm tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                Iniciar Demo <Activity className="h-4 w-4 ml-2" />
                            </div>
                        </div>
                    </button>

                    {/* Nurse Card */}
                    <button
                        onClick={handleSelectNurse}
                        className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                            <Stethoscope className="h-48 w-48 text-emerald-600" />
                        </div>
                        <div className="relative z-10">
                            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 text-emerald-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <Stethoscope className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">App de Enfermería</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Interfaz móvil para navegación de rutas, registro de atención y control de insumos.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">3 Hoy</span>
                                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">1 Pendiente</span>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Funciona Offline</span>
                            </div>
                            <div className="mt-6 flex items-center text-emerald-600 font-bold text-sm tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                Iniciar Demo <Activity className="h-4 w-4 ml-2" />
                            </div>
                        </div>
                    </button>

                    {/* Family Card */}
                    <button
                        onClick={handleSelectFamily}
                        className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                            <Users className="h-48 w-48 text-indigo-600" />
                        </div>
                        <div className="relative z-10">
                            <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 text-indigo-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Portal Familiar</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Transparencia para familiares: seguimiento de visitas, signos vitales y progreso del cuidado en tiempo real.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">Paciente: Roberto</span>
                                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Última Visita: Hoy</span>
                            </div>
                            <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                Iniciar Demo <Activity className="h-4 w-4 ml-2" />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

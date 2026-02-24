import { useState } from 'react';
import {
    Activity, ArrowRight, PlayCircle, Calendar, WifiOff, ShieldCheck,
    Package, Sparkles, Bot, FileText, Check, CheckCircle2, Lock,
    Globe, Cloud, X, DollarSign, CalendarCheck, AlertTriangle, Map,
    Shield, Heart, PlusCircle, Users, CheckCircle, ArrowUpRight, Menu
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent } from './ui/Card';
import {
    BillingAuditIcon,
    ProcessFlowIcon,
    SchedulingIcon,
    ComplianceShieldIcon,
    AIAgentIcon,
    PricingIcon,
    RoadmapIcon,
    VipSupportIcon
} from './ui/healthcare-icons';
import FeatureSection from './FeatureSection';
import AIChatWidget from './AIChatWidget';

export default function LandingPage({ onLogin, onViewDemo }: { onLogin: () => void, onViewDemo: () => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        company: '',
        position: '',
        teamSize: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate submission
        setTimeout(() => {
            alert('¡Gracias por unirse al programa beta! Nos pondremos en contacto pronto.');
            setIsSubmitting(false);
            setFormState({ name: '', email: '', company: '', position: '', teamSize: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen text-foreground bg-background antialiased selection:bg-primary/20">
            {/* NAVIGATION */}
            <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex md:hidden items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-foreground hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="IPS-ERP Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20" />
                            <span className="font-bold text-xl text-foreground tracking-tight">IPS-ERP</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-10">
                            <a href="#programa-beta" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors tracking-widest uppercase">Programa Beta</a>
                            <a href="#modulos" className="text-[15px] font-semibold text-slate-600 hover:text-slate-900 transition-colors tracking-wide">Módulos</a>
                            <button onClick={onViewDemo} className="text-[15px] font-semibold text-slate-600 hover:text-slate-900 transition-colors tracking-wide" data-testid="family-portal-link">
                                Portal Familiar
                            </button>
                            <a href="#beta" className="text-[15px] font-semibold text-slate-600 hover:text-slate-900 transition-colors tracking-wide">Solicitar Acceso</a>
                        </div>
                        <div className="flex items-center gap-6">
                            <button onClick={onLogin} className="text-[15px] font-bold text-slate-600 hover:text-slate-900 transition-colors" data-testid="login-button">
                                Login
                            </button>
                            <div className="flex items-center gap-3">
                                <Button onClick={onViewDemo} variant="outline" className="text-sm font-bold text-blue-600 border-2 border-blue-600 hover:bg-blue-50 hidden md:inline-flex h-11 px-7 rounded-lg transition-colors" data-testid="demo-button">
                                    Ver Demo
                                </Button>
                                <Button onClick={() => document.getElementById('beta')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-11 px-7 rounded-lg transition-colors border-2 border-transparent">
                                    Unirse Beta
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOBILE MENU */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-border/50 px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col gap-4">
                            <a href="#programa-beta" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-primary uppercase tracking-widest px-4 py-2 hover:bg-slate-50 rounded-lg">Programa Beta</a>
                            <a href="#modulos" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-foreground px-4 py-2 hover:bg-slate-50 rounded-lg">Módulos</a>
                            <button onClick={() => { onViewDemo(); setIsMenuOpen(false); }} className="text-sm font-medium text-foreground px-4 py-2 hover:bg-slate-50 rounded-lg text-left" data-testid="family-portal-link-mobile">
                                Portal Familiar
                            </button>
                            <a href="#beta" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-foreground px-4 py-2 hover:bg-slate-50 rounded-lg">Solicitar Acceso</a>
                            <div className="h-px bg-slate-100 my-2" />
                            <div className="flex flex-col gap-3 px-4">
                                <Button variant="outline" onClick={() => { onLogin(); setIsMenuOpen(false); }} className="w-full font-bold">
                                    Login
                                </Button>
                                <Button onClick={() => { document.getElementById('beta')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }} className="w-full rounded-full font-bold shadow-lg shadow-primary/20">
                                    Unirse Beta
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* HERO SECTION - CLONED FROM PROD WITH PHOTOGRAPH */}
            <section id="programa-beta" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-900">
                {/* Background Image with Production Photograph */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/hero-main.png"
                        alt="Enfermera y paciente"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/85 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest mb-8 shadow-lg shadow-emerald-500/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        PROGRAMA BETA — Lanzamiento Q2 2026
                    </div>

                    <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-6 leading-[1.15] max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                        Sea de las primeras IPS en <br />
                        <span className="text-[#00b8f1]">transformar su operación</span> con Agentes IA.
                    </h1>

                    <p className="mt-4 text-xl text-blue-100/80 max-w-2xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Únase al programa beta de IPS-ERP. Automatice glosas, RIPS, planillas y cumplimiento normativo.
                        <strong> Cupos limitados para IPS pioneras.</strong>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <Button
                            size="xl"
                            className="w-full sm:w-auto text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 tracking-wide"
                            onClick={() => document.getElementById('beta')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            SOLICITAR ACCESO BETA <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                        <Button
                            size="xl"
                            variant="outline"
                            className="w-full sm:w-auto text-base font-bold text-white border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all tracking-wide"
                            onClick={onViewDemo}
                        >
                            VER DEMO <PlayCircle className="h-5 w-5 ml-2" />
                        </Button>
                        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-xs font-bold text-blue-200 uppercase tracking-widest hover:bg-white/10 transition-colors">
                            <ShieldCheck className="h-4 w-4 text-green-400" />
                            100% Cumplimiento Normativo
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10 text-white/60">
                        <div>
                            <div className="text-2xl font-bold text-white">Q2 2026</div>
                            <div className="text-xs uppercase font-semibold tracking-wider">Lanzamiento Oficial</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-400">100%</div>
                            <div className="text-xs uppercase font-semibold tracking-wider">RIPS Compliance</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">AWS</div>
                            <div className="text-xs uppercase font-semibold tracking-wider">Bedrock + Claude</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE MODULES SECTION - HIGH IMPACT CARDS (ANIMATED) */}
            <div id="modulos">
                <div className="bg-white py-12">
                    <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[4px]">Desafíos Críticos</h2>
                        <p className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight">¿Su IPS está atrapada en procesos de antes?</p>
                    </div>
                </div>
                <FeatureSection />
            </div>

            {/* THE BETA SIGNUP SECTION - DARK SUBTLE GRADIENT */}
            <section id="beta" className="py-24 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="flex-1 space-y-10">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">Cupos Limitados</div>
                                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Únase al programa beta y sea pionero en IA.</h2>
                                <p className="text-lg text-slate-400 leading-relaxed">
                                    Estamos seleccionando a 20 IPS que busquen liderar la transformación digital en salud.
                                    Como miembro beta, obtendrá beneficios exclusivos de por vida.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                                        <AIAgentIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-100 text-sm">Acceso Anticipado</div>
                                        <div className="text-xs text-slate-500 font-medium">Pruebe las funciones antes que nadie.</div>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                                        <PricingIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-100 text-sm">Pricing Preferencial</div>
                                        <div className="text-xs text-slate-500 font-medium">Tarifas fijas "Legacy" de por vida.</div>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                                        <RoadmapIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-100 text-sm">Influya en el Roadmap</div>
                                        <div className="text-xs text-slate-500 font-medium">Desarrollamos funciones para sus necesidades.</div>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
                                        <VipSupportIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-100 text-sm">Soporte VIP</div>
                                        <div className="text-xs text-slate-500 font-medium">Asignación de un Implementation Manager.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-lg">
                            <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-3xl">
                                <CardContent className="p-6 sm:p-10 space-y-8">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold">Formulario de Solicitud</h3>
                                        <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Respuesta en menos de 24 horas</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Nombre Completo</label>
                                            <Input
                                                className="bg-slate-900/50 border-white/10 h-14 font-medium"
                                                placeholder="Ej. Dr. Carlos Martinez"
                                                value={formState.name}
                                                onChange={e => setFormState({ ...formState, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email Corporativo</label>
                                                <Input
                                                    type="email"
                                                    className="bg-slate-900/50 border-white/10 h-14 font-medium"
                                                    placeholder="nombre@ips.com"
                                                    value={formState.email}
                                                    onChange={e => setFormState({ ...formState, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Nombre IPS</label>
                                                <Input
                                                    className="bg-slate-900/50 border-white/10 h-14 font-medium"
                                                    placeholder="IPS Nueva Vida"
                                                    value={formState.company}
                                                    onChange={e => setFormState({ ...formState, company: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Tamaño del Equipo Asistencial</label>
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={formState.teamSize}
                                                onChange={e => setFormState({ ...formState, teamSize: e.target.value })}
                                                required
                                            >
                                                <option value="" disabled className="bg-slate-900">Seleccionar...</option>
                                                <option value="1-50" className="bg-slate-900">1 - 50 personas</option>
                                                <option value="51-200" className="bg-slate-900">51 - 200 personas</option>
                                                <option value="201-500" className="bg-slate-900">201 - 500 personas</option>
                                                <option value="500+" className="bg-slate-900">Más de 500 personas</option>
                                            </select>
                                        </div>

                                        <div className="flex items-start gap-3 pt-2">
                                            <input type="checkbox" id="terms" required className="mt-0.5 rounded border-white/10 bg-slate-900 h-4 w-4 ring-offset-slate-950 accent-blue-500" />
                                            <label htmlFor="terms" className="text-xs text-slate-400 font-medium leading-tight">
                                                Deseo recibir actualizaciones del programa beta y acepto el tratamiento de mis datos personales.
                                            </label>
                                        </div>

                                        <Button
                                            size="xl"
                                            className="w-full bg-blue-600 hover:bg-blue-700 font-bold tracking-wide shadow-xl shadow-blue-600/30"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'ENVIANDO...' : 'SOLICITAR ACCESO BETA'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER - MINIMAL */}
            <footer className="bg-slate-950 border-t border-white/5 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="IPS-ERP Logo" className="w-6 h-6 rounded-md shadow-sm opacity-90" />
                        <span className="font-bold text-white text-sm tracking-wide">IPS-ERP</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        © 2026 IPS ERP S.A.S. - BOGOTÁ, COLOMBIA
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <Cloud className="h-3 w-3" /> Powered by AWS LatAm
                    </div>
                </div>
            </footer>

            {/* AI Chatbot Floating Prototype */}
            <AIChatWidget />
        </div>
    );
}

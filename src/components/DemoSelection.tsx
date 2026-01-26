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
        // Force page reload to reinitialize client with demo mode
        window.location.href = '/?demo=admin';
    };

    const handleSelectNurse = () => {
        enableDemoMode();
        // Force page reload to reinitialize client with demo mode
        window.location.href = '/?demo=nurse';
    };

    const handleSelectFamily = () => {
        enableDemoMode();
        // Force page reload to reinitialize client with demo mode
        window.location.href = '/?demo=family';
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
                        Back to Home
                    </button>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Select a Demo Experience</h1>
                    <p className="text-slate-500 text-lg max-w-2xl">
                        Explore the IPS ERP platform from different perspectives. Choose a role below to enter the interactive demo environment.
                    </p>
                    
                    {/* Demo Mode Badge */}
                    <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 text-violet-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Sparkles className="h-4 w-4" />
                        Demo Mode: Pre-loaded with sample data
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
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Admin Portal</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Full control center for rostering, billing defense, analytics, and staff management.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">8 Patients</span>
                                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">12 Shifts</span>
                                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">2 Glosas</span>
                            </div>
                            <div className="mt-6 flex items-center text-blue-600 font-bold text-sm tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                Launch Demo <Activity className="h-4 w-4 ml-2" />
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
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">Nurse App</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Mobile-optimized interface for route navigation, patient care logging, and supplies.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">3 Today</span>
                                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">1 Pending</span>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Offline Ready</span>
                            </div>
                            <div className="mt-6 flex items-center text-emerald-600 font-bold text-sm tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                Launch Demo <Activity className="h-4 w-4 ml-2" />
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
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Family Portal</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Transparency for family members to track visits, vitals, and care progress in real-time.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">Patient: Roberto</span>
                                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Last Visit: Today</span>
                            </div>
                            <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                Launch Demo <Activity className="h-4 w-4 ml-2" />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

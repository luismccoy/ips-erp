import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ComplianceDashboard() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-slate-400" />
                    Resolución 3100 Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl relative overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-emerald-900">98%</div>
                                <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Audit Score</div>
                            </div>
                        </div>
                        <div className="absolute top-[-20px] right-[-20px] opacity-10">
                            <CheckCircle2 size={100} className="text-emerald-900" />
                        </div>
                    </div>
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl relative overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="h-12 w-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-rose-900">2</div>
                                <div className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Critical Alerts</div>
                            </div>
                        </div>
                        <div className="absolute top-[-20px] right-[-20px] opacity-10">
                            <AlertTriangle size={100} className="text-rose-900" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-tight">Equipment Status (Mantenimiento)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Tensiómetro Digital', 'Oxímetro de Pulso', 'Termómetro'].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center text-center">
                            <span className="text-sm font-bold text-slate-800 mb-1">{item}</span>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-flex items-center gap-1">
                                <CheckCircle2 size={10} />
                                Calibrated
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

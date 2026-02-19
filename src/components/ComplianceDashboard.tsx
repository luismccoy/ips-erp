import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MetricCard } from './ui/MetricCard';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export function ComplianceDashboard() {
    return (
        <div className="space-y-6">
            {/* Compliance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                    icon={<ShieldAlert size={18} />}
                    value="98%"
                    label="Audit Score"
                    trendDirection="up"
                    color="green"
                    delay={0}
                />
                <MetricCard
                    icon={<AlertTriangle size={18} />}
                    value={2}
                    label="Critical Alerts"
                    trendDirection="down"
                    color="red"
                    delay={0.05}
                />
            </div>

            {/* Equipment Status */}
            <Card>
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-tight">Equipment Status (Mantenimiento)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Tensiómetro Digital', 'Oxímetro de Pulso', 'Termómetro'].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center text-center">
                            <span className="text-sm font-bold text-slate-800 mb-2">{item}</span>
                            <Badge variant="success" dot>Calibrated</Badge>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

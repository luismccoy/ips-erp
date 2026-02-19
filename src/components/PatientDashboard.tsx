import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronUp, CheckCircle, Circle,
    MapPin, FileText, Stethoscope, Pill, ListChecks, Activity, AlertTriangle
} from 'lucide-react';
import { client, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import { type Patient, type Medication, type Task } from '../types';
import { AssessmentForm, AssessmentHistory, DeteriorationRiskPanel } from './clinical';
import type { DeteriorationAnalysis } from './clinical';
import { Avatar } from './ui/Avatar';
import { MetricCard } from './ui/MetricCard';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

// Collapsible section component
function Section({ title, icon, defaultOpen = true, children, actions }: {
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
    actions?: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Card noPadding disableAnimation>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">{icon}</span>
                    <span className="font-bold text-slate-900">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
                    {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

export const PatientDashboard: React.FC = () => {
    const { items: patients, loadMore, hasMore, isLoading } = usePagination<Patient>();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showAssessmentForm, setShowAssessmentForm] = useState(false);
    const [deteriorationAnalysis, setDeteriorationAnalysis] = useState<DeteriorationAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const tenantId = MOCK_USER.attributes['custom:tenantId'];
    const nurseId = MOCK_USER.attributes.sub;

    useEffect(() => {
        if (!selectedPatient) return;
        const patientSub = (client.models.Patient as any).observeQuery({
            filter: { id: { eq: selectedPatient.id }, tenantId: { eq: tenantId } }
        }).subscribe({
            next: (data: any) => {
                if (data.items[0]) {
                    setSelectedPatient(data.items[0]);
                    setMedications(data.items[0].medications || []);
                    setTasks(data.items[0].tasks || []);
                }
            }
        });
        return () => patientSub.unsubscribe();
    }, [selectedPatient?.id, tenantId]);

    useEffect(() => {
        loadMore(async (token) => {
            const response = await (client.models.Patient as any).list({
                filter: { tenantId: { eq: tenantId } },
                limit: 50,
                nextToken: token
            });
            const data = response.data || [];
            if (data.length > 0 && !selectedPatient) setSelectedPatient(data[0]);
            return { data, nextToken: response.nextToken };
        }, true);
    }, [loadMore, selectedPatient, tenantId]);

    const handleLoadMore = () => {
        loadMore(async (token) => {
            const response = await (client.models.Patient as any).list({
                filter: { tenantId: { eq: tenantId } },
                limit: 50,
                nextToken: token
            });
            return { data: response.data || [], nextToken: response.nextToken };
        });
    };

    const handleToggleTask = async (task: Task) => {
        if (!selectedPatient) return;
        const updatedTasks = selectedPatient.tasks?.map(t =>
            t.id === task.id ? { ...t, completed: !t.completed } : t
        ) || [];
        await (client.models.Patient as any).update({ id: selectedPatient.id, tasks: updatedTasks });
    };

    const handleAnalyzeDeteriorationRisk = async () => {
        if (!selectedPatient) return;
        setIsAnalyzing(true);
        setDeteriorationAnalysis(null);
        try {
            const result = await (client.queries as any).analyzeDeteriorationRisk({
                patientId: selectedPatient.id,
                tenantId,
            });
            setDeteriorationAnalysis(result?.data ?? result);
        } catch (error) {
            console.error('Deterioration analysis failed:', error);
            setDeteriorationAnalysis({
                hasRisk: false,
                overallRiskLevel: 'NONE',
                confidence: 0,
                risks: [],
                correlations: [],
                summary: 'Error al realizar el análisis.',
                error: error instanceof Error ? error.message : 'Error desconocido',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!selectedPatient) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    const completedTasks = tasks.filter(t => t.completed).length;
    const activeMeds = medications.filter(m => m.status === 'ACTIVE').length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 min-h-[80vh]">
            {/* Patient sidebar */}
            <aside className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-fit lg:sticky lg:top-6">
                <h3 className="text-sm font-bold text-slate-900 pb-3 mb-3 border-b border-slate-100">Mis Pacientes</h3>
                <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
                    {patients.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPatient(p)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                selectedPatient.id === p.id
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'hover:bg-slate-50 border border-transparent'
                            }`}
                        >
                            <Avatar name={p.name} size="sm" />
                            <div className="min-w-0">
                                <div className={`text-sm font-medium truncate ${selectedPatient.id === p.id ? 'text-blue-700' : 'text-slate-900'}`}>
                                    {p.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{p.documentId}</div>
                            </div>
                        </button>
                    ))}
                    {hasMore && (
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="mt-2 w-full py-2 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Cargando...' : 'Ver más pacientes'}
                        </button>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <div className="space-y-5">
                {/* Patient profile card */}
                <Card>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <Avatar name={selectedPatient.name} size="xl" />
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-slate-500 font-mono flex items-center gap-1">
                                    <FileText size={12} /> CC: {selectedPatient.documentId}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-sm text-slate-500">{selectedPatient.age} años</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="default">{selectedPatient.diagnosis || 'Sin diagnóstico'}</Badge>
                                {selectedPatient.address && (
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <MapPin size={12} /> {selectedPatient.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Metric cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard
                        icon={<ListChecks size={18} />}
                        value={`${completedTasks}/${tasks.length}`}
                        label="Tareas"
                        trendDirection={completedTasks === tasks.length && tasks.length > 0 ? 'up' : 'neutral'}
                        color="green"
                        delay={0}
                    />
                    <MetricCard
                        icon={<Pill size={18} />}
                        value={activeMeds}
                        label="Medicamentos"
                        trendDirection="neutral"
                        color="blue"
                        delay={0.05}
                    />
                    <MetricCard
                        icon={<Activity size={18} />}
                        value={medications.length}
                        label="Total Kardex"
                        trendDirection="neutral"
                        color="purple"
                        delay={0.1}
                    />
                    <MetricCard
                        icon={<AlertTriangle size={18} />}
                        value={deteriorationAnalysis?.overallRiskLevel || '—'}
                        label="Riesgo"
                        trendDirection={deteriorationAnalysis?.hasRisk ? 'down' : 'neutral'}
                        color={deteriorationAnalysis?.hasRisk ? 'red' : 'slate'}
                        delay={0.15}
                    />
                </div>

                {/* Medications Section */}
                <Section title="Digital Kardex (Medicamentos)" icon={<Pill size={18} />}>
                    {medications.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6">No hay medicamentos registrados.</p>
                    ) : (
                        <div className="space-y-2">
                            {medications.map(med => (
                                <div
                                    key={med.id}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:translate-x-1 transition-transform"
                                >
                                    <div>
                                        <span className="font-semibold text-sm text-slate-900">{med.name}</span>
                                        <p className="text-xs text-slate-500">{med.dosage} - {med.frequency}</p>
                                    </div>
                                    <Badge variant={med.status === 'ACTIVE' ? 'success' : 'error'} dot>
                                        {med.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Tasks Section */}
                <Section title="Ruta de Cuidado (Tareas)" icon={<ListChecks size={18} />}>
                    {tasks.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6">No hay tareas asignadas.</p>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => handleToggleTask(task)}
                                    className="w-full flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-colors text-left"
                                >
                                    {task.completed ? (
                                        <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <Circle size={20} className="text-slate-300 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <span className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                            {task.description}
                                        </span>
                                        {task.dueDate && (
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                Vence: {new Date(task.dueDate).toLocaleTimeString()}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Clinical Assessments Section */}
                <Section
                    title="Evaluaciones Clínicas"
                    icon={<Stethoscope size={18} />}
                    actions={
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <Button
                                variant="cta"
                                size="sm"
                                onClick={handleAnalyzeDeteriorationRisk}
                                isLoading={isAnalyzing}
                                icon={<AlertTriangle size={14} />}
                            >
                                Analizar Riesgo
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setShowAssessmentForm(!showAssessmentForm)}
                            >
                                {showAssessmentForm ? 'Ver Historial' : 'Nueva Evaluación'}
                            </Button>
                        </div>
                    }
                >
                    {deteriorationAnalysis && (
                        <div className="mb-4">
                            <DeteriorationRiskPanel
                                analysis={deteriorationAnalysis}
                                onDismiss={() => setDeteriorationAnalysis(null)}
                            />
                        </div>
                    )}

                    {showAssessmentForm ? (
                        <AssessmentForm
                            patientId={selectedPatient.id}
                            nurseId={nurseId}
                            tenantId={tenantId}
                            onSubmit={() => setShowAssessmentForm(false)}
                            onCancel={() => setShowAssessmentForm(false)}
                        />
                    ) : (
                        <AssessmentHistory patientId={selectedPatient.id} />
                    )}
                </Section>
            </div>
        </div>
    );
};

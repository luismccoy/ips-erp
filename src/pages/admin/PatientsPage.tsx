import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Search, Edit, Trash2, HeartPulse, MoreVertical,
    FileText, Phone, MapPin, CheckCircle, XCircle
} from 'lucide-react';
import { client, isUsingRealBackend } from '../../amplify-utils';
import type { Patient } from '../../types'; // Assuming this import path is correct based on folder structure
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { PatientForm } from './components/PatientForm';
import { ClinicalScalesPanel } from '../../components/ClinicalScalesPanel';
import { ErrorBoundary } from '../../components/ErrorBoundary';

function PatientsPageContent() {
    const { showToast } = useToast();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isMountedRef = useRef(true);

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showScalesModal, setShowScalesModal] = useState(false);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const response = await (client.models.Patient as any).list();
            if (!isMountedRef.current) return;
            const data = Array.isArray(response?.data) ? response.data : [];
            setPatients(data);
        } catch (err) {
            console.error('Error fetching patients:', err);
            if (!isMountedRef.current) return;
            setLoadError('Error al cargar la lista de pacientes.');
            showToast('error', 'Error al cargar la lista de pacientes');
        } finally {
            if (!isMountedRef.current) return;
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleCreateClick = () => {
        setSelectedPatient(null);
        setShowFormModal(true);
    };

    const handleEditClick = (patient: Patient) => {
        setSelectedPatient(patient);
        setShowFormModal(true);
    };

    const handleDeleteClick = async (patient: Patient) => {
        if (!confirm(`¿Está seguro de eliminar a ${patient.name}?`)) return;

        try {
            if (isUsingRealBackend()) {
                await (client.models.Patient as any).delete({ id: patient.id });
                setPatients(prev => prev.filter(p => p.id !== patient.id));
                showToast('success', 'Paciente eliminado correctamente');
            } else {
                showToast('info', 'Modo Demo: Eliminación simulada');
                setPatients(prev => prev.filter(p => p.id !== patient.id));
            }
        } catch (err) {
            console.error('Error deleting patient:', err);
            showToast('error', 'Error al eliminar paciente');
        }
    };

    const handleFormSubmit = async (data: any) => {
        setFormLoading(true);
        try {
            if (isUsingRealBackend()) {
                if (selectedPatient) {
                    // Update
                    const result = await (client.models.Patient as any).update({
                        id: selectedPatient.id,
                        ...data
                    });
                    // Optimistic update of local state
                    setPatients(prev => prev.map(p => p.id === selectedPatient.id ? result.data : p));
                    showToast('success', 'Paciente actualizado correctamente');
                } else {
                    // Create
                    const result = await (client.models.Patient as any).create({
                        tenantId: 'tenant-bogota-01', // TODO: Get from context/auth
                        ...data
                    });
                    setPatients(prev => [...prev, result.data]);
                    showToast('success', 'Paciente creado correctamente');
                }
            } else {
                showToast('info', 'Modo Demo: Cambios guardados en sesión');
                if (selectedPatient) {
                    setPatients(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, ...data } : p));
                } else {
                    const newMock: Patient = {
                        id: `temp-${Date.now()}`,
                        tenantId: 'mock-tenant',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        ...data
                    };
                    setPatients(prev => [...prev, newMock]);
                }
            }
            setShowFormModal(false);
        } catch (err) {
            console.error('Error saving patient:', err);
            showToast('error', 'Error al guardar paciente');
        } finally {
            setFormLoading(false);
        }
    };

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredPatients = patients.filter((patient) => {
        const name = (patient.name ?? '').toLowerCase();
        const documentId = patient.documentId ? String(patient.documentId) : '';
        return name.includes(normalizedSearch) || documentId.includes(searchTerm);
    });

    if (loading) return <div className="p-12"><LoadingSpinner size="lg" /></div>;
    if (loadError) {
        return (
            <div className="p-12">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">No pudimos cargar los pacientes</h2>
                    <p className="text-slate-500 text-sm">{loadError}</p>
                    <button
                        onClick={fetchPatients}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200/50">
                <div>
                    <h1 className="text-2xl font-black mb-1">Pacientes</h1>
                    <p className="text-slate-400 text-sm">Gestiona la información y registros médicos de tus pacientes.</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20"
                >
                    <Plus size={20} /> Nuevo Paciente
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Paciente</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Documento</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Ubicación</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron pacientes. Intenta una búsqueda diferente o crea uno nuevo.
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                                                    {(patient.name ?? '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                    <div className="font-bold text-slate-900">{patient.name ?? 'Sin nombre'}</div>
                                                    <div className="text-xs text-slate-500 font-medium">
                                                        {patient.age ? `${patient.age} años` : 'Edad N/A'}
                                                    </div>
                                                    </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 font-mono text-sm bg-slate-100/50 w-fit px-2 py-1 rounded-lg">
                                                <FileText size={14} className="text-slate-400" />
                                                {patient.documentId ?? 'Sin documento'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2 text-slate-600 text-xs">
                                                <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                                <span className="truncate max-w-[150px]">{patient.address || 'Sin dirección registrada'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                Activo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPatient(patient);
                                                        setShowScalesModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                                    title="Ver Escalas Clínicas"
                                                >
                                                    <HeartPulse size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(patient)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(patient)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">
                                {selectedPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
                            </h3>
                            <button
                                onClick={() => setShowFormModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <PatientForm
                            initialData={selectedPatient}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setShowFormModal(false)}
                            isLoading={formLoading}
                        />
                    </div>
                </div>
            )}

            {/* Scales Modal */}
            {showScalesModal && selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-pink-50 to-purple-50">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <HeartPulse className="text-pink-600" />
                                Escalas Clínicas - {selectedPatient.name}
                            </h3>
                            <button
                                onClick={() => setShowScalesModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-white/50 rounded-lg transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <ClinicalScalesPanel
                                patientId={selectedPatient.id}
                                patientName={selectedPatient.name}
                                showHistory={true}
                                showTrends={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function PatientsPage() {
    return (
        <ErrorBoundary>
            <PatientsPageContent />
        </ErrorBoundary>
    );
}

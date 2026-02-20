import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, PencilSimple, Trash, MapPin, FileText, XCircle } from '@phosphor-icons/react';
import { HeartPulseIcon } from '../../components/ui/icons';
import { client, isUsingRealBackend } from '../../amplify-utils';
import type { Patient } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { PatientForm } from './components/PatientForm';
import { ClinicalScalesPanel } from '../../components/ClinicalScalesPanel';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

function PatientsPageContent() {
    const { showToast } = useToast();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isMountedRef = useRef(true);

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
            setPatients(Array.isArray(response?.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching patients:', err);
            if (!isMountedRef.current) return;
            setLoadError('Error al cargar la lista de pacientes.');
            showToast('error', 'Error al cargar la lista de pacientes');
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchPatients(); }, [fetchPatients]);
    useEffect(() => { return () => { isMountedRef.current = false; }; }, []);

    const handleCreateClick = () => { setSelectedPatient(null); setShowFormModal(true); };
    const handleEditClick = (patient: Patient) => { setSelectedPatient(patient); setShowFormModal(true); };

    const handleDeleteClick = async (patient: Patient) => {
        if (!confirm(`¿Está seguro de eliminar a ${patient.name}?`)) return;
        try {
            if (isUsingRealBackend()) {
                await (client.models.Patient as any).delete({ id: patient.id });
            }
            setPatients(prev => prev.filter(p => p.id !== patient.id));
            showToast('success', 'Paciente eliminado correctamente');
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
                    const result = await (client.models.Patient as any).update({ id: selectedPatient.id, ...data });
                    if (!result?.data) {
                        showToast('error', 'Error al actualizar: el servidor no devolvió datos.');
                        return;
                    }
                    setPatients(prev => prev.map(p => p.id === selectedPatient.id ? result.data : p));
                    showToast('success', 'Paciente actualizado correctamente');
                } else {
                    const result = await (client.models.Patient as any).create({ tenantId: 'tenant-bogota-01', ...data });
                    if (!result?.data) {
                        showToast('error', 'Error al crear paciente: el servidor no devolvió datos.');
                        return;
                    }
                    setPatients(prev => [...prev, result.data]);
                    showToast('success', 'Paciente creado correctamente');
                }
            } else {
                showToast('info', 'Modo Demo: Cambios guardados en sesión');
                if (selectedPatient) {
                    setPatients(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, ...data } : p));
                } else {
                    const newMock: Patient = {
                        id: `temp-${Date.now()}`, tenantId: 'mock-tenant',
                        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data
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
    const filteredPatients = patients.filter(p => {
        if (!p) return false;
        const name = (p.name ?? '').toLowerCase();
        const doc = p.documentId ? String(p.documentId) : '';
        return name.includes(normalizedSearch) || doc.includes(searchTerm);
    });

    const columns: Column<Patient>[] = [
        {
            key: 'name',
            header: 'Paciente',
            sortable: true,
            render: (patient) => (
                <div className="flex items-center gap-3">
                    <Avatar name={patient.name ?? '?'} size="sm" />
                    <div>
                        <div className="font-medium text-slate-900">{patient.name ?? 'Sin nombre'}</div>
                        <div className="text-xs text-slate-500">{patient.age ? `${patient.age} años` : 'Edad N/A'}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'documentId',
            header: 'Documento',
            sortable: true,
            render: (patient) => (
                <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs bg-slate-50 w-fit px-2 py-1 rounded-md">
                    <FileText size={12} className="text-slate-400" />
                    {patient.documentId ?? 'Sin documento'}
                </div>
            ),
        },
        {
            key: 'address',
            header: 'Ubicación',
            render: (patient) => (
                <div className="flex items-start gap-1.5 text-slate-600 text-xs max-w-[180px]">
                    <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="truncate">{patient.address || 'Sin dirección'}</span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Estado',
            render: () => <Badge variant="success" dot>Activo</Badge>,
        },
        {
            key: 'actions',
            header: 'Acciones',
            width: '120px',
            render: (patient) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); setShowScalesModal(true); }}
                        className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title="Escalas Clínicas"
                    >
                        <HeartPulseIcon size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(patient); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <PencilSimple size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(patient); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <Trash size={16} />
                    </button>
                </div>
            ),
        },
    ];

    if (loading) return <div className="p-12"><LoadingSpinner size="lg" /></div>;

    if (loadError) {
        return (
            <div className="p-12">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">No pudimos cargar los pacientes</h2>
                    <p className="text-slate-500 text-sm">{loadError}</p>
                    <Button onClick={fetchPatients}>Reintentar</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <PageHeader
                title="Pacientes"
                subtitle="Gestiona la información y registros médicos"
                actions={
                    <Button onClick={handleCreateClick} icon={<Plus size={18} />}>
                        Nuevo Paciente
                    </Button>
                }
            />

            <SearchInput
                placeholder="Buscar por nombre o documento..."
                onSearch={setSearchTerm}
            />

            <DataTable
                columns={columns}
                data={filteredPatients}
                pagination={{ pageSize: 10 }}
                emptyMessage="No se encontraron pacientes."
            />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={selectedPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
                maxWidth="2xl"
            >
                <PatientForm
                    initialData={selectedPatient}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowFormModal(false)}
                    isLoading={formLoading}
                />
            </Modal>

            {/* Clinical Scales Modal */}
            {showScalesModal && selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <HeartPulseIcon className="text-pink-600" size={20} />
                                Escalas Clínicas — {selectedPatient.name}
                            </h3>
                            <button
                                onClick={() => setShowScalesModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <XCircle size={20} />
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

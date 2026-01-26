import { useState, useEffect } from 'react';
import {
    User, Search, Plus, MapPin, FileText, Activity,
    MoreVertical, Edit, Trash2, X, Save, CheckCircle, HeartPulse
} from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import type { Patient } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useToast } from './ui/Toast';
import { ClinicalScalesPanel } from './ClinicalScalesPanel';

export function PatientManager() {
    const { showToast } = useToast();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showScalesModal, setShowScalesModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        documentId: '',
        age: 0,
        address: '',
        eps: '',
        diagnosis: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            // Always use the client - it returns mock data in demo mode
            const response = await (client.models.Patient as any).list();
            setPatients(response.data || []);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedPatient(null);
        setFormData({
            name: '',
            documentId: '',
            age: 0,
            address: '',
            eps: '',
            diagnosis: ''
        });
        setShowModal(true);
    };

    const handleEdit = (patient: Patient) => {
        setSelectedPatient(patient);
        setFormData({
            name: patient.name,
            documentId: patient.documentId,
            age: patient.age || 0,
            address: patient.address || '',
            eps: patient.eps || '',
            diagnosis: patient.diagnosis || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError(null);

        try {
            if (isUsingRealBackend()) {
                if (selectedPatient) {
                    // Update
                    await (client.models.Patient as any).update({
                        id: selectedPatient.id,
                        ...formData
                    });
                    showToast('success', `Patient "${formData.name}" updated successfully`);
                } else {
                    // Create with optimistic update
                    const tempId = 'temp-' + Date.now();
                    const optimisticPatient: Patient = {
                        id: tempId,
                        tenantId: 'tenant-bogota-01',
                        ...formData,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    // Optimistically add to list
                    setPatients(prev => [...prev, optimisticPatient]);
                    setShowModal(false);

                    try {
                        const result = await (client.models.Patient as any).create({
                            tenantId: 'tenant-bogota-01',
                            ...formData
                        });

                        // Replace temp with real data
                        setPatients(prev => prev.map(p => p.id === tempId ? result.data : p));
                        showToast('success', `Patient "${formData.name}" created successfully`);
                    } catch (createErr) {
                        // Revert optimistic update on error
                        setPatients(prev => prev.filter(p => p.id !== tempId));
                        throw createErr;
                    }
                    return; // Exit early for optimistic flow
                }
                await fetchPatients();
                setShowModal(false);
            } else {
                showToast('info', 'Mock Mode: Changes are session-only');
                setShowModal(false);
            }
        } catch (err) {
            console.error('Error saving patient:', err);
            const errorMsg = 'Failed to save patient. Please check your permissions.';
            setError(errorMsg);
            showToast('error', errorMsg);
        } finally {
            setFormLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.documentId.includes(searchTerm)
    );

    if (loading) return <div className="p-8"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar pacientes por nombre o documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus size={20} /> Agregar Paciente
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Nombre del Paciente</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Documento</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Contacto y Ubicación</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Diagnóstico / EPS</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredPatients.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    No se encontraron pacientes. Cree uno para comenzar.
                                </td>
                            </tr>
                        ) : (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{patient.name}</div>
                                                <div className="text-xs text-slate-500">{patient.age} años</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 font-mono text-sm">
                                            <FileText size={14} className="text-slate-400" />
                                            {patient.documentId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2 text-slate-600 text-sm">
                                            <MapPin size={14} className="text-slate-400 mt-0.5" />
                                            <span className="truncate max-w-[200px]">{patient.address || 'No address'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{patient.diagnosis || 'N/A'}</div>
                                            <div className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-0.5">
                                                {patient.eps || 'EPS N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedPatient(patient);
                                                    setShowScalesModal(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                                title="Ver Escalas Clínicas"
                                            >
                                                <HeartPulse size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(patient)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar Paciente"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <User className="text-blue-600" />
                                {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                                    <Activity size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Jose Perez"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Document ID</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.documentId}
                                        onChange={e => setFormData({ ...formData, documentId: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Identification Number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">EPS (Insurance)</label>
                                    <input
                                        type="text"
                                        value={formData.eps}
                                        onChange={e => setFormData({ ...formData, eps: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Sura, Sanitas"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Home Address</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Full address for geolocation"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Primary Diagnosis</label>
                                    <textarea
                                        value={formData.diagnosis}
                                        onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none h-24"
                                        placeholder="Medical diagnosis..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-5 py-2.5 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {formLoading ? <LoadingSpinner size="sm" /> : <Save size={18} />}
                                    {selectedPatient ? 'Update Patient' : 'Create Patient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Clinical Scales Modal */}
            {showScalesModal && selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-pink-50 to-purple-50">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <HeartPulse className="text-pink-600" />
                                Escalas Clínicas - {selectedPatient.name}
                            </h3>
                            <button 
                                onClick={() => setShowScalesModal(false)} 
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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

import { useState, useEffect } from 'react';
import {
    Users, Search, Plus, MapPin, Mail, UserCheck,
    MoreVertical, Edit, Trash2, X, Save, Stethoscope, ExternalLink
} from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import type { Nurse } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useToast } from './ui/Toast';

export function StaffManager() {
    const { showToast } = useToast();
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'NURSE' as 'ADMIN' | 'NURSE' | 'COORDINATOR',
        skills: '' // Comma separated for input
    });

    useEffect(() => {
        fetchNurses();
    }, []);

    const fetchNurses = async () => {
        setLoading(true);
        try {
            // Always use the client - it returns mock data in demo mode
            const response = await (client.models.Nurse as any).list();
            setNurses(response.data || []);
        } catch (err) {
            console.error('Error fetching nurses:', err);
            setError('Failed to load staff list');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedNurse(null);
        setFormData({
            name: '',
            email: '',
            role: 'NURSE',
            skills: ''
        });
        setShowModal(true);
    };

    const handleEdit = (nurse: Nurse) => {
        setSelectedNurse(nurse);
        setFormData({
            name: nurse.name,
            email: nurse.email || '',
            role: nurse.role,
            skills: nurse.skills ? nurse.skills.join(', ') : ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError(null);

        // Convert skills string to array
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

        try {
            if (isUsingRealBackend()) {
                if (selectedNurse) {
                    // Update
                    await (client.models.Nurse as any).update({
                        id: selectedNurse.id,
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        skills: skillsArray
                    });
                    showToast('success', `Staff member "${formData.name}" updated successfully`);
                } else {
                    // Create with optimistic update
                    const tempId = 'temp-' + Date.now();
                    const optimisticNurse: Nurse = {
                        id: tempId,
                        tenantId: 'tenant-bogota-01',
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        skills: skillsArray,
                        isActive: true
                    };

                    setNurses(prev => [...prev, optimisticNurse]);
                    setShowModal(false);

                    try {
                        const result = await (client.models.Nurse as any).create({
                            tenantId: 'tenant-bogota-01',
                            cognitoSub: crypto.randomUUID(), // Placeholder ID
                            name: formData.name,
                            email: formData.email,
                            role: formData.role,
                            skills: skillsArray,
                            isActive: true
                        });

                        // Replace temp with real data
                        setNurses(prev => prev.map(n => n.id === tempId ? result.data : n));
                        showToast('success', `Staff member "${formData.name}" created successfully`);
                    } catch (createErr) {
                        // Revert on error
                        setNurses(prev => prev.filter(n => n.id !== tempId));
                        throw createErr;
                    }
                    return;
                }
                await fetchNurses();
                setShowModal(false);
            } else {
                showToast('info', 'Mock Mode: Changes are session-only');
                setShowModal(false);
            }
        } catch (err) {
            console.error('Error saving nurse:', err);
            const errorMsg = 'Failed to save staff information. Please check your permissions.';
            setError(errorMsg);
            showToast('error', errorMsg);
        } finally {
            setFormLoading(false);
        }
    };

    const filteredNurses = nurses.filter(n =>
        n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.email && n.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar personal por nombre o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus size={20} /> Add Nurse
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Nurse Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Role & Email</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Skills</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredNurses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    No se encontró personal. Cree uno para comenzar.
                                </td>
                            </tr>
                        ) : (
                            filteredNurses.map((nurse) => (
                                <tr key={nurse.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                                                {nurse.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{nurse.name}</div>
                                                <div className="text-xs text-slate-500">ID: {nurse.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${nurse.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    nurse.role === 'COORDINATOR' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {nurse.role}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                <Mail size={12} />
                                                {nurse.email || 'No email'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {nurse.skills && nurse.skills.length > 0 ? (
                                                nurse.skills.slice(0, 2).map((skill, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">No skills listed</span>
                                            )}
                                            {nurse.skills && nurse.skills.length > 2 && (
                                                <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-xs">+{nurse.skills.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {(nurse as any).isActive ? (
                                                <span className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div> Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEdit(nurse)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
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
                                <Stethoscope className="text-emerald-600" />
                                {selectedNurse ? 'Edit Nurse Profile' : 'Add New Staff'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                                    <UserCheck size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Alert about Cognito User Creation */}
                            <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-xs leading-relaxed border border-blue-100 flex flex-col gap-3">
                                <div>
                                    <strong>Workflow Requirement:</strong> Creating staff here adds them to the database.
                                    In this version, you must also create the Cognito User manually in the AWS Console
                                    so they can log in.
                                </div>
                                <a
                                    href="https://us-east-1.console.aws.amazon.com/cognito/v2/idp/user-pools"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold w-fit hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <ExternalLink size={14} />
                                    Open Cognito Console
                                </a>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Betty Cooper"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="nurse@ips.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="NURSE">Nurse (Field Staff)</option>
                                        <option value="COORDINATOR">Coordinator</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Skills (Comma Separated)</label>
                                    <input
                                        type="text"
                                        value={formData.skills}
                                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Wound Care, Pediatrics, ICU"
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
                                    {selectedNurse ? 'Actualizar Personal' : 'Agregar Personal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

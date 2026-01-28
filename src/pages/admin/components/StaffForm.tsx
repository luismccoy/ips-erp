import { useState, useEffect } from 'react';
import {
    Save, X, Shield, Mail, User, Stethoscope,
    AlertTriangle, ExternalLink, Briefcase
} from 'lucide-react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { Nurse } from '../../../types';

interface StaffFormProps {
    initialData?: Nurse | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function StaffForm({ initialData, onSubmit, onCancel, isLoading }: StaffFormProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'NURSE' as 'ADMIN' | 'NURSE' | 'COORDINATOR',
        skills: '',
        licenseNumber: ''
    });

    useEffect(() => {
        if (initialData) {
            const nameParts = initialData.name.split(' ');
            const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
            const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');

            setFormData({
                firstName: firstName || initialData.name,
                lastName: lastName || '',
                email: initialData.email || '',
                phone: '', // Not stored
                role: initialData.role,
                skills: initialData.skills ? initialData.skills.join(', ') : '',
                licenseNumber: '' // Not stored
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            role: formData.role,
            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {!initialData && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-amber-900">
                        <p className="font-bold mb-1">AWS Cognito Requirement</p>
                        <p className="mb-2">Creating a staff member here adds them to the database but <strong>does NOT create a login account</strong>.</p>
                        <a
                            href="https://us-east-1.console.aws.amazon.com/cognito/v2/idp/user-pools"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold underline"
                        >
                            Open Cognito Console <ExternalLink size={12} />
                        </a>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Details</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                            <input
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                            <input
                                required
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="nurse@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="+57 300 000 0000"
                        />
                        <p className="text-[10px] text-slate-400">* Not saved in current version</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Role & Qualifications</h4>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">System Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none"
                            >
                                <option value="NURSE">Nurse (Field Staff)</option>
                                <option value="COORDINATOR">Coordinator</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Professional License</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="Rethus / TP Number"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400">* Not saved in current version</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Skills (Comma Separated)</label>
                        <textarea
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none h-24"
                            placeholder="e.g. ICU, Pediatrics, Wound Care"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : <Save size={18} />}
                    {initialData ? 'Guardar Cambios' : 'Crear Personal'}
                </button>
            </div>
        </form>
    );
}

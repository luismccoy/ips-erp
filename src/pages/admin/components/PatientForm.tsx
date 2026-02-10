import { useState, useEffect } from 'react';
import {
    User, Save, X, Activity, Calendar, MapPin,
    Phone, FileText, AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { Patient } from '../../../types';

interface PatientFormProps {
    initialData?: Patient | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function PatientForm({ initialData, onSubmit, onCancel, isLoading }: PatientFormProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        documentType: 'CC',
        documentNumber: '',
        dateOfBirth: '',
        phone: '',
        address: '',
        city: '',
        emergencyContact: '',
        emergencyPhone: '',
        diagnosis: '',
        notes: '',
        eps: ''
    });

    useEffect(() => {
        if (initialData) {
            // Split name if possible (naive split)
            const nameParts = initialData.name.split(' ');
            const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
            const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');

            setFormData({
                firstName: firstName || initialData.name,
                lastName: lastName || '',
                documentType: 'CC', // Default as we don't store this yet
                documentNumber: initialData.documentId,
                dateOfBirth: '', // We don't store DOB yet, only age
                phone: '', // Not stored
                address: initialData.address || '',
                city: '', // Not stored
                emergencyContact: '', // Not stored
                emergencyPhone: '', // Not stored
                diagnosis: initialData.diagnosis || '',
                notes: '', // Not stored
                eps: initialData.eps || ''
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate age from DOB
        let age = 0;
        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        } else if (initialData?.age) {
            age = initialData.age;
        }

        // Prepare payload for parent component
        const payload = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            documentId: formData.documentNumber,
            age: age,
            address: formData.address, // We might want to append phone/city here if we want to save them
            diagnosis: formData.diagnosis,
            eps: formData.eps
            // Note: Other fields are ignored as they aren't in the schema yet
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Information Note</p>
                    <p>Some fields (Phone, City, Emergency Contact) are currently UI-only and wont be persisted to the database until the backend schema is updated.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Information</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                            <input
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="e.g. Maria"
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
                                placeholder="e.g. Rodriquez"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                            <select
                                name="documentType"
                                value={formData.documentType}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            >
                                <option value="CC">CC</option>
                                <option value="TI">TI</option>
                                <option value="CE">CE</option>
                                <option value="PA">Pass</option>
                            </select>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Document Number</label>
                            <input
                                required
                                name="documentNumber"
                                value={formData.documentNumber}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="1234567890"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                        <input
                            required={!initialData} // Required only for new patients to calc age
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Contact & Medical */}
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Contact & Medical</h4>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="300 123 4567"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="Calle 123 # 45-67"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="Bogota"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Diagnosis</label>
                        <textarea
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-24 resize-none"
                            placeholder="Primary medical diagnosis..."
                        />
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                        <input
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="Relative name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                        <input
                            name="emergencyPhone"
                            value={formData.emergencyPhone}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="Emergency number"
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
                    {initialData ? 'Guardar Cambios' : 'Crear Paciente'}
                </button>
            </div>
        </form>
    );
}

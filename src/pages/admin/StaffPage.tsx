import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, PencilSimple, Trash, Envelope } from '@phosphor-icons/react';
import { client, isUsingRealBackend } from '../../amplify-utils';
import type { Nurse } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { StaffForm } from './components/StaffForm';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export function StaffPage() {
    const { showToast } = useToast();
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'NURSE' | 'COORDINATOR'>('ALL');
    const isMountedRef = useRef(true);

    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchNurses = useCallback(async () => {
        setLoadError(null);
        setLoading(true);
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        try {
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('timeout')), 8000);
            });
            const response = await Promise.race([
                (client.models.Nurse as any).list(),
                timeoutPromise
            ]);
            const data = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.items) ? response.data.items : [];
            if (isMountedRef.current) setNurses(data || []);
        } catch (err) {
            console.error('Error fetching staff:', err);
            if (isMountedRef.current) {
                setNurses([]);
                setLoadError(
                    err instanceof Error && err.message === 'timeout'
                        ? 'La carga de personal tardó demasiado. Intenta de nuevo.'
                        : 'No se pudo cargar el personal.'
                );
            }
            showToast('error', 'Error al cargar la lista de personal');
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
            if (isMountedRef.current) setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchNurses();
        return () => { isMountedRef.current = false; };
    }, [fetchNurses]);

    const handleCreateClick = () => { setSelectedNurse(null); setShowFormModal(true); };
    const handleEditClick = (nurse: Nurse) => { setSelectedNurse(nurse); setShowFormModal(true); };

    const handleDeleteClick = async (nurse: Nurse) => {
        if (!confirm(`¿Está seguro de eliminar a ${nurse.name}?`)) return;
        try {
            if (isUsingRealBackend()) {
                await (client.models.Nurse as any).delete({ id: nurse.id });
            }
            setNurses(prev => prev.filter(n => n.id !== nurse.id));
            showToast('success', 'Personal eliminado correctamente');
        } catch (err) {
            console.error('Error deleting staff:', err);
            showToast('error', 'Error al eliminar el personal');
        }
    };

    const handleFormSubmit = async (data: any) => {
        setFormLoading(true);
        try {
            if (isUsingRealBackend()) {
                if (selectedNurse) {
                    const result = await (client.models.Nurse as any).update({ id: selectedNurse.id, ...data });
                    setNurses(prev => prev.map(n => n.id === selectedNurse.id ? result.data : n));
                    showToast('success', 'Personal actualizado correctamente');
                } else {
                    const result = await (client.models.Nurse as any).create({
                        tenantId: 'tenant-bogota-01',
                        cognitoSub: crypto.randomUUID(),
                        isActive: true,
                        ...data
                    });
                    setNurses(prev => [...prev, result.data]);
                    showToast('success', 'Personal creado. Recuerde crear el acceso al sistema.');
                }
            } else {
                showToast('info', 'Mock Mode: Changes saved to session');
                if (selectedNurse) {
                    setNurses(prev => prev.map(n => n.id === selectedNurse.id ? { ...n, ...data } : n));
                } else {
                    const newMock: Nurse = { id: `temp-${Date.now()}`, tenantId: 'mock-tenant', isActive: true, ...data };
                    setNurses(prev => [...prev, newMock]);
                }
            }
            setShowFormModal(false);
        } catch (err) {
            console.error('Error saving staff:', err);
            showToast('error', 'Error al guardar el personal');
        } finally {
            setFormLoading(false);
        }
    };

    const filteredNurses = nurses.filter(n => {
        const matchesSearch = n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.email && n.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'ALL' || n.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const columns: Column<Nurse>[] = [
        {
            key: 'name',
            header: 'Nombre',
            sortable: true,
            render: (nurse) => {
                const displayName = nurse.name?.trim() || 'Sin nombre';
                const displayEmail = nurse.email?.trim() || 'No email';
                return (
                    <div className="flex items-center gap-3">
                        <Avatar name={displayName} size="sm" />
                        <div>
                            <div className="font-medium text-slate-900">{displayName}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Envelope size={10} /> {displayEmail}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'role',
            header: 'Rol',
            sortable: true,
            render: (nurse) => {
                const role = nurse.role || 'NURSE';
                const variant = role === 'ADMIN' ? 'default' : role === 'COORDINATOR' ? 'warning' : 'info';
                return <Badge variant={variant}>{role}</Badge>;
            },
        },
        {
            key: 'skills',
            header: 'Skills',
            render: (nurse) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {nurse.skills && nurse.skills.length > 0 ? (
                        <>
                            {nurse.skills.slice(0, 3).map((skill, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                                    {skill}
                                </span>
                            ))}
                            {nurse.skills.length > 3 && (
                                <span className="text-[10px] text-slate-400">+{nurse.skills.length - 3}</span>
                            )}
                        </>
                    ) : (
                        <span className="text-slate-400 text-xs">—</span>
                    )}
                </div>
            ),
        },
        {
            key: 'isActive',
            header: 'Estado',
            render: (nurse) => (
                (nurse as any).isActive
                    ? <Badge variant="success" dot>Activo</Badge>
                    : <Badge variant="neutral" dot>Inactivo</Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Acciones',
            width: '100px',
            render: (nurse) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(nurse); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <PencilSimple size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(nurse); }}
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

    return (
        <div className="space-y-5">
            <PageHeader
                title="Personal y Enfermeras"
                subtitle="Gestiona el equipo médico y administrativo"
                actions={
                    <Button onClick={handleCreateClick} icon={<Plus size={18} />}>
                        Crear Personal
                    </Button>
                }
            />

            {/* Search + Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <SearchInput
                    placeholder="Buscar por nombre o correo..."
                    onSearch={setSearchTerm}
                    className="flex-1"
                />
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    {(['ALL', 'NURSE', 'COORDINATOR', 'ADMIN'] as const).map(role => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                roleFilter === role
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {role === 'ALL' ? 'Todos' : role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error state */}
            {loadError && (
                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <div>
                        <div className="font-semibold">No se pudo cargar el personal</div>
                        <div className="text-sm">{loadError}</div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={fetchNurses}>Reintentar</Button>
                </div>
            )}

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredNurses}
                pagination={{ pageSize: 10 }}
                emptyMessage="No se encontró personal con los filtros actuales."
            />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={selectedNurse ? 'Editar Personal' : 'Nuevo Integrante'}
                maxWidth="2xl"
            >
                <StaffForm
                    initialData={selectedNurse}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowFormModal(false)}
                    isLoading={formLoading}
                />
            </Modal>
        </div>
    );
}

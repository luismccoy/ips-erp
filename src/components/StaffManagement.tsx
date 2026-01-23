import React, { useEffect, useState, useCallback } from 'react';
import { client, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import { type Nurse } from '../types';

export const StaffManagement: React.FC = () => {
    const { items: staff, loadMore, hasMore, isLoading } = usePagination<Nurse>();
    const [localLoading, setLocalLoading] = useState(false);

    const fetchStaff = useCallback(async (token: string | null = null, isReset = false) => {
        loadMore(async (t) => {
            const response = await (client.models.Nurse as any).list({
                filter: {
                    tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] }
                },
                limit: 50,
                nextToken: token || t
            });
            return { data: response.data || [], nextToken: response.nextToken };
        }, isReset);
    }, [loadMore]);

    useEffect(() => {
        fetchStaff(null, true);

        // Use subscription ONLY for real-time updates of EXISTING list items or new additions
        // But for initial load and pagination, we use the list query.
        const query = client.models.Nurse.observeQuery({
            filter: {
                tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] }
            }
        });

        const sub = (query as any).subscribe({
            next: () => {
                // If we're in the first page, we can sync with observeQuery
                // For simplicity in this ERP, we'll just keep the paginated list 
                // and maybe refresh on significant changes.
            },
            error: (err: Error) => console.error('Staff sub error:', err)
        });

        return () => sub.unsubscribe();
    }, [fetchStaff]);

    const handleLoadMore = () => {
        fetchStaff();
    };

    const handleAddStaff = async () => {
        const name = prompt("Nombre completo:");
        if (!name) return;
        const email = prompt("Email:") || undefined;
        const roleInput = prompt("Rol (ADMIN, NURSE, COORDINATOR):", "NURSE") || "NURSE";
        const role = ['ADMIN', 'NURSE', 'COORDINATOR'].includes(roleInput) ? roleInput : 'NURSE';

        setLocalLoading(true);
        try {
            await (client.models.Nurse as any).create({
                tenantId: MOCK_USER.attributes['custom:tenantId'],
                name,
                email,
                role: role as any,
                skills: []
            });
        } catch (err) {
            console.error('Add staff error:', err);
        } finally {
            setLocalLoading(false);
        }
    };

    const handleDeleteStaff = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este miembro del personal?')) return;
        await client.models.Nurse.delete({ id });
    };

    return (
        <div className="staff-management-container">
            <div className="staff-header glass">
                <div className="header-info">
                    <h2>Gestión de Personal & RBAC</h2>
                    <p>Manejo de roles, habilidades y permisos de acceso.</p>
                </div>
                <button className="btn-primary" onClick={handleAddStaff} disabled={isLoading || localLoading}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Añadir Personal
                </button>
            </div>

            <div className="staff-grid">
                {staff.map(member => (
                    <div key={member.id} className="staff-card glass animate-fade-in">
                        <div className="card-top">
                            <div className={`role-badge ${member.role.toLowerCase()}`}>{member.role}</div>
                            <button className="btn-icon-delete" onClick={() => handleDeleteStaff(member.id)}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <div className="card-main">
                            <div className="avatar-placeholder">{member.name.charAt(0)}</div>
                            <h3>{member.name}</h3>
                            <p className="email">{member.email}</p>
                        </div>
                        <div className="card-skills">
                            <span className="label">Habilidades:</span>
                            <div className="skills-wrap">
                                {member.skills?.map(skill => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                )) || <span className="no-skills">Sin habilidades asignadas</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
                <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="w-full py-4 text-sm font-bold text-slate-500 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all disabled:opacity-50 shadow-sm"
                >
                    {isLoading ? 'Cargando más...' : 'Cargar Más Personal'}
                </button>
            )}

            <style>{`
                .staff-management-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .staff-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 2rem;
                }

                .header-info h2 { margin: 0; color: var(--neutral-900); }
                .header-info p { margin: 4px 0 0; color: var(--neutral-500); }

                .staff-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .staff-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .staff-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .role-badge {
                    padding: 4px 12px;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .role-badge.admin { background: #fee2e2; color: #991b1b; }
                .role-badge.nurse { background: #dcfce7; color: #15803d; }
                .role-badge.coordinator { background: #e0e7ff; color: #3730a3; }

                .card-main {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .avatar-placeholder {
                    width: 64px;
                    height: 64px;
                    background: var(--primary-100);
                    color: var(--primary-700);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .card-main h3 { margin: 0; font-size: 1.25rem; color: var(--neutral-900); }
                .card-main .email { margin: 0; color: var(--neutral-500); font-size: 0.875rem; }

                .card-skills {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .card-skills .label { font-size: 0.75rem; font-weight: 700; color: var(--neutral-500); text-transform: uppercase; }
                .skills-wrap { display: flex; flex-wrap: wrap; gap: 4px; }
                .skill-tag {
                    background: var(--neutral-100);
                    color: var(--neutral-700);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .no-skills { font-size: 0.75rem; font-style: italic; color: var(--neutral-400); }

                .btn-icon-delete {
                    background: none;
                    border: none;
                    color: var(--neutral-400);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .btn-icon-delete:hover {
                    color: var(--danger-500);
                    background: var(--danger-50);
                }

                .btn-icon-delete svg { width: 20px; height: 20px; }

                .glass {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                    border-radius: var(--radius-xl);
                }
            `}</style>
        </div>
    );
};

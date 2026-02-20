import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, CaretLeft, CaretRight } from '@phosphor-icons/react';
import type { AppIcon } from './icons';

export interface NavItem {
    id: string;
    label: string;
    icon: AppIcon;
    dataTour?: string;
    'data-testid'?: string;
}

export interface NavSection {
    label: string;
    items: NavItem[];
}

interface SidebarProps {
    sections: NavSection[];
    activeItem: string;
    onNavigate: (id: string) => void;
    brandName?: string;
    brandSubtitle?: string;
    brandIcon?: React.ReactNode;
    footer?: React.ReactNode;
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
    sections,
    activeItem,
    onNavigate,
    brandName = 'IPS ERP',
    brandSubtitle = 'Enterprise',
    brandIcon,
    footer,
    collapsed: controlledCollapsed,
    onCollapsedChange,
}: SidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [internalCollapsed, setInternalCollapsed] = useState(false);

    const collapsed = controlledCollapsed ?? internalCollapsed;
    const setCollapsed = onCollapsedChange ?? setInternalCollapsed;

    const handleNavigate = (id: string) => {
        onNavigate(id);
        setMobileOpen(false);
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="p-5 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    {brandIcon || (
                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                            <span className="font-bold text-sm">IPS</span>
                        </div>
                    )}
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="overflow-hidden"
                        >
                            <span className="font-extrabold text-lg text-slate-900 whitespace-nowrap">{brandName}</span>
                            <p className="text-xs text-slate-400 whitespace-nowrap">{brandSubtitle}</p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
                {sections.map((section) => (
                    <div key={section.label}>
                        {!collapsed && (
                            <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                {section.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeItem === item.id;
                                return (
                                    <motion.button
                                        key={item.id}
                                        onClick={() => handleNavigate(item.id)}
                                        data-tour={item.dataTour}
                                        data-testid={item['data-testid']}
                                        className={`
                                            w-full flex items-center gap-3 rounded-lg transition-colors relative
                                            ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                                            ${isActive
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                            }
                                        `}
                                        whileHover={{ x: isActive || collapsed ? 0 : 2 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active-indicator"
                                                className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-l-full"
                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                        <Icon size={18} className="flex-shrink-0" />
                                        {!collapsed && (
                                            <span className="text-sm font-medium truncate">{item.label}</span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Collapse Toggle (desktop only) */}
            <div className="hidden md:block p-3 border-t border-slate-200">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-xs"
                >
                    {collapsed ? <CaretRight size={16} /> : (
                        <>
                            <CaretLeft size={16} />
                            <span className="font-medium">Colapsar</span>
                        </>
                    )}
                </button>
            </div>

            {/* Footer */}
            {footer && !collapsed && (
                <div className="p-3 border-t border-slate-200">
                    {footer}
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-slate-900"
                aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
                {mobileOpen ? <X size={20} /> : <List size={20} />}
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/30 z-40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 shadow-xl md:hidden"
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 72 : 260 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="hidden md:flex flex-col bg-white border-r border-slate-200 h-screen flex-shrink-0 overflow-hidden"
            >
                {sidebarContent}
            </motion.aside>
        </>
    );
}

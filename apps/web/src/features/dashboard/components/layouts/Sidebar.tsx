'use client';

import React from 'react';
import { useUserRole } from '@/context/RoleContext';
import { getSidebarConfig } from '@/config/sidebar.config';
import { UserRole } from '@/types/roles';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const role = useUserRole();
    const pathname = usePathname();

    // Default to admin for now (will be replaced with actual auth)
    const currentRole = role || UserRole.ADMIN;
    const config = getSidebarConfig(currentRole);

    const isItemActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/');
    };

    const NavItem = ({ item, depth = 0 }: any) => {
        const Icon = item.icon;
        const active = isItemActive(item.href);

        return (
            <Link href={item.href}>
                <div
                    className={cn(
                        'group relative mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        'hover:bg-blue-50',
                        active
                            ? 'bg-blue-100 text-blue-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900',
                    )}
                >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {isOpen && (
                        <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge && (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                    {item.badge}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </Link>
        );
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-out lg:relative',
                    isOpen ? 'w-64' : 'w-20',
                )}
            >
                {/* Logo / Brand area */}
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                    {isOpen && (
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                <span className="text-xs font-bold text-white">AM</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">ApartMgmt</span>
                        </div>
                    )}
                    <button
                        onClick={onToggle}
                        className="rounded-lg p-1 hover:bg-slate-100 lg:hidden"
                    >
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                </div>

                {/* Main navigation */}
                <nav className="flex-1 overflow-y-auto px-2 py-4">
                    <div className="space-y-1">
                        {config.main.map((item) => (
                            <NavItem key={item.id} item={item} />
                        ))}
                    </div>
                </nav>

                {/* Bottom navigation */}
                <div className="border-t border-slate-200">
                    <nav className="space-y-1 px-2 py-4">
                        {config.bottom.map((item) => (
                            <NavItem key={item.id} item={item} />
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
}

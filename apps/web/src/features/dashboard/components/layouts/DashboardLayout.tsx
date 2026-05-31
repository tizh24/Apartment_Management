'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Building2, Search } from 'lucide-react';
import { useUserRole, useUser } from '@/context/RoleContext';
import { UserRole, ROLE_LABELS } from '@/types/roles';
import { getSidebarConfig, SidebarItem } from '@/config/sidebar.config';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
} from '@/components/ui/sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const role = useUserRole() || UserRole.ADMIN;
    const user = useUser();
    const config = getSidebarConfig(role);

    const isItemActive = (href: string) => {
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const renderMenuItems = (items: SidebarItem[]) => {
        return items.map((item) => {
            const Icon = item.icon;
            return (
                <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isItemActive(item.href)} tooltip={item.label}>
                        <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        });
    };

    return (
        <SidebarProvider
            style={
                {
                    '--sidebar': '#f9dcc4',
                    '--sidebar-foreground': '#3f2d28',
                    '--sidebar-primary': '#ffb5a7',
                    '--sidebar-primary-foreground': '#3f2d28',
                    '--sidebar-accent': '#ffb5a7',
                    '--sidebar-accent-foreground': '#3f2d28',
                    '--sidebar-border': '#fcd5ce',
                    '--sidebar-ring': '#fec89a',
                } as React.CSSProperties
            }
        >
            <Sidebar variant="sidebar" collapsible="icon" className="border-r border-[#fcd5ce]">
                <SidebarHeader className="border-b border-[#fcd5ce] px-3 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffb5a7] text-[#3f2d28]">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold uppercase tracking-wide text-[#7d5f55]">Apartment Management</p>
                            <p className="truncate text-sm font-semibold text-[#3f2d28]">{ROLE_LABELS[role]}</p>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[#7d5f55]">Menu chính</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>{renderMenuItems(config.main)}</SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarSeparator className="bg-[#fcd5ce]" />

                <SidebarFooter>
                    <SidebarMenu>{renderMenuItems(config.bottom)}</SidebarMenu>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>

            <SidebarInset className="bg-gradient-to-br from-[#f8edeb] via-[#fff8f6] to-[#f9dcc4]/40">
                <header className="sticky top-0 z-20 border-b border-[#fcd5ce] bg-[#fff8f6]/95 backdrop-blur">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <SidebarTrigger className="border border-[#fcd5ce] bg-white text-[#7d5f55] hover:bg-[#f8edeb]" />
                            <div className="hidden min-w-[240px] items-center gap-2 rounded-xl border border-[#fcd5ce] bg-white px-3 py-2 sm:flex">
                                <Search className="h-4 w-4 text-[#a98579]" />
                                <input
                                    type="text"
                                    placeholder="Tìm phòng, khách hàng, hợp đồng..."
                                    className="w-full bg-transparent text-sm text-[#5b463f] outline-none placeholder:text-[#b89184]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#fcd5ce] bg-white text-[#7d5f55] hover:bg-[#f8edeb]"
                            >
                                <Bell className="h-4 w-4" />
                                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffb5a7] px-1 text-[10px] font-semibold text-[#3f2d28]">
                                    3
                                </span>
                            </button>
                            <div className="flex items-center gap-2 rounded-full border border-[#fcd5ce] bg-white px-2.5 py-1.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fec89a] text-xs font-semibold text-[#3f2d28]">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-semibold text-[#5b463f]">{user?.name || 'Người dùng'}</p>
                                    <p className="text-[11px] text-[#9d786d]">{ROLE_LABELS[role]}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}

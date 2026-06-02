'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Building2, CalendarDays, Search, Sparkles } from 'lucide-react';
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
    useSidebar,
} from '@/components/ui/sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
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
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </SidebarProvider>
    );
}

function DashboardLayoutInner({ children }: DashboardLayoutProps) {
    const { state, isMobile } = useSidebar();
    const pathname = usePathname();
    const role = useUserRole() || UserRole.ADMIN;
    const user = useUser();
    const config = getSidebarConfig(role);

    const isItemActive = (href: string) => {
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const allItems = [...config.main, ...config.bottom];
    const currentItem = allItems.find((item) => isItemActive(item.href));
    const currentPageLabel = currentItem?.label || 'Dashboard';

    // Renders custom styled Sidebar Items (Google Drive style)
    const renderMenuItems = (items: SidebarItem[]) => {
        return items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);
            return (
                <SidebarMenuItem key={item.id} className="px-1.5 py-0.5">
                    <SidebarMenuButton 
                        asChild 
                        isActive={active} 
                        tooltip={item.label}
                        className={`rounded-full transition-all duration-200 px-4 py-2 flex items-center gap-3 ${
                            active
                                ? '!bg-[#ffb5a7] !text-[#ff385c] font-black shadow-sm'
                                : 'text-[#5b463f] hover:!bg-[#fcd5ce]/40 hover:!text-[#ff385c]'
                        }`}
                    >
                        <Link href={item.href}>
                            <Icon className={active ? 'text-[#ff385c]' : 'text-[#7d5f55]'} />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        });
    };

    const bottomMenuItems = config.bottom.filter((item) => item.id !== 'profile');
    const profileItem = config.bottom.find((item) => item.id === 'profile');

    return (
        <>
            <Sidebar variant="sidebar" collapsible="icon" className="border-r border-[#fcd5ce] bg-[#f9dcc4]">
                
                {/* Brand Header & Notification Button */}
                <SidebarHeader className="border-none px-3 py-4">
                    <div className="flex items-center justify-between gap-2 w-full">
                        {state === 'expanded' ? (
                            <>
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffb5a7] text-[#3f2d28] shrink-0 shadow-inner">
                                        <Building2 className="h-4.5 w-4.5 text-[#ff385c]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#7d5f55]">Apartment Management</p>
                                        <p className="truncate text-xs font-black text-[#3f2d28]">{ROLE_LABELS[role]}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 shrink-0">
                                    {/* Notification Button: Borderless, Shadow hover, next to Brand */}
                                    <button
                                        type="button"
                                        title="Thông báo"
                                        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-transparent border-none text-[#7d5f55] hover:text-[#ff385c] hover:bg-white/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                                    >
                                        <Bell className="h-4 w-4" />
                                        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#ff385c] px-1 text-[8px] font-black text-white">
                                            3
                                        </span>
                                    </button>
                                    
                                    {/* Sidebar Trigger */}
                                    <SidebarTrigger className="h-8 w-8 border border-[#fcd5ce] bg-white text-[#7d5f55] hover:bg-[#f8edeb] hover:text-[#ff385c] rounded-full shrink-0 cursor-pointer" />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 w-full">
                                {/* Centered trigger to expand when collapsed */}
                                <SidebarTrigger className="h-8 w-8 border border-[#fcd5ce] bg-[#ffb5a7] text-[#3f2d28] hover:bg-[#ffb5a7]/80 hover:text-[#ff385c] rounded-full shrink-0 cursor-pointer shadow-sm" />
                            </div>
                        )}
                    </div>
                </SidebarHeader>

                {/* Main Navigation Links */}
                <SidebarContent className="py-2 px-2">
                    <SidebarMenu>{renderMenuItems(config.main)}</SidebarMenu>
                </SidebarContent>

                {/* Bottom Navigation Links & Collapsible Profile Card */}
                <SidebarFooter className="py-2">
                    <SidebarMenu>
                        {renderMenuItems(bottomMenuItems)}
                        
                        {/* Custom Personal Profile Link (Flat, borderless, no card wrapper) */}
                        {profileItem && (
                            state === 'expanded' ? (
                                <SidebarMenuItem className="mt-2 px-1.5">
                                    <Link 
                                        href={profileItem.href}
                                        className="flex items-center gap-2.5 rounded-full px-3 py-2 text-[#5b463f] hover:bg-[#fcd5ce]/40 hover:text-[#ff385c] transition-all duration-200 cursor-pointer min-w-0"
                                    >
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fec89a] text-[11px] font-black text-[#ff385c] border border-[#fcd5ce]">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-black truncate leading-tight">{user?.name || 'Người dùng'}</p>
                                            <p className="text-[9px] text-[#9d786d] truncate leading-none mt-0.5">{ROLE_LABELS[role]}</p>
                                        </div>
                                    </Link>
                                </SidebarMenuItem>
                            ) : (
                                <SidebarMenuItem className="flex justify-center mt-2">
                                    <Link 
                                        href={profileItem.href}
                                        title="Hồ sơ cá nhân"
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fec89a] text-xs font-black text-[#ff385c] border border-[#fcd5ce] hover:shadow-md hover:scale-105 transition-all cursor-pointer"
                                    >
                                        {user?.name?.charAt(0) || 'U'}
                                    </Link>
                                </SidebarMenuItem>
                            )
                        )}
                    </SidebarMenu>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>

            <SidebarInset className="bg-gradient-to-br from-[#f8edeb] via-[#fff8f6] to-[#f9dcc4]/40 flex flex-col min-h-screen">
                
                {/* Mobile Header Bar (Only visible on mobile views) */}
                {isMobile && (
                    <header className="sticky top-0 z-20 border-b border-[#fcd5ce] bg-[#fff8f6] px-4 py-3 flex items-center justify-between md:hidden">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="border border-[#fcd5ce] bg-white text-[#7d5f55] h-8 w-8 flex items-center justify-center rounded-lg" />
                            <span className="text-xs font-bold text-[#3f2d28] truncate">{currentPageLabel}</span>
                        </div>
                        <Link 
                            href={profileItem?.href || '#'}
                            className="w-8 h-8 rounded-full bg-[#fec89a] border border-[#fcd5ce] flex items-center justify-center text-xs font-black text-[#ff385c]"
                        >
                            {user?.name?.charAt(0) || 'U'}
                        </Link>
                    </header>
                )}

                {/* Main Content Area (Full-bleed without any surrounding wrapper card) */}
                <main className="flex-1 overflow-auto focus:outline-none">{children}</main>
            </SidebarInset>
        </>
    );
}

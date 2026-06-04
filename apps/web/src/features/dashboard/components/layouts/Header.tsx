'use client';

import React, { useState } from 'react';
import { Menu, Search, Bell, Settings, User, LogOut } from 'lucide-react';
import { useUser } from '@/context/RoleContext';

interface HeaderProps {
    onSidebarToggle: () => void;
    sidebarOpen: boolean;
}

export function Header({ onSidebarToggle, sidebarOpen }: HeaderProps) {
    const user = useUser();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchFocus, setSearchFocus] = useState(false);

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
                {/* Left section: Menu toggle + Search */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSidebarToggle}
                        className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
                    >
                        <Menu className="h-5 w-5 text-slate-600" />
                    </button>

                    {/* Global Search */}
                    <div
                        className={`hidden flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 transition-all sm:flex ${searchFocus ? 'border-blue-400 bg-white shadow-md' : ''
                            }`}
                    >
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search rooms, customers, contracts..."
                            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                            onFocus={() => setSearchFocus(true)}
                            onBlur={() => setSearchFocus(false)}
                        />
                    </div>
                </div>

                {/* Right section: Notifications, Settings, Profile */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button className="relative rounded-lg p-2 hover:bg-slate-100">
                        <Bell className="h-5 w-5 text-slate-600" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            3
                        </span>
                    </button>

                    {/* Settings */}
                    <button className="rounded-lg p-2 hover:bg-slate-100">
                        <Settings className="h-5 w-5 text-slate-600" />
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-medium text-slate-900">
                                    {user?.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">
                                    {user?.role || 'admin'}
                                </p>
                            </div>
                        </button>

                        {/* Profile Menu Dropdown */}
                        {showProfileMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                                <div className="border-b border-slate-200 px-4 py-3">
                                    <p className="text-sm font-medium text-slate-900">
                                        {user?.name || 'Admin User'}
                                    </p>
                                    <p className="text-xs text-slate-500">{user?.email}</p>
                                </div>
                                <nav className="space-y-1 py-2">
                                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                        <User className="h-4 w-4" />
                                        Profile
                                    </button>
                                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </button>
                                    <div className="border-t border-slate-200" />
                                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

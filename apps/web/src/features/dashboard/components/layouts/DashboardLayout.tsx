'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main content area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

                {/* Page content */}
                <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-50">
                    <div className="h-full w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

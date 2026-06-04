'use client';

import React from 'react';
import { DashboardLayout } from '@/features/dashboard/components/layouts';
import { SettingsPanel } from '@/features/settings/components';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

export default function AdminSettingsPage() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header line containing Breadcrumb */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Breadcrumb>
                        <BreadcrumbList className="text-sm text-[#8f6f64]">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild className="hover:text-[#5b463f] transition-colors">
                                    <Link href="/admin">Admin</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-[#3f2d28]">
                                    Cài đặt hệ thống
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Main Settings Panel */}
                <SettingsPanel />
            </div>
        </DashboardLayout>
    );
}

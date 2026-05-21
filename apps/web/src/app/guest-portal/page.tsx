'use client';

import { DashboardLayout } from '@/features/dashboard/components/layouts';

export default function GuestPortal() {
    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="mt-2 text-slate-600">Room 305 • Building A</p>
                </div>

                {/* Main Info Cards */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Current Rent Status */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <p className="text-sm text-slate-600">Current Rent</p>
                        <p className="mt-2 text-4xl font-bold text-slate-900">$1,200</p>
                        <p className="mt-4 text-sm text-green-600">• Due on May 30, 2024</p>
                    </div>

                    {/* Utilities Usage */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <p className="text-sm text-slate-600">Utilities This Month</p>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Electricity</span>
                                <span className="font-semibold text-slate-900">$85.50</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Water</span>
                                <span className="font-semibold text-slate-900">$32.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Make Payment', icon: '💳' },
                        { label: 'View Contract', icon: '📄' },
                        { label: 'Get Support', icon: '🎫' },
                        { label: 'Leave Review', icon: '⭐' },
                    ].map((btn, i) => (
                        <button
                            key={i}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center transition-all hover:border-blue-300 hover:bg-blue-50"
                        >
                            <div className="text-2xl mb-2">{btn.icon}</div>
                            <p className="text-sm font-medium text-slate-900">{btn.label}</p>
                        </button>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

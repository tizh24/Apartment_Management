'use client';

import { DashboardLayout } from '@/features/dashboard/components/layouts';

export default function AdminDashboard() {
    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="mt-2 text-slate-600">Welcome to the Admin Dashboard</p>
                </div>

                {/* Placeholder content - will be replaced with actual dashboard widgets */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Total Rooms', value: '128', icon: '🏠' },
                        { label: 'Occupied Rooms', value: '112', icon: '👥' },
                        { label: 'Vacant Rooms', value: '16', icon: '📭' },
                        { label: 'Monthly Revenue', value: '$45,230', icon: '💰' },
                    ].map((card, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="text-2xl mb-2">{card.icon}</div>
                            <p className="text-sm text-slate-600">{card.label}</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Section for additional content */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Analytics Coming Soon</h2>
                    <p className="mt-2 text-slate-600">
                        Charts, tables, and detailed analytics will be implemented here.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}

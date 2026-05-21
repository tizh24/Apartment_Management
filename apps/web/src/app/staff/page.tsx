'use client';

import { DashboardLayout } from '@/features/dashboard/components/layouts';

export default function StaffDashboard() {
    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Work Dashboard</h1>
                    <p className="mt-2 text-slate-600">Quick access to daily tasks and operations</p>
                </div>

                {/* Quick Action Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        { label: "Today's Check-ins", value: '5', icon: '📥', color: 'blue' },
                        { label: "Today's Check-outs", value: '3', icon: '📤', color: 'amber' },
                        { label: 'Pending Payments', value: '12', icon: '⏳', color: 'red' },
                        { label: 'Maintenance Requests', value: '8', icon: '🔧', color: 'orange' },
                        { label: 'Expiring Contracts', value: '4', icon: '⏰', color: 'purple' },
                        { label: 'Support Tickets', value: '6', icon: '🎫', color: 'green' },
                    ].map((card, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="text-3xl mb-2">{card.icon}</div>
                            <p className="text-sm text-slate-600">{card.label}</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Action-oriented section */}
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Recent Activities</h2>
                        <p className="mt-2 text-slate-600">Recent transactions and customer interactions</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Urgent Actions</h2>
                        <p className="mt-2 text-slate-600">Tasks requiring immediate attention</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

'use client';

import { DashboardLayout } from '@/features/dashboard/components/layouts';
import { Receipt, TrendingUp, AlertCircle, CheckCircle, FileBarChart, Download, ChevronRight } from 'lucide-react';

const summaryStats = [
    { label: 'Tổng khoản phải thu tháng', value: '168.4M ₫', icon: Receipt, color: 'blue', sub: 'REV-01' },
    { label: 'Đã thanh toán', value: '144.8M ₫', icon: CheckCircle, color: 'green', sub: '86%' },
    { label: 'Chưa thanh toán', value: '15.6M ₫', icon: AlertCircle, color: 'amber', sub: '9.3%' },
    { label: 'Quá hạn', value: '8.0M ₫', icon: AlertCircle, color: 'red', sub: '4.7%' },
];

const colorMap: Record<string, { bg: string; icon: string }> = {
    blue:  { bg: 'bg-blue-50',  icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', icon: 'text-green-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
    red:   { bg: 'bg-red-50',   icon: 'text-red-600' },
};

// REV-02 status breakdown
const invoiceStatuses = [
    { status: 'Đã thanh toán', count: 89, amount: '144.8M ₫', pct: 86, color: 'bg-green-500' },
    { status: 'Chưa thanh toán', count: 12, amount: '15.6M ₫', pct: 9.3, color: 'bg-amber-400' },
    { status: 'Thanh toán một phần', count: 4, amount: '5.2M ₫', pct: 3, color: 'bg-blue-400' },
    { status: 'Quá hạn', count: 7, amount: '8.0M ₫', pct: 4.7, color: 'bg-red-500' },
];

// Revenue by month
const monthlyRevenue = [
    { month: 'T1', amount: 118 }, { month: 'T2', amount: 125 }, { month: 'T3', amount: 131 },
    { month: 'T4', amount: 138 }, { month: 'T5', amount: 145 },
];

// Pending confirmation
const pendingPayments = [
    { room: 'P.104', customer: 'Vũ Thành Long', amount: '6,000,000 ₫', submittedAt: '30/05 14:22', ref: 'HDAPT-104-0512' },
    { room: 'P.209', customer: 'Đinh Thị Hoa', amount: '1,350,000 ₫', submittedAt: '30/05 11:05', ref: 'HDAPT-209-0512' },
    { room: 'P.311', customer: 'Bùi Trọng Đạt', amount: '4,800,000 ₫', submittedAt: '29/05 18:45', ref: 'HDAPT-311-0511' },
];

export default function AccountantDashboard() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard Kế toán</h1>
                        <p className="mt-0.5 text-sm text-slate-500">Doanh thu & Khoản phải thu — Tháng 5, 2026</p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Download className="h-4 w-4" />
                        Xuất báo cáo
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {summaryStats.map((s, i) => {
                        const c = colorMap[s.color];
                        const Icon = s.icon;
                        return (
                            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} mb-3`}>
                                    <Icon className={`h-5 w-5 ${c.icon}`} />
                                </div>
                                <p className="text-xs text-slate-500">{s.label}</p>
                                <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
                                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* REV-02 status breakdown */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900 mb-1">Trạng thái hóa đơn</h2>
                        <p className="text-xs text-slate-400 mb-4">REV-02 · Tháng 5</p>
                        <div className="space-y-3">
                            {invoiceStatuses.map((s) => (
                                <div key={s.status}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs text-slate-600">{s.status} ({s.count})</span>
                                        <span className="text-xs font-semibold text-slate-800">{s.amount}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100">
                                        <div className={`h-2 rounded-full ${s.color} transition-all`} style={{ width: `${Math.min(s.pct, 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue chart */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm col-span-1 lg:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-sm font-semibold text-slate-900">Doanh thu theo tháng</h2>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Đơn vị: triệu ₫</p>
                        <div className="flex items-end gap-4 h-32">
                            {monthlyRevenue.map((d) => {
                                const max = Math.max(...monthlyRevenue.map(r => r.amount));
                                return (
                                    <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                                        <span className="text-xs font-bold text-emerald-700">{d.amount}M</span>
                                        <div className="w-full rounded-t-lg bg-emerald-500" style={{ height: `${(d.amount / max) * 100}%` }} />
                                        <span className="text-xs text-slate-400">{d.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Pending payment confirmations */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <FileBarChart className="h-4 w-4 text-blue-500" />
                            <h2 className="text-sm font-semibold text-slate-900">Chờ xác nhận thanh toán ({pendingPayments.length})</h2>
                        </div>
                        <button className="text-xs text-blue-600 hover:underline">Xem tất cả</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {pendingPayments.map((p, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <span className="inline-flex h-9 w-12 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                                        {p.room}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{p.customer}</p>
                                        <p className="text-xs text-slate-400">{p.ref}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-900">{p.amount}</p>
                                        <p className="text-xs text-slate-400">{p.submittedAt}</p>
                                    </div>
                                    <button className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors">
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

'use client';

import { DashboardLayout } from '@/features/dashboard/components/layouts';
import {
    DoorOpen, Users, TrendingUp, AlertTriangle,
    CheckCircle, Clock, Wrench, ArrowUpRight,
    ChevronRight, BanknoteIcon,
} from 'lucide-react';

// ─── Mock data (DASH-01 through DASH-08) ─────────────────────────────────────
const stats = [
    { label: 'Tổng số phòng', value: '128', sub: 'DASH-01', icon: DoorOpen, color: 'blue', change: null },
    { label: 'Đang được thuê', value: '112', sub: '87.5% công suất', icon: CheckCircle, color: 'green', change: '+3' },
    { label: 'Phòng trống', value: '10', sub: '7.8% tổng phòng', icon: DoorOpen, color: 'slate', change: '-3' },
    { label: 'Sắp hết HĐ', value: '6', sub: 'Trong 30 ngày tới', icon: Clock, color: 'amber', change: null },
    { label: 'Đang bảo trì', value: '6', sub: 'Cần xử lý', icon: Wrench, color: 'orange', change: null },
    { label: 'Khách hiện tại', value: '134', sub: 'DASH-03', icon: Users, color: 'purple', change: '+5' },
    { label: 'Doanh thu tháng', value: '145.2M ₫', sub: 'DASH-05', icon: TrendingUp, color: 'emerald', change: '+12%' },
    { label: 'Tổng nợ chưa thu', value: '23.6M ₫', sub: 'DASH-06', icon: BanknoteIcon, color: 'red', change: null },
];

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
    blue: { bg: 'bg-[#f8edeb]', icon: 'text-[#a65f4f]', badge: 'bg-[#fcd5ce] text-[#7d4e41]' },
    green: { bg: 'bg-[#f9dcc4]', icon: 'text-[#9f5c4c]', badge: 'bg-[#f9dcc4] text-[#7d4e41]' },
    slate: { bg: 'bg-[#f8edeb]', icon: 'text-[#8f6f64]', badge: 'bg-[#f9dcc4] text-[#6f544b]' },
    amber: { bg: 'bg-[#fcd5ce]', icon: 'text-[#a66754]', badge: 'bg-[#fcd5ce] text-[#7d4e41]' },
    orange: { bg: 'bg-[#fcd5ce]', icon: 'text-[#ab6f5b]', badge: 'bg-[#fec89a] text-[#7d4e41]' },
    purple: { bg: 'bg-[#f9dcc4]', icon: 'text-[#a06151]', badge: 'bg-[#f9dcc4] text-[#7d4e41]' },
    emerald: { bg: 'bg-[#f9dcc4]', icon: 'text-[#b06a58]', badge: 'bg-[#f9dcc4] text-[#7d4e41]' },
    red: { bg: 'bg-[#fcd5ce]', icon: 'text-[#a45c4d]', badge: 'bg-[#fcd5ce] text-[#7d3e35]' },
};

// DASH-02: Occupancy by month (mock)
const occupancyData = [
    { month: 'T1', pct: 74 }, { month: 'T2', pct: 78 }, { month: 'T3', pct: 82 },
    { month: 'T4', pct: 80 }, { month: 'T5', pct: 88 },
];

// DASH-05: Revenue by month (mock, in millions VND)
const revenueData = [
    { month: 'T1', amount: 118 }, { month: 'T2', amount: 125 }, { month: 'T3', amount: 131 },
    { month: 'T4', amount: 138 }, { month: 'T5', amount: 145 },
];

// DASH-04: Guest trends
const guestTrend = [
    { label: 'Mới nhận phòng', value: 8, color: 'text-[#9f5c4c]' },
    { label: 'Đang thuê', value: 134, color: 'text-[#a65f4f]' },
    { label: 'Trả phòng tháng này', value: 5, color: 'text-[#a66754]' },
];

// DASH-07: Overdue payments
const overdueList = [
    { room: 'P.201', customer: 'Nguyễn Minh Tuấn', amount: '4,500,000 ₫', overdueDays: 12, type: 'Tiền phòng T5' },
    { room: 'P.305', customer: 'Trần Thị Lan', amount: '1,200,000 ₫', overdueDays: 7, type: 'Điện + Nước' },
    { room: 'P.108', customer: 'Phạm Văn Hùng', amount: '6,000,000 ₫', overdueDays: 5, type: 'Tiền phòng T5' },
    { room: 'P.412', customer: 'Lê Thị Mai', amount: '850,000 ₫', overdueDays: 3, type: 'Phí dịch vụ' },
];

export default function AdminDashboard() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                {/* Page title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3f2d28]">Dashboard</h1>
                        <p className="mt-0.5 text-sm text-[#8f6f64]">Tổng quan vận hành — Tháng 5, 2026</p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-[#fcd5ce] bg-[#fff8f6] px-4 py-2 text-sm font-medium text-[#5b463f] hover:bg-[#f8edeb] transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                        Xuất báo cáo
                    </button>
                </div>

                {/* DASH-01/03/05/06: Stats Grid */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((s, i) => {
                        const c = colorMap[s.color];
                        const Icon = s.icon;
                        return (
                            <button
                                key={i}
                                className="group rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-[#ffb5a7] cursor-pointer"
                                title="DASH-08: Nhấn để xem chi tiết"
                            >
                                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} mb-3`}>
                                    <Icon className={`h-5 w-5 ${c.icon}`} />
                                </div>
                                <p className="text-xs text-[#8f6f64] mb-1">{s.label}</p>
                                <p className="text-2xl font-bold text-[#3f2d28]">{s.value}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.badge}`}>{s.sub}</span>
                                    {s.change && (
                                        <span className={`text-xs font-medium ${s.change.startsWith('+') ? 'text-[#9f5c4c]' : 'text-[#b86154]'}`}>
                                            {s.change}
                                        </span>
                                    )}
                                </div>
                                <ChevronRight className="absolute right-4 top-4 h-4 w-4 text-[#caa79a] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        );
                    })}
                </div>

                {/* Charts row */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* DASH-02: Occupancy Rate */}
                    <div className="rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-[#3f2d28] mb-1">Tỷ lệ lấp đầy</h2>
                        <p className="text-xs text-[#b89184] mb-4">DASH-02 · 5 tháng gần nhất</p>
                        <div className="flex items-end gap-3 h-28">
                            {occupancyData.map((d) => (
                                <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                                    <span className="text-xs font-semibold text-[#5b463f]">{d.pct}%</span>
                                    <div
                                        className="w-full rounded-t-lg bg-[#ffb5a7] transition-all"
                                        style={{ height: `${d.pct}%` }}
                                    />
                                    <span className="text-xs text-[#b89184]">{d.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DASH-05: Revenue chart */}
                    <div className="rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-[#3f2d28] mb-1">Doanh thu theo tháng</h2>
                        <p className="text-xs text-[#b89184] mb-4">DASH-05 · Đơn vị: triệu ₫</p>
                        <div className="flex items-end gap-3 h-28">
                            {revenueData.map((d) => {
                                const maxAmt = Math.max(...revenueData.map(r => r.amount));
                                return (
                                    <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                                        <span className="text-xs font-semibold text-[#7d4e41]">{d.amount}M</span>
                                        <div
                                            className="w-full rounded-t-lg bg-[#fec89a] transition-all"
                                            style={{ height: `${(d.amount / maxAmt) * 100}%` }}
                                        />
                                        <span className="text-xs text-[#b89184]">{d.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* DASH-04: Guest trends */}
                    <div className="rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-[#3f2d28] mb-1">Lượng khách</h2>
                        <p className="text-xs text-[#b89184] mb-4">DASH-03/04 · Tháng hiện tại</p>
                        <div className="space-y-4">
                            {guestTrend.map((g) => (
                                <div key={g.label} className="flex items-center justify-between">
                                    <span className="text-sm text-[#6f544b]">{g.label}</span>
                                    <span className={`text-lg font-bold ${g.color}`}>{g.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DASH-07: Overdue payments */}
                <div className="rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#f9dcc4]">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-[#b86154]" />
                            <h2 className="text-sm font-semibold text-[#3f2d28]">
                                Khoản thanh toán quá hạn <span className="ml-1 text-[#b86154]">({overdueList.length})</span>
                            </h2>
                        </div>
                        <button className="text-xs font-medium text-[#a65f4f] hover:underline">
                            Xem tất cả
                        </button>
                    </div>
                    <div className="divide-y divide-[#f9dcc4]">
                        {overdueList.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between px-6 py-3 hover:bg-[#f8edeb] cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#fcd5ce] text-xs font-bold text-[#a45c4d]">
                                        {item.room}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-[#3f2d28]">{item.customer}</p>
                                        <p className="text-xs text-[#8f6f64]">{item.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-[#a45c4d]">{item.amount}</p>
                                    <p className="text-xs text-[#b89184]">Quá hạn {item.overdueDays} ngày</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}



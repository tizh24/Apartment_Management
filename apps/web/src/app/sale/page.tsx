'use client';

import { DashboardLayout } from '@/features/dashboard/components/layouts';
import { FileText, HandCoins, CheckCircle, Clock, ChevronRight } from 'lucide-react';

const stats = [
    { label: 'HĐ kiếm được tháng này', value: '7', icon: FileText, color: 'blue', sub: 'SALE-02' },
    { label: 'Hoa hồng đã nhận', value: '12.6M ₫', icon: CheckCircle, color: 'green', sub: 'Đã thanh toán' },
    { label: 'Hoa hồng chờ thanh toán', value: '8.4M ₫', icon: Clock, color: 'amber', sub: 'SALE-03' },
    { label: 'Tổng hoa hồng năm 2026', value: '52.2M ₫', icon: HandCoins, color: 'purple', sub: 'Tất cả HĐ' },
];

const colorMap: Record<string, { bg: string; icon: string }> = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
};

// SALE-04: My contracts
const myContracts = [
    { room: 'P.302', customer: 'Hoàng Thị Thu', startDate: '01/05/2026', endDate: '01/05/2027', commission: '2,400,000 ₫', status: 'Đã nhận' },
    { room: 'P.408', customer: 'Nguyễn Thanh Bình', startDate: '15/05/2026', endDate: '15/05/2027', commission: '3,000,000 ₫', status: 'Đã nhận' },
    { room: 'P.115', customer: 'Trần Văn Khải', startDate: '01/06/2026', endDate: '01/12/2026', commission: '1,800,000 ₫', status: 'Chờ thanh toán' },
    { room: 'P.210', customer: 'Lê Thị Phương', startDate: '10/06/2026', endDate: '10/06/2027', commission: '2,700,000 ₫', status: 'Chờ thanh toán' },
];

// Commission history
const commissionHistory = [
    { date: '25/05/2026', contracts: 'P.302, P.408', total: '5,400,000 ₫', confirmedBy: 'Admin' },
    { date: '28/04/2026', contracts: 'P.201, P.307, P.119', total: '7,200,000 ₫', confirmedBy: 'Admin' },
];

export default function SaleDashboard() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Sale</h1>
                    <p className="mt-0.5 text-sm text-slate-500">Hợp đồng & Hoa hồng của tôi — Tháng 5, 2026</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((s, i) => {
                        const c = colorMap[s.color];
                        const Icon = s.icon;
                        return (
                            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} mb-3`}>
                                    <Icon className={`h-5 w-5 ${c.icon}`} />
                                </div>
                                <p className="text-xs text-slate-500">{s.label}</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
                                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
                            </div>
                        );
                    })}
                </div>

                {/* SALE-04: My contracts list */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <h2 className="text-sm font-semibold text-slate-900">Hợp đồng của tôi</h2>
                        </div>
                        <span className="text-xs text-slate-400">SALE-04</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {myContracts.map((c, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <span className="inline-flex h-9 w-12 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                                        {c.room}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{c.customer}</p>
                                        <p className="text-xs text-slate-400">{c.startDate} → {c.endDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-900">{c.commission}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'Đã nhận' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Commission payment history — SALE-08 */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <HandCoins className="h-4 w-4 text-purple-500" />
                            <h2 className="text-sm font-semibold text-slate-900">Lịch sử nhận hoa hồng</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {commissionHistory.map((h, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{h.date}</p>
                                    <p className="text-xs text-slate-400">HĐ: {h.contracts}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-600">{h.total}</p>
                                    <p className="text-xs text-slate-400">Xác nhận: {h.confirmedBy}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

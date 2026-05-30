'use client';

import { DashboardLayout } from '@/features/dashboard/components/layouts';
import {
    CreditCard, DoorOpen, FileText, MessageSquare,
    Star, QrCode, CheckCircle, Clock, AlertCircle,
    ChevronRight,
} from 'lucide-react';

// GUEST-06: Room info
const roomInfo = {
    roomNumber: '305',
    building: 'Tòa A',
    floor: 3,
    area: '28m²',
    contractStart: '01/01/2026',
    contractEnd: '01/01/2027',
    monthlyRent: '6,000,000 ₫',
    daysLeft: 215,
};

// GUEST-07: Invoices by period
const invoices = [
    {
        period: 'Tháng 5/2026',
        dueDate: '10/05/2026',
        items: [
            { label: 'Tiền phòng', amount: 6000000 },
            { label: 'Điện (120 kWh × 3,500₫)', amount: 420000 },
            { label: 'Nước (6m³ × 25,000₫)', amount: 150000 },
            { label: 'Phí dịch vụ', amount: 100000 },
        ],
        total: '6,670,000 ₫',
        status: 'Đã thanh toán',
    },
    {
        period: 'Tháng 6/2026',
        dueDate: '10/06/2026',
        items: [
            { label: 'Tiền phòng', amount: 6000000 },
            { label: 'Điện (chưa chốt)', amount: null },
            { label: 'Nước (chưa chốt)', amount: null },
        ],
        total: 'Chưa tổng hợp',
        status: 'Chưa thanh toán',
    },
];

// GUEST-08: Quick actions
const quickActions = [
    { label: 'Thanh toán QR', icon: QrCode, color: 'blue', desc: 'GUEST-09' },
    { label: 'Xem hợp đồng', icon: FileText, color: 'slate', desc: 'CON-02' },
    { label: 'Gửi khiếu nại', icon: MessageSquare, color: 'amber', desc: 'GUEST-08' },
    { label: 'Đánh giá dịch vụ', icon: Star, color: 'purple', desc: 'GUEST-14' },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue:  { bg: 'bg-blue-50',  icon: 'text-blue-600',  border: 'hover:border-blue-300' },
    slate: { bg: 'bg-slate-50', icon: 'text-slate-600', border: 'hover:border-slate-300' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'hover:border-amber-300' },
    purple:{ bg: 'bg-purple-50',icon: 'text-purple-600',border: 'hover:border-purple-300' },
};

const statusConfig: Record<string, { icon: any; cls: string; label: string }> = {
    'Đã thanh toán':  { icon: CheckCircle, cls: 'text-green-600 bg-green-50', label: 'Đã thanh toán' },
    'Chưa thanh toán':{ icon: AlertCircle, cls: 'text-amber-600 bg-amber-50', label: 'Chưa thanh toán' },
    'Quá hạn':        { icon: AlertCircle, cls: 'text-red-600 bg-red-50',     label: 'Quá hạn' },
};

export default function GuestPortal() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                {/* Welcome banner — GUEST-06 */}
                <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-md">
                    <p className="text-sm font-medium text-blue-200">Xin chào,</p>
                    <h1 className="mt-1 text-2xl font-bold">Hoàng Văn Khách</h1>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <DoorOpen className="h-4 w-4 text-blue-200" />
                            <span>Phòng {roomInfo.roomNumber} — {roomInfo.building}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-200" />
                            <span>{roomInfo.contractStart} → {roomInfo.contractEnd}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-200" />
                            <span>Còn {roomInfo.daysLeft} ngày</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 w-fit">
                        <CreditCard className="h-4 w-4 text-blue-200" />
                        <span className="text-sm font-semibold">{roomInfo.monthlyRent} / tháng</span>
                    </div>
                </div>

                {/* GUEST-08: Quick Actions */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {quickActions.map((a, i) => {
                        const c = colorMap[a.color];
                        const Icon = a.icon;
                        return (
                            <button
                                key={i}
                                className={`flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md ${c.border}`}
                            >
                                <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${c.bg}`}>
                                    <Icon className={`h-6 w-6 ${c.icon}`} />
                                </div>
                                <p className="text-sm font-medium text-slate-900 text-center">{a.label}</p>
                            </button>
                        );
                    })}
                </div>

                {/* GUEST-07: Invoice list */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-900">Hóa đơn theo kỳ</h2>
                    {invoices.map((inv, i) => {
                        const sc = statusConfig[inv.status] || statusConfig['Chưa thanh toán'];
                        const StatusIcon = sc.icon;
                        return (
                            <div key={i} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">{inv.period}</h3>
                                        <p className="text-xs text-slate-400">Hạn thanh toán: {inv.dueDate}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${sc.cls}`}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {sc.label}
                                    </span>
                                </div>
                                <div className="px-6 py-4 space-y-2">
                                    {inv.items.map((item, j) => (
                                        <div key={j} className="flex justify-between">
                                            <span className="text-sm text-slate-600">{item.label}</span>
                                            <span className="text-sm font-medium text-slate-900">
                                                {item.amount ? item.amount.toLocaleString('vi-VN') + ' ₫' : '—'}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="pt-3 mt-2 border-t border-slate-100 flex justify-between">
                                        <span className="text-sm font-semibold text-slate-900">Tổng cộng</span>
                                        <span className="text-sm font-bold text-slate-900">{inv.total}</span>
                                    </div>
                                </div>
                                {inv.status !== 'Đã thanh toán' && (
                                    <div className="px-6 pb-5">
                                        <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                                            <QrCode className="h-4 w-4" />
                                            Thanh toán bằng QR — GUEST-09
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
        </DashboardLayout>
    );
}

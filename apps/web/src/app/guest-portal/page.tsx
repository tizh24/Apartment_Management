'use client';

import { DashboardLayout } from '@/features/dashboard/components/layouts';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
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
    blue: { bg: 'bg-[#f8edeb]', icon: 'text-[#a65f4f]', border: 'hover:border-[#ffb5a7]' },
    slate: { bg: 'bg-[#f8edeb]', icon: 'text-[#6f544b]', border: 'hover:border-[#fec89a]' },
    amber: { bg: 'bg-[#fcd5ce]', icon: 'text-[#a66754]', border: 'hover:border-[#ffb5a7]' },
    purple: { bg: 'bg-[#f9dcc4]', icon: 'text-[#a06151]', border: 'hover:border-[#fec89a]' },
};

const statusConfig: Record<string, { icon: any; cls: string; label: string }> = {
    'Đã thanh toán': { icon: CheckCircle, cls: 'text-[#9f5c4c] bg-[#f9dcc4]', label: 'Đã thanh toán' },
    'Chưa thanh toán': { icon: AlertCircle, cls: 'text-[#a66754] bg-[#fcd5ce]', label: 'Chưa thanh toán' },
    'Quá hạn': { icon: AlertCircle, cls: 'text-[#a45c4d] bg-[#fcd5ce]', label: 'Quá hạn' },
};

export default function GuestPortal() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                <Breadcrumb>
                    <BreadcrumbList className="text-sm text-[#8f6f64]">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="hover:text-[#5b463f]">
                                <Link href="/guest-portal">Khách thuê</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-semibold text-[#3f2d28]">Trang chủ</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Welcome banner — GUEST-06 */}
                <div className="rounded-2xl bg-gradient-to-r from-[#ffb5a7] to-[#fec89a] p-6 text-white shadow-md">
                    <p className="text-sm font-medium text-[#fff8f6]">Xin chào,</p>
                    <h1 className="mt-1 text-2xl font-bold">Hoàng Văn Khách</h1>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <DoorOpen className="h-4 w-4 text-[#fff8f6]" />
                            <span>Phòng {roomInfo.roomNumber} — {roomInfo.building}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#fff8f6]" />
                            <span>{roomInfo.contractStart} → {roomInfo.contractEnd}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[#fff8f6]" />
                            <span>Còn {roomInfo.daysLeft} ngày</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#fff8f6]/10 px-4 py-2 w-fit">
                        <CreditCard className="h-4 w-4 text-[#fff8f6]" />
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
                                className={`flex flex-col items-center gap-3 rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] p-5 transition-all hover:shadow-md ${c.border}`}
                            >
                                <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${c.bg}`}>
                                    <Icon className={`h-6 w-6 ${c.icon}`} />
                                </div>
                                <p className="text-sm font-medium text-[#3f2d28] text-center">{a.label}</p>
                            </button>
                        );
                    })}
                </div>

                {/* GUEST-07: Invoice list */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-[#3f2d28]">Hóa đơn theo kỳ</h2>
                    {invoices.map((inv, i) => {
                        const sc = statusConfig[inv.status] || statusConfig['Chưa thanh toán'];
                        const StatusIcon = sc.icon;
                        return (
                            <div key={i} className="rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-[#f9dcc4]">
                                    <div>
                                        <h3 className="text-sm font-semibold text-[#3f2d28]">{inv.period}</h3>
                                        <p className="text-xs text-[#b89184]">Hạn thanh toán: {inv.dueDate}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${sc.cls}`}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {sc.label}
                                    </span>
                                </div>
                                <div className="px-6 py-4 space-y-2">
                                    {inv.items.map((item, j) => (
                                        <div key={j} className="flex justify-between">
                                            <span className="text-sm text-[#6f544b]">{item.label}</span>
                                            <span className="text-sm font-medium text-[#3f2d28]">
                                                {item.amount ? item.amount.toLocaleString('vi-VN') + ' ₫' : '—'}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="pt-3 mt-2 border-t border-[#f9dcc4] flex justify-between">
                                        <span className="text-sm font-semibold text-[#3f2d28]">Tổng cộng</span>
                                        <span className="text-sm font-bold text-[#3f2d28]">{inv.total}</span>
                                    </div>
                                </div>
                                {inv.status !== 'Đã thanh toán' && (
                                    <div className="px-6 pb-5">
                                        <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffb5a7] py-3 text-sm font-semibold text-white hover:bg-[#fec89a] transition-colors">
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



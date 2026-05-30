'use client';

import { DashboardLayout } from '@/features/dashboard/components/layouts';
import {
    DoorOpen, Users, FileText, Wrench,
    Clock, MessageSquare, ChevronRight, CheckCircle2,
    ArrowRight,
} from 'lucide-react';

const todayStats = [
    { label: 'Nhận phòng hôm nay', value: 5, icon: DoorOpen, color: 'green', href: '/staff/rooms' },
    { label: 'Trả phòng hôm nay', value: 3, icon: ArrowRight, color: 'amber', href: '/staff/rooms' },
    { label: 'Thanh toán chờ xử lý', value: 12, icon: Clock, color: 'red', href: '/staff/payments' },
    { label: 'Yêu cầu hỗ trợ mới', value: 6, icon: MessageSquare, color: 'purple', href: '/staff/support' },
    { label: 'HĐ sắp hết hạn (30 ngày)', value: 4, icon: FileText, color: 'orange', href: '/staff/contracts' },
    { label: 'Phòng cần nhập điện nước', value: 8, icon: Wrench, color: 'blue', href: '/staff/rooms' },
];

const colorMap: Record<string, { bg: string; icon: string }> = {
    green: { bg: 'bg-[#f9dcc4]', icon: 'text-[#9f5c4c]' },
    amber: { bg: 'bg-[#fcd5ce]', icon: 'text-[#a66754]' },
    red: { bg: 'bg-[#fcd5ce]', icon: 'text-[#a45c4d]' },
    purple: { bg: 'bg-[#f9dcc4]', icon: 'text-[#a06151]' },
    orange: { bg: 'bg-[#fcd5ce]', icon: 'text-[#ab6f5b]' },
    blue: { bg: 'bg-[#f8edeb]', icon: 'text-[#a65f4f]' },
};

// Expiring contracts in 7/15/30 days (CON-09)
const expiringContracts = [
    { room: 'P.101', customer: 'Nguyễn Hữu Nam', endDate: '05/06/2026', daysLeft: 5 },
    { room: 'P.207', customer: 'Trần Thị Bích', endDate: '10/06/2026', daysLeft: 10 },
    { room: 'P.312', customer: 'Lê Văn Tú', endDate: '18/06/2026', daysLeft: 18 },
    { room: 'P.405', customer: 'Phạm Quỳnh Anh', endDate: '28/06/2026', daysLeft: 28 },
];

// Recent activities
const recentActivities = [
    { action: 'Tạo hợp đồng', detail: 'P.302 — Hoàng Thị Thu', time: '09:15', icon: FileText },
    { action: 'Xác nhận nhận phòng', detail: 'P.101 — Nguyễn Hữu Nam', time: '08:50', icon: CheckCircle2 },
    { action: 'Nhập điện nước', detail: 'P.205 — Kỳ tháng 5', time: '08:20', icon: Wrench },
    { action: 'Thêm khách hàng mới', detail: 'Trần Thị Lan — Hộ chiếu VN', time: 'Hôm qua', icon: Users },
];

export default function StaffDashboard() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-[#3f2d28]">Công việc hôm nay</h1>
                    <p className="mt-0.5 text-sm text-[#8f6f64]">Thứ 7, 31 tháng 5 năm 2026</p>
                </div>

                {/* Quick stats — operational metrics */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {todayStats.map((s, i) => {
                        const c = colorMap[s.color];
                        const Icon = s.icon;
                        return (
                            <div
                                key={i}
                                className="group relative rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-[#ffb5a7] transition-all"
                            >
                                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} mb-3`}>
                                    <Icon className={`h-5 w-5 ${c.icon}`} />
                                </div>
                                <p className="text-xs text-[#8f6f64]">{s.label}</p>
                                <p className="mt-1 text-3xl font-bold text-[#3f2d28]">{s.value}</p>
                                <ChevronRight className="absolute right-4 top-1/2 h-4 w-4 text-[#caa79a] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* CON-09: Expiring contracts */}
                    <div className="rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f9dcc4]">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#a66754]" />
                                <h2 className="text-sm font-semibold text-[#3f2d28]">HĐ sắp hết hạn</h2>
                            </div>
                            <span className="text-xs text-[#b89184]">Trong 30 ngày tới</span>
                        </div>
                        <div className="divide-y divide-[#f9dcc4]">
                            {expiringContracts.map((c, i) => (
                                <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-[#f8edeb] cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg bg-[#fcd5ce] text-xs font-bold text-[#7d4e41]">
                                            {c.room}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-[#3f2d28]">{c.customer}</p>
                                            <p className="text-xs text-[#b89184]">Hết ngày {c.endDate}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.daysLeft <= 7 ? 'bg-[#fcd5ce] text-[#7d3e35]' : c.daysLeft <= 15 ? 'bg-[#fcd5ce] text-[#7d4e41]' : 'bg-[#f9dcc4] text-[#7d4e41]'}`}>
                                        {c.daysLeft} ngày
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent activities */}
                    <div className="rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f9dcc4]">
                            <h2 className="text-sm font-semibold text-[#3f2d28]">Hoạt động gần đây</h2>
                            <button className="text-xs text-[#a65f4f] hover:underline">Xem tất cả</button>
                        </div>
                        <div className="divide-y divide-[#f9dcc4]">
                            {recentActivities.map((a, i) => {
                                const Icon = a.icon;
                                return (
                                    <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-[#f8edeb] cursor-pointer">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8edeb]">
                                            <Icon className="h-4 w-4 text-[#a65f4f]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#3f2d28]">{a.action}</p>
                                            <p className="text-xs text-[#8f6f64] truncate">{a.detail}</p>
                                        </div>
                                        <span className="text-xs text-[#b89184] whitespace-nowrap">{a.time}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}



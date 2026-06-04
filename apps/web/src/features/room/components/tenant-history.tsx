import React from 'react';
import { Tenant } from '../types/room.type';
import { User, Phone, Mail, Calendar, Coins, History } from 'lucide-react';

interface TenantHistoryProps {
    history: Tenant[];
}

export function TenantHistory({ history }: TenantHistoryProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white rounded-2xl border border-[#fcd5ce] p-6">
                <History className="h-8 w-8 text-[#caa79a] mb-2" />
                <p className="text-sm font-medium text-[#5b463f]">Chưa có lịch sử khách thuê</p>
                <p className="text-xs text-[#b89184] mt-1">Phòng này chưa từng ghi nhận khách thuê cũ.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map((tenant, idx) => (
                <div
                    key={tenant.id || idx}
                    className="rounded-2xl border border-[#fcd5ce]/50 bg-white p-4 shadow-sm"
                >
                    <div className="flex items-center justify-between border-b border-[#fcd5ce]/20 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fcd5ce]/40 text-[#ff385c]">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-[#3f2d28] text-sm">{tenant.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            Hợp đồng: {tenant.contractId}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-[#5b463f]">
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-[#8f6f64]" />
                            <span>SĐT: <strong className="text-[#3f2d28]">{tenant.phone}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-[#8f6f64]" />
                            <span>Email: <strong className="text-[#3f2d28]">{tenant.email}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[#8f6f64]" />
                            <span>Thời gian: <strong className="text-[#3f2d28]">{formatDate(tenant.startDate)} - {formatDate(tenant.endDate)}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Coins className="h-3.5 w-3.5 text-[#8f6f64]" />
                            <span>Tiền cọc: <strong className="text-[#ff385c]">{formatCurrency(tenant.deposit)}</strong></span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

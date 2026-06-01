import React from 'react';
import { InvoiceStatus } from '../types/revenue.type';
import { CheckCircle2, AlertTriangle, AlertCircle, XCircle, Clock } from 'lucide-react';

interface PaymentStatusBadgeProps {
    status: InvoiceStatus;
    className?: string;
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
    const config = {
        paid: {
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'Đã thanh toán',
            icon: CheckCircle2
        },
        unpaid: {
            bg: 'bg-[#fff8f6] text-[#8f6f64] border-[#fcd5ce]',
            label: 'Chưa thanh toán',
            icon: Clock
        },
        partial: {
            bg: 'bg-amber-50 text-amber-700 border-amber-200',
            label: 'Thanh toán một phần',
            icon: AlertTriangle
        },
        overdue: {
            bg: 'bg-red-50 text-red-700 border-red-200',
            label: 'Quá hạn thanh toán',
            icon: AlertCircle
        },
        cancelled: {
            bg: 'bg-slate-50 text-slate-600 border-slate-200',
            label: 'Đã hủy bỏ',
            icon: XCircle
        }
    };

    const current = config[status] || config.unpaid;
    const Icon = current.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${current.bg} ${className}`}
        >
            <Icon className="h-3 w-3" />
            {current.label}
        </span>
    );
}

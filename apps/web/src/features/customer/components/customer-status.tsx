import React from 'react';
import { CustomerStatus } from '../types/customer.type';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface CustomerStatusBadgeProps {
    status: CustomerStatus;
    className?: string;
}

export function CustomerStatusBadge({ status, className = '' }: CustomerStatusBadgeProps) {
    const config = {
        active: {
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'Đang thuê',
            icon: CheckCircle2
        },
        inactive: {
            bg: 'bg-slate-50 text-slate-600 border-slate-200',
            label: 'Đã trả phòng',
            icon: XCircle
        },
        potential: {
            bg: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'Khách tiềm năng',
            icon: Sparkles
        }
    };

    const current = config[status] || config.potential;
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

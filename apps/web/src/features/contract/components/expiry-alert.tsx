import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface ExpiryAlertProps {
    endDate: string;
    status: string;
}

export function ExpiryAlert({ endDate, status }: ExpiryAlertProps) {
    if (status !== 'active') return null;

    const end = new Date(endDate);
    const today = new Date();
    const remainingDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (remainingDays < 0 || remainingDays > 30) return null;

    const config = {
        danger: {
            bg: 'bg-red-50 border-red-200 text-red-700',
            label: 'Cảnh báo khẩn cấp!',
            desc: `Hợp đồng sẽ chính thức hết hạn sau ${remainingDays} ngày nữa. Vui lòng liên hệ khách thuê để chốt lịch gia hạn hoặc chuẩn bị bàn giao trả phòng.`
        },
        warning: {
            bg: 'bg-amber-50 border-amber-200 text-amber-700',
            label: 'Hợp đồng sắp hết hạn',
            desc: `Hợp đồng còn ${remainingDays} ngày hiệu lực. Hãy chuẩn bị các điều khoản gia hạn nếu khách hàng có nhu cầu ở tiếp.`
        }
    };

    const current = remainingDays <= 7 ? config.danger : config.warning;

    return (
        <div className={`p-4 rounded-xl border text-xs flex gap-2.5 ${current.bg}`}>
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500 animate-bounce" />
            <div>
                <p className="font-bold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {current.label} (Còn {remainingDays} ngày)
                </p>
                <p className="opacity-90 mt-1">{current.desc}</p>
            </div>
        </div>
    );
}

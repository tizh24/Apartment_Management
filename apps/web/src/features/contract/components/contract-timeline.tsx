import React from 'react';
import { CalendarDays, Clock, Hourglass } from 'lucide-react';

interface ContractTimelineProps {
    startDate: string;
    endDate: string;
    status: string;
}

export function ContractTimeline({ startDate, endDate, status }: ContractTimelineProps) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate elapsed days
    let elapsedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (elapsedDays < 0) elapsedDays = 0;
    if (elapsedDays > totalDays) elapsedDays = totalDays;

    const remainingDays = totalDays - elapsedDays;
    const progressPct = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    if (status !== 'active') {
        return (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                Thời gian thuê đã kết thúc ({status === 'expired' ? 'Hợp đồng hết hạn' : status === 'terminated' ? 'Đã thanh lý sớm' : 'Đã hủy'}).
            </div>
        );
    }

    return (
        <div className="space-y-3.5 bg-white border border-[#fcd5ce] p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold text-[#3f2d28] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Hourglass className="h-4 w-4 text-[#ff385c]" />
                Tiến độ thời hạn hợp đồng
            </h4>

            {/* Visual Bar */}
            <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div
                    className="h-full bg-gradient-to-r from-[#ffb5a7] to-[#ff385c] rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            {/* Timestamps */}
            <div className="flex justify-between text-[10px] font-semibold text-[#caa79a]">
                <span>Ngày đến: {formatDate(start)}</span>
                <span>Tiến độ: {progressPct}%</span>
                <span>Ngày đi: {formatDate(end)}</span>
            </div>

            {/* Aggregated Counters */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#fcd5ce]/20 text-xs text-[#5b463f]">
                <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-[#caa79a]" />
                    <span>Đã ở: <strong>{elapsedDays} / {totalDays} ngày</strong></span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                    <Clock className="h-4 w-4 text-[#ff385c]" />
                    <span>Còn lại: <strong className={remainingDays <= 30 ? 'text-[#ff385c] font-black' : 'text-[#3f2d28]'}>{remainingDays} ngày</strong></span>
                </div>
            </div>
        </div>
    );
}

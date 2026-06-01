import React from 'react';
import { UtilityReading } from '../types/room.type';
import { Lightbulb, Droplets, Calendar, User, FileCheck, FileClock } from 'lucide-react';

interface UtilityHistoryProps {
    history: UtilityReading[];
}

export function UtilityHistory({ history }: UtilityHistoryProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white rounded-2xl border border-[#fcd5ce] p-6">
                <Lightbulb className="h-8 w-8 text-[#caa79a] mb-2 animate-pulse" />
                <p className="text-sm font-medium text-[#5b463f]">Chưa có lịch sử điện nước</p>
                <p className="text-xs text-[#b89184] mt-1">Hãy nhập chỉ số đầu kỳ để bắt đầu theo dõi.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((reading) => {
                const electricDiff = reading.electricEnd - reading.electricStart;
                const waterDiff = reading.waterEnd - reading.waterStart;

                return (
                    <div
                        key={reading.id}
                        className="rounded-2xl border border-[#fcd5ce] bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between border-b border-[#fcd5ce]/50 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#ff385c]" />
                                <span className="font-bold text-[#3f2d28] text-sm">Kỳ thanh toán: {reading.period}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {reading.isBilled ? (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                                        <FileCheck className="h-3 w-3" />
                                        Đã xuất hóa đơn
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
                                        <FileClock className="h-3 w-3" />
                                        Chờ chốt hóa đơn
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Điện */}
                            <div className="rounded-xl bg-[#fff8f6] p-3 border border-[#fcd5ce]/30">
                                <div className="flex items-center gap-2 mb-2 text-[#ff385c]">
                                    <Lightbulb className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Chỉ số Điện</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-[#5b463f] mb-2">
                                    <div>Số đầu: <span className="font-semibold text-[#3f2d28]">{reading.electricStart} kWh</span></div>
                                    <div>Số cuối: <span className="font-semibold text-[#3f2d28]">{reading.electricEnd} kWh</span></div>
                                </div>
                                <div className="border-t border-[#fcd5ce]/20 pt-2 flex justify-between items-baseline">
                                    <span className="text-xs text-[#8f6f64]">Tiêu thụ: <strong className="text-[#3f2d28]">{electricDiff} kWh</strong></span>
                                    <span className="text-sm font-bold text-[#ff385c]">{formatCurrency(reading.electricCost)}</span>
                                </div>
                                <p className="text-[10px] text-[#b89184] mt-1">Đơn giá: {formatCurrency(reading.electricPrice)}/kWh</p>
                            </div>

                            {/* Nước */}
                            <div className="rounded-xl bg-[#e3f2fd]/30 p-3 border border-[#bbdefb]/30">
                                <div className="flex items-center gap-2 mb-2 text-[#1565c0]">
                                    <Droplets className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Chỉ số Nước</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-[#5b463f] mb-2">
                                    <div>Số đầu: <span className="font-semibold text-[#3f2d28]">{reading.waterStart} m³</span></div>
                                    <div>Số cuối: <span className="font-semibold text-[#3f2d28]">{reading.waterEnd} m³</span></div>
                                </div>
                                <div className="border-t border-[#fcd5ce]/20 pt-2 flex justify-between items-baseline">
                                    <span className="text-xs text-[#8f6f64]">Tiêu thụ: <strong className="text-[#3f2d28]">{waterDiff} m³</strong></span>
                                    <span className="text-sm font-bold text-[#1565c0]">{formatCurrency(reading.waterCost)}</span>
                                </div>
                                <p className="text-[10px] text-[#b89184] mt-1">Đơn giá: {formatCurrency(reading.waterPrice)}/m³</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#fcd5ce]/20 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#b89184]">
                            <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                Người ghi: {reading.readBy}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Ngày ghi: {formatDate(reading.readDate)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

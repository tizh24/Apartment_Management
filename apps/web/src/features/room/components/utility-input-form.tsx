import React, { useState } from 'react';
import { UtilityReading } from '../types/room.type';
import { Lightbulb, Droplets, Calendar, User, Save, X } from 'lucide-react';

interface UtilityInputFormProps {
    latestReading: UtilityReading | null;
    onSubmit: (readingData: {
        period: string;
        electricStart: number;
        electricEnd: number;
        waterStart: number;
        waterEnd: number;
        electricPrice: number;
        waterPrice: number;
        readBy: string;
    }) => void;
    onCancel: () => void;
}

export function UtilityInputForm({ latestReading, onSubmit, onCancel }: UtilityInputFormProps) {
    const today = new Date();
    const defaultPeriod = `${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const [period, setPeriod] = useState(defaultPeriod);
    const [electricStart, setElectricStart] = useState(latestReading ? latestReading.electricEnd : 0);
    const [electricEnd, setElectricEnd] = useState(latestReading ? latestReading.electricEnd + 100 : 100);
    const [waterStart, setWaterStart] = useState(latestReading ? latestReading.waterEnd : 0);
    const [waterEnd, setWaterEnd] = useState(latestReading ? latestReading.waterEnd + 5 : 5);
    
    const [electricPrice, setElectricPrice] = useState(3500);
    const [waterPrice, setWaterPrice] = useState(18000);
    const [readBy, setReadBy] = useState('Admin');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!period.match(/^(0[1-9]|1[0-2])\/\d{4}$/)) {
            setError('Định dạng kỳ thanh toán phải là MM/YYYY (Ví dụ: 06/2026)');
            return;
        }

        if (electricEnd < electricStart) {
            setError('Chỉ số điện cuối kỳ không được nhỏ hơn chỉ số đầu kỳ.');
            return;
        }

        if (waterEnd < waterStart) {
            setError('Chỉ số nước cuối kỳ không được nhỏ hơn chỉ số đầu kỳ.');
            return;
        }

        onSubmit({
            period,
            electricStart,
            electricEnd,
            waterStart,
            waterEnd,
            electricPrice,
            waterPrice,
            readBy
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 bg-[#fff8f6] p-5 rounded-2xl border border-[#fcd5ce]">
            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-3">
                <h3 className="text-sm font-bold text-[#3f2d28] uppercase tracking-wider">Ghi chỉ số Điện & Nước</h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-[#8f6f64] hover:text-[#ff385c] rounded-full p-1 hover:bg-[#fcd5ce]/30 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kỳ ghi & Người ghi */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase">Kỳ thanh toán (MM/YYYY)</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#8f6f64]" />
                        <input
                            type="text"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            placeholder="06/2026"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase">Người ghi nhận</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-[#8f6f64]" />
                        <input
                            type="text"
                            value={readBy}
                            onChange={(e) => setReadBy(e.target.value)}
                            placeholder="Tên nhân viên"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chỉ số Điện */}
                <div className="p-4 rounded-xl border border-[#fcd5ce]/60 bg-white space-y-3">
                    <div className="flex items-center gap-2 text-[#ff385c]">
                        <Lightbulb className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Chỉ số Điện (kWh)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-[#8f6f64] mb-1">Số đầu kỳ</label>
                            <input
                                type="number"
                                value={electricStart}
                                onChange={(e) => setElectricStart(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[#8f6f64] mb-1">Số cuối kỳ</label>
                            <input
                                type="number"
                                value={electricEnd}
                                onChange={(e) => setElectricEnd(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[#8f6f64] mb-1">Đơn giá điện (đ/kWh)</label>
                        <input
                            type="number"
                            value={electricPrice}
                            onChange={(e) => setElectricPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            required
                        />
                    </div>
                </div>

                {/* Chỉ số Nước */}
                <div className="p-4 rounded-xl border border-[#bbdefb]/60 bg-white space-y-3">
                    <div className="flex items-center gap-2 text-[#1565c0]">
                        <Droplets className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Chỉ số Nước (m³)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-[#8f6f64] mb-1">Số đầu kỳ</label>
                            <input
                                type="number"
                                value={waterStart}
                                onChange={(e) => setWaterStart(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[#8f6f64] mb-1">Số cuối kỳ</label>
                            <input
                                type="number"
                                value={waterEnd}
                                onChange={(e) => setWaterEnd(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[#8f6f64] mb-1">Đơn giá nước (đ/m³)</label>
                        <input
                            type="number"
                            value={waterPrice}
                            onChange={(e) => setWaterPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#fcd5ce]/30">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-xs font-semibold text-[#5b463f] rounded-lg border border-[#fcd5ce] hover:bg-[#fcd5ce]/20 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                    <Save className="h-4 w-4" />
                    Lưu ghi nhận
                </button>
            </div>
        </form>
    );
}

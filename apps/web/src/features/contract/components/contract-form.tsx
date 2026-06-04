import React, { useState, useEffect } from 'react';
import { Contract } from '../types/contract.type';
import { useRoomStore } from '@/features/room/store/room-store';
import { useCustomerStore } from '@/features/customer/store/customer-store';
import { ConflictChecker } from './conflict-checker';
import { Save, X, AlertTriangle, Sparkles, Building, User, Calendar, Coins } from 'lucide-react';

interface ContractFormProps {
    onSubmit: (contractData: {
        roomId: string;
        roomNumber: string;
        buildingName: string;
        customerId: string;
        customerName: string;
        customerPhone: string;
        saleName?: string;
        startDate: string;
        endDate: string;
        price: number;
        deposit: number;
        notes?: string;
    }) => void;
    onCancel: () => void;
}

export function ContractForm({ onSubmit, onCancel }: ContractFormProps) {
    const { rooms } = useRoomStore();
    const { customers } = useCustomerStore();

    // Filters to only show rooms that are vacant or reserved
    const availableRooms = rooms.filter((r) => r.status === 'vacant' || r.status === 'reserved');
    // Filters to only show customers that are potential, inactive, or not currently renting
    const eligibleCustomers = customers.filter((c) => c.status !== 'active');

    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [price, setPrice] = useState(0);
    const [deposit, setDeposit] = useState(0);
    const [saleName, setSaleName] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const activeRoom = rooms.find((r) => r.id === selectedRoomId);
    const activeCustomer = customers.find((c) => c.id === selectedCustomerId);

    // Prefill price and deposit when selected room changes
    useEffect(() => {
        if (activeRoom) {
            setPrice(activeRoom.price);
            setDeposit(activeRoom.price); // default cọc 1 tháng
        } else {
            setPrice(0);
            setDeposit(0);
        }
    }, [selectedRoomId, activeRoom]);

    const handleQuickDeposit = (months: number) => {
        if (price > 0) {
            setDeposit(price * months);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedRoomId) {
            setError('Vui lòng chọn phòng thuê.');
            return;
        }

        if (!selectedCustomerId) {
            setError('Vui lòng chọn khách hàng.');
            return;
        }

        if (!startDate || !endDate) {
            setError('Vui lòng chọn thời gian bắt đầu và kết thúc.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            setError('Ngày kết thúc phải sau ngày bắt đầu.');
            return;
        }

        if (price <= 0) {
            setError('Giá thuê phải lớn hơn 0 ₫.');
            return;
        }

        if (!activeRoom || !activeCustomer) return;

        onSubmit({
            roomId: activeRoom.id,
            roomNumber: activeRoom.roomNumber,
            buildingName: activeRoom.buildingName,
            customerId: activeCustomer.id,
            customerName: activeCustomer.name,
            customerPhone: activeCustomer.phone,
            saleName: saleName || undefined,
            startDate,
            endDate,
            price,
            deposit,
            notes: notes || undefined
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-4">
                <div>
                    <h2 className="text-lg font-bold text-[#3f2d28]">Lập hợp đồng thuê phòng mới</h2>
                    <p className="text-xs text-[#8f6f64] mt-0.5">
                        Tạo hợp đồng thuê bằng cách chọn phòng trống, gán khách hàng, và thiết lập mức giá cọc.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-[#8f6f64] hover:text-[#ff385c] rounded-full p-2 hover:bg-[#fcd5ce]/30 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Chọn phòng */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Chọn phòng trống *</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                            required
                        >
                            <option value="">-- Chọn phòng trống --</option>
                            {availableRooms.map((r) => (
                                <option key={r.id} value={r.id}>
                                    P.{r.roomNumber} ({r.buildingName}) - {(r.price / 1000000).toFixed(1)}M/tháng
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Chọn khách hàng */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Chọn khách hàng *</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            required
                        >
                            <option value="">-- Chọn khách hàng --</option>
                            {eligibleCustomers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.phone}) - {c.nationality}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Ngày bắt đầu */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Ngày bắt đầu *</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            required
                        />
                    </div>
                </div>

                {/* Ngày kết thúc */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Ngày kết thúc *</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            required
                        />
                    </div>
                </div>

                {/* Giá thuê */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Mức giá thuê hàng tháng (₫) *</label>
                    <div className="relative">
                        <Coins className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            min="1"
                            required
                        />
                    </div>
                </div>

                {/* Tiền đặt cọc */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Tiền cọc (₫) *</label>
                    <div className="flex gap-2">
                        <div className="relative w-full">
                            <Coins className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                            <input
                                type="number"
                                value={deposit}
                                onChange={(e) => setDeposit(Number(e.target.value))}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                                min="1"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleQuickDeposit(1)}
                            className="inline-flex items-center shrink-0 px-3 py-2 border border-[#fcd5ce] text-[#5b463f] hover:bg-[#fff8f6] rounded-xl text-[10px] font-bold"
                        >
                            1T
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickDeposit(2)}
                            className="inline-flex items-center shrink-0 px-3 py-2 border border-[#fcd5ce] text-[#5b463f] hover:bg-[#fff8f6] rounded-xl text-[10px] font-bold"
                        >
                            2T
                        </button>
                    </div>
                </div>

                {/* Nhân viên Sale */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Nhân viên môi giới (Sale)</label>
                    <input
                        type="text"
                        value={saleName}
                        onChange={(e) => setSaleName(e.target.value)}
                        placeholder="Tên nhân viên giới thiệu"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Ghi chú điều khoản</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Các ghi chú đặc biệt khác..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                    />
                </div>

            </div>

            {/* Conflict Checker Component */}
            {selectedRoomId && startDate && endDate && (
                <div className="pt-2">
                    <ConflictChecker
                        roomId={selectedRoomId}
                        startDate={startDate}
                        endDate={endDate}
                        existingContracts={rooms.map((r) => {
                            if (r.status !== 'occupied' || !r.currentTenant) return null;
                            return {
                                roomId: r.id,
                                roomNumber: r.roomNumber,
                                startDate: r.currentTenant.startDate,
                                endDate: r.currentTenant.endDate,
                                status: 'active'
                            };
                        }).filter(Boolean) as any}
                    />
                </div>
            )}

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#fcd5ce] mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-sm font-semibold text-[#5b463f] rounded-xl border border-[#fcd5ce] hover:bg-[#fcd5ce]/20 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-xl transition-colors shadow-md hover:shadow-lg cursor-pointer"
                >
                    <Save className="h-4.5 w-4.5" />
                    Bàn giao & Ký kết
                </button>
            </div>
        </form>
    );
}

import React, { useState, useEffect } from 'react';
import { InvoiceType } from '../types/revenue.type';
import { useRoomStore } from '@/features/room/store/room-store';
import { useCustomerStore } from '@/features/customer/store/customer-store';
import { Save, X, Building, User, Coins, Calendar, FileText, AlertTriangle } from 'lucide-react';

interface InvoiceFormProps {
    onSubmit: (invoiceData: {
        roomId: string;
        roomNumber: string;
        buildingName: string;
        customerId: string;
        customerName: string;
        type: InvoiceType;
        amount: number;
        dueDate: string;
        issueDate: string;
        notes?: string;
    }) => void;
    onCancel: () => void;
}

export function InvoiceForm({ onSubmit, onCancel }: InvoiceFormProps) {
    const { rooms } = useRoomStore();
    const { customers } = useCustomerStore();

    // Filter rooms that are currently occupied
    const occupiedRooms = rooms.filter((r) => r.status === 'occupied' && r.currentTenant);

    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [type, setType] = useState<InvoiceType>('room');
    const [amount, setAmount] = useState(0);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const activeRoom = rooms.find((r) => r.id === selectedRoomId);
    const activeCustomer = customers.find((c) => c.id === selectedCustomerId);

    // Sync customer and default rent amount when room selection changes
    useEffect(() => {
        if (activeRoom && activeRoom.currentTenant) {
            setSelectedCustomerId(activeRoom.currentTenant.id);
            if (type === 'room') {
                setAmount(activeRoom.price);
            }
        }
    }, [selectedRoomId, activeRoom, type]);

    // Set default due date to 7 days from today
    useEffect(() => {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        setDueDate(nextWeek.toISOString().split('T')[0]);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedRoomId) {
            setError('Vui lòng chọn phòng thuê phát sinh.');
            return;
        }

        if (!selectedCustomerId) {
            setError('Không tìm thấy thông tin khách hàng tương ứng.');
            return;
        }

        if (amount <= 0) {
            setError('Số tiền hóa đơn phải lớn hơn 0 ₫.');
            return;
        }

        if (!dueDate) {
            setError('Vui lòng chọn hạn thanh toán.');
            return;
        }

        if (!activeRoom || !activeCustomer) return;

        onSubmit({
            roomId: activeRoom.id,
            roomNumber: activeRoom.roomNumber,
            buildingName: activeRoom.buildingName,
            customerId: activeCustomer.id,
            customerName: activeCustomer.name,
            type,
            amount,
            dueDate,
            issueDate: new Date().toISOString().split('T')[0],
            notes: notes || undefined
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-4">
                <div>
                    <h2 className="text-lg font-bold text-[#3f2d28]">Tạo khoản thu / Hóa đơn mới</h2>
                    <p className="text-xs text-[#8f6f64] mt-0.5">
                        Lập phiếu yêu cầu thanh toán (Hóa đơn) tiền phòng, điện nước hoặc dịch vụ phát sinh.
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
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Căn hộ / Phòng thuê *</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                            required
                        >
                            <option value="">-- Chọn phòng đang thuê --</option>
                            {occupiedRooms.map((r) => (
                                <option key={r.id} value={r.id}>
                                    P.{r.roomNumber} ({r.buildingName}) - Khách: {r.currentTenant?.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Khách hàng (Tự động map) */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Khách hàng thanh toán</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <input
                            type="text"
                            value={activeCustomer ? `${activeCustomer.name} (${activeCustomer.phone})` : ''}
                            disabled
                            placeholder="Tự động điền theo phòng..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-slate-50 text-xs text-[#8f6f64] outline-none"
                        />
                    </div>
                </div>

                {/* Loại hóa đơn */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Loại khoản thu *</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as InvoiceType)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                    >
                        <option value="room">Tiền phòng định kỳ</option>
                        <option value="utility">Hóa đơn Điện & Nước</option>
                        <option value="service">Phí dịch vụ phát sinh</option>
                        <option value="other">Khoản thu khác</option>
                    </select>
                </div>

                {/* Hạn thanh toán */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Hạn thanh toán (Due Date) *</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            required
                        />
                    </div>
                </div>

                {/* Số tiền cần thu */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Tổng số tiền thu (₫) *</label>
                    <div className="relative">
                        <Coins className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            min="1"
                            required
                        />
                    </div>
                </div>

                {/* Ghi chú */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Nội dung ghi chú</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-2.5 h-4 w-4 text-[#caa79a]" />
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Mô tả cụ thể hóa đơn phát sinh..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        />
                    </div>
                </div>

            </div>

            {/* Form Actions */}
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
                    Xuất hóa đơn mới
                </button>
            </div>
        </form>
    );
}

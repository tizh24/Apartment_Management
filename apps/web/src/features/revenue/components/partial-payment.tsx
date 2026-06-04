import React, { useState } from 'react';
import { Coins, CreditCard, Save, X } from 'lucide-react';

interface PartialPaymentProps {
    invoiceId: string;
    unpaidAmount: number;
    onSubmit: (payment: {
        amount: number;
        paymentMethod: 'transfer' | 'cash' | 'qr';
        note?: string;
    }) => void;
    onCancel: () => void;
}

export function PartialPayment({ invoiceId, unpaidAmount, onSubmit, onCancel }: PartialPaymentProps) {
    const [amount, setAmount] = useState(unpaidAmount);
    const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | 'qr'>('transfer');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (amount <= 0) {
            setError('Số tiền thanh toán phải lớn hơn 0 ₫.');
            return;
        }

        if (amount > unpaidAmount) {
            setError('Số tiền thanh toán không được lớn hơn dư nợ hiện tại của hóa đơn.');
            return;
        }

        onSubmit({
            amount,
            paymentMethod,
            note: note || undefined
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-[#fff8f6] p-5 rounded-2xl border border-[#fcd5ce] animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-2.5 mb-1">
                <h3 className="text-xs font-bold text-[#3f2d28] uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-[#ff385c]" />
                    Ghi nhận thanh toán
                </h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-[#8f6f64] hover:text-[#ff385c]"
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
                {/* Số tiền thanh toán */}
                <div>
                    <label className="block text-[10px] font-bold text-[#5b463f] mb-1.5 uppercase">Số tiền thanh toán (₫) *</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        max={unpaidAmount}
                        min="1"
                        required
                    />
                </div>

                {/* Phương thức thanh toán */}
                <div>
                    <label className="block text-[10px] font-bold text-[#5b463f] mb-1.5 uppercase">Phương thức *</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                    >
                        <option value="transfer">Chuyển khoản (Transfer)</option>
                        <option value="cash">Tiền mặt (Cash)</option>
                        <option value="qr">Quét mã QR</option>
                    </select>
                </div>

                {/* Ghi chú */}
                <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#5b463f] mb-1.5 uppercase">Ghi chú giao dịch</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ví dụ: Chị Lan đóng trước tiền phòng..."
                        className="w-full px-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#fcd5ce]/30">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#5b463f] rounded-lg border border-[#fcd5ce] hover:bg-white"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
                >
                    <Save className="h-3.5 w-3.5" />
                    Lưu giao dịch
                </button>
            </div>
        </form>
    );
}

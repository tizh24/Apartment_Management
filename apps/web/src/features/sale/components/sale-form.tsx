import React, { useState } from 'react';
import { Sale, SaleStatus } from '../types/sale.type';
import { Save, X, User, Phone, Mail, Check, AlertCircle } from 'lucide-react';

interface SaleFormProps {
    sale?: Sale | null;
    onSubmit: (saleData: {
        name: string;
        email: string;
        phone: string;
        status: SaleStatus;
    }) => void;
    onCancel: () => void;
}

export function SaleForm({ sale, onSubmit, onCancel }: SaleFormProps) {
    const [name, setName] = useState(sale?.name || '');
    const [email, setEmail] = useState(sale?.email || '');
    const [phone, setPhone] = useState(sale?.phone || '');
    const [status, setStatus] = useState<SaleStatus>(sale?.status || 'active');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Vui lòng điền họ và tên cộng tác viên.');
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            setError('Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }

        if (!phone.trim() || phone.length < 9) {
            setError('Vui lòng nhập số điện thoại liên hệ hợp lệ.');
            return;
        }

        onSubmit({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            status
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-4">
                <div>
                    <h2 className="text-base font-bold text-[#3f2d28]">
                        {sale ? 'Cập nhật thông tin CTV' : 'Đăng ký cộng tác viên mới'}
                    </h2>
                    <p className="text-[11px] text-[#caa79a]">
                        Điền đầy đủ thông tin để lưu trữ hồ sơ cộng tác viên trong hệ thống.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1.5 rounded-full hover:bg-[#fff8f6] text-[#8f6f64] hover:text-[#ff385c] transition-colors cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold animate-shake">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-4">
                {/* Họ tên */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5b463f] block">Họ và tên *</label>
                    <div className="relative flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2.5 focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                        <User className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ví dụ: Nguyễn Văn Mỹ"
                            className="w-full bg-transparent text-xs text-[#3f2d28] placeholder-[#caa79a] outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5b463f] block">Địa chỉ Email *</label>
                    <div className="relative flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2.5 focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                        <Mail className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vanmy.nguyen@apartmgmt.com"
                            className="w-full bg-transparent text-xs text-[#3f2d28] placeholder-[#caa79a] outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5b463f] block">Số điện thoại *</label>
                    <div className="relative flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2.5 focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                        <Phone className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ví dụ: 0909123456"
                            className="w-full bg-transparent text-xs text-[#3f2d28] placeholder-[#caa79a] outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Trạng thái */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5b463f] block">Trạng thái tài khoản</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setStatus('active')}
                            className={`flex items-center justify-between border px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                status === 'active'
                                    ? 'bg-[#fff8f6] border-[#ff385c] text-[#ff385c]'
                                    : 'bg-white border-[#fcd5ce] text-[#8f6f64] hover:bg-[#fff8f6]/50'
                            }`}
                        >
                            <span>Hoạt động</span>
                            {status === 'active' && <Check className="h-4 w-4 text-[#ff385c]" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('inactive')}
                            className={`flex items-center justify-between border px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                status === 'inactive'
                                    ? 'bg-slate-50 border-slate-500 text-slate-700 font-bold'
                                    : 'bg-white border-[#fcd5ce] text-[#8f6f64] hover:bg-slate-50/50'
                            }`}
                        >
                            <span>Tạm khóa</span>
                            {status === 'inactive' && <Check className="h-4 w-4 text-slate-600" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#fcd5ce]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-[#fcd5ce] rounded-xl text-xs font-bold text-[#8f6f64] hover:bg-[#fff8f6] transition-all cursor-pointer"
                >
                    Hủy bỏ
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                    <Save className="h-4 w-4" />
                    {sale ? 'Lưu cập nhật' : 'Đăng ký CTV'}
                </button>
            </div>
        </form>
    );
}

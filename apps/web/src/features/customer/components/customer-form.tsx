import React, { useState, useEffect } from 'react';
import { Customer, CustomerStatus } from '../types/customer.type';
import { Save, X, AlertCircle } from 'lucide-react';

interface CustomerFormProps {
    customer?: Customer | null; // If null, we are in CREATE mode. Otherwise in EDIT mode.
    onSubmit: (customerData: {
        name: string;
        dob: string;
        phone: string;
        email: string;
        nationality: string;
        status: CustomerStatus;
    }) => void;
    onCancel: () => void;
}

const POPULAR_NATIONALITIES = [
    'Việt Nam',
    'Mỹ',
    'Hàn Quốc',
    'Nhật Bản',
    'Trung Quốc',
    'Anh',
    'Pháp',
    'Đức',
    'Úc',
    'Singapore'
];

export function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
    const isEdit = !!customer;

    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [nationality, setNationality] = useState('Việt Nam');
    const [status, setStatus] = useState<CustomerStatus>('potential');
    const [error, setError] = useState('');

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setDob(customer.dob);
            setPhone(customer.phone);
            setEmail(customer.email);
            setNationality(customer.nationality);
            setStatus(customer.status);
        } else {
            setName('');
            setDob('');
            setPhone('');
            setEmail('');
            setNationality('Việt Nam');
            setStatus('potential');
        }
    }, [customer]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Vui lòng nhập họ tên.');
            return;
        }

        if (!dob) {
            setError('Vui lòng chọn ngày sinh.');
            return;
        }

        if (!phone.trim()) {
            setError('Vui lòng nhập số điện thoại.');
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            setError('Vui lòng nhập email hợp lệ.');
            return;
        }

        onSubmit({
            name,
            dob,
            phone,
            email,
            nationality,
            status
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-4">
                <div>
                    <h2 className="text-lg font-bold text-[#3f2d28]">
                        {isEdit ? `Chỉnh sửa hồ sơ: ${customer?.name}` : 'Thêm khách hàng mới'}
                    </h2>
                    <p className="text-xs text-[#8f6f64] mt-0.5">
                        {isEdit ? 'Cập nhật lại thông tin cá nhân khách hàng.' : 'Nhập thông tin ban đầu để tạo hồ sơ khách hàng mới.'}
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
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ tên */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Họ và tên *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                        required
                    />
                </div>

                {/* Ngày sinh */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Ngày sinh *</label>
                    <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                    />
                </div>

                {/* Số điện thoại */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Số điện thoại *</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0912345678"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Địa chỉ Email *</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                    />
                </div>

                {/* Quốc tịch */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Quốc tịch *</label>
                    <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                    >
                        {POPULAR_NATIONALITIES.map((nat) => (
                            <option key={nat} value={nat}>{nat}</option>
                        ))}
                    </select>
                </div>

                {/* Trạng thái khách hàng */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Trạng thái hồ sơ *</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                    >
                        <option value="potential">Khách tiềm năng (Potential)</option>
                        <option value="active">Đang thuê phòng (Active)</option>
                        <option value="inactive">Đã thanh lý / trả phòng (Inactive)</option>
                    </select>
                </div>
            </div>

            {/* Actions */}
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
                    Lưu thông tin
                </button>
            </div>
        </form>
    );
}

import React, { useState } from 'react';
import { Sale, Commission, CommissionStatus } from '../types/sale.type';
import { CommissionTable } from './commission-table';
import { 
    Users, Phone, Mail, Calendar, Coins, ArrowLeft, 
    Check, CheckCircle, CreditCard, Ban, Trash2, ShieldCheck, X, Landmark, FileText
} from 'lucide-react';
import Image from 'next/image';

interface SaleDetailProps {
    sale: Sale;
    commissions: Commission[];
    onBack: () => void;
    onEdit: () => void;
    onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
    onPayCommissions: (ids: string[], paymentMethod: string, notes?: string) => void;
}

export function SaleDetail({
    sale,
    commissions,
    onBack,
    onEdit,
    onToggleStatus,
    onPayCommissions
}: SaleDetailProps) {
    const [selectedCommIds, setSelectedCommIds] = useState<string[]>([]);
    const [showQrModal, setShowQrModal] = useState(false);
    const [payoutNotes, setPayoutNotes] = useState('');

    const agentComms = commissions.filter(c => c.saleId === sale.id);
    const unpaidComms = agentComms.filter(c => c.status === 'unpaid');
    const unpaidAmount = unpaidComms.reduce((sum, c) => sum + c.amount, 0);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const handlePaySelected = (ids: string[]) => {
        setSelectedCommIds(ids);
        setPayoutNotes(`Thanh toán hoa hồng đợt ngày ${new Date().toLocaleDateString('vi-VN')}`);
        setShowQrModal(true);
    };

    const handlePayAll = () => {
        if (unpaidComms.length === 0) return;
        const unpaidIds = unpaidComms.map(c => c.id);
        setSelectedCommIds(unpaidIds);
        setPayoutNotes(`Thanh toán toàn bộ nợ hoa hồng tích lũy tính đến ngày ${new Date().toLocaleDateString('vi-VN')}`);
        setShowQrModal(true);
    };

    const confirmPayout = () => {
        onPayCommissions(selectedCommIds, 'transfer', payoutNotes);
        setShowQrModal(false);
        setSelectedCommIds([]);
    };

    const activePayoutAmount = commissions
        .filter(c => selectedCommIds.includes(c.id))
        .reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="space-y-6">
            
            {/* Header / Actions row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-[#fcd5ce]">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b463f] hover:text-[#ff385c] bg-white border border-[#fcd5ce] px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                        onClick={onEdit}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#5b463f] bg-white border border-[#fcd5ce] hover:bg-[#fff8f6] px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                    >
                        Chỉnh sửa hồ sơ
                    </button>

                    {sale.status === 'active' ? (
                        <button
                            onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn TẠM KHÓA cộng tác viên ${sale.name}?`)) {
                                    onToggleStatus(sale.id, 'inactive');
                                }
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                        >
                            <Ban className="h-3.5 w-3.5" />
                            Tạm khóa tài khoản
                        </button>
                    ) : (
                        <button
                            onClick={() => onToggleStatus(sale.id, 'active')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                        >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Kích hoạt lại
                        </button>
                    )}

                    {/* Settle all button removed per request */}
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile Card */}
                <div className="lg:col-span-1 rounded-3xl border border-[#fcd5ce] bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-[#fff8f6] border border-[#fcd5ce] flex items-center justify-center shrink-0">
                            <Users className="h-7 w-7 text-[#ff385c]" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-[#3f2d28]">{sale.name}</h2>
                            <p className="text-[10px] text-[#caa79a] font-semibold uppercase tracking-wider">Mã CTV: {sale.id}</p>
                            <span className={`inline-flex rounded-full px-2 py-0.5 mt-1 text-[9px] font-extrabold uppercase border ${
                                sale.status === 'active' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                                {sale.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-[#fcd5ce]/30 pt-2 text-xs text-[#5b463f] space-y-3">
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-[#caa79a] font-medium flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" /> Điện thoại
                            </span>
                            <span className="font-bold">{sale.phone}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-[#caa79a] font-medium flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" /> Email
                            </span>
                            <span className="font-bold select-all">{sale.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-[#caa79a] font-medium flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> Ngày gia nhập
                            </span>
                            <span className="font-bold">{formatDate(sale.joinedDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Aggregated Commission Stats */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    
                    {/* Hợp đồng mang lại */}
                    <div className="rounded-3xl border border-[#fcd5ce] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[10px] font-bold text-[#caa79a] uppercase tracking-wider">Hợp đồng liên kết</span>
                        <p className="text-3xl font-black text-[#3f2d28] mt-2">{sale.totalContracts}</p>
                        <p className="text-[10px] text-[#caa79a] mt-1">Tổng hợp đồng khách thuê giới thiệu thành công</p>
                    </div>

                    {/* Tổng hoa hồng phát sinh */}
                    <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Tổng hoa hồng</span>
                        <p className="text-3xl font-black text-amber-700 mt-2">{formatCurrency(sale.totalCommission)}</p>
                        <p className="text-[10px] text-amber-500 mt-1">Lũy kế hoa hồng trọn đời của CTV</p>
                    </div>

                    {/* Đã chi trả */}
                    <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Đã quyết toán</span>
                        <p className="text-3xl font-black text-emerald-700 mt-2">{formatCurrency(sale.paidCommission)}</p>
                        <p className="text-[10px] text-emerald-500 mt-1">Đã chuyển khoản ngân hàng thành công</p>
                    </div>

                    {/* Chưa quyết toán */}
                    <div className="rounded-3xl border border-red-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Chưa thanh toán</span>
                        <p className="text-3xl font-black text-red-600 mt-2">{formatCurrency(sale.unpaidCommission)}</p>
                        <p className="text-[10px] text-red-500 mt-1">Số dư hoa hồng tích lũy chưa quyết toán</p>
                    </div>

                </div>

            </div>

            {/* Commissions Section */}
            <div className="space-y-4">
                <div className="border-b border-[#fcd5ce] pb-2">
                    <h3 className="text-sm font-bold text-[#3f2d28]">Lịch sử ghi nhận hoa hồng</h3>
                    <p className="text-[10px] text-[#caa79a]">Danh sách các giao dịch phát sinh hoa hồng giới thiệu khách thuê phòng.</p>
                </div>

                <CommissionTable 
                    commissions={agentComms} 
                    onPayCommissions={handlePaySelected} 
                    showAgentColumn={false} 
                />
            </div>

            {/* QR Payout Modal */}
            {showQrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        
                        {/* Title */}
                        <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#3f2d28]">Quyết toán Hoa hồng</h3>
                                <p className="text-[10px] text-[#caa79a]">Quét mã VietQR chuyển khoản quyết toán cho CTV.</p>
                            </div>
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="p-1.5 rounded-full hover:bg-[#fff8f6] text-[#8f6f64] hover:text-[#ff385c] cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Account detail card */}
                        <div className="bg-[#fff8f6] border border-[#fcd5ce] p-4 rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[#caa79a] font-medium">Người nhận</span>
                                <strong className="text-[#3f2d28] font-bold">{sale.name}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#caa79a] font-medium">Ngân hàng</span>
                                <span className="font-bold flex items-center gap-1 text-[#5b463f]">
                                    <Landmark className="h-3.5 w-3.5 text-[#ff385c]" />
                                    MB Bank (Quân Đội)
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#caa79a] font-medium">Số tài khoản</span>
                                <strong className="font-bold select-all text-[#3f2d28]">{sale.phone}</strong>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#fcd5ce]/40 pt-2 text-sm">
                                <span className="text-[#ff385c] font-bold">Số tiền</span>
                                <strong className="text-red-600 font-black">{formatCurrency(activePayoutAmount)}</strong>
                            </div>
                        </div>

                        {/* QR Code Container */}
                        <div className="flex flex-col items-center justify-center p-4 border border-[#fcd5ce] rounded-3xl bg-white shadow-inner space-y-2">
                            <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-slate-100 flex items-center justify-center">
                                <Image
                                    src="/images/mock_vietqr.png"
                                    alt="VietQR Payout"
                                    width={176}
                                    height={176}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="text-[9px] font-bold uppercase text-[#8f6f64] tracking-widest">VietQR · MB Bank Auto-Match</span>
                        </div>

                        {/* Notes input */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#5b463f] block">Ghi chú giao dịch</label>
                            <textarea
                                value={payoutNotes}
                                onChange={(e) => setPayoutNotes(e.target.value)}
                                className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] h-16 resize-none"
                                placeholder="Ghi chú thanh toán..."
                            />
                        </div>

                        {/* Dialog Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#fcd5ce]">
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="px-4 py-2 border border-[#fcd5ce] rounded-xl text-xs font-bold text-[#8f6f64] hover:bg-[#fff8f6] cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmPayout}
                                className="inline-flex items-center gap-1 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                                <Check className="h-4 w-4" />
                                Xác nhận đối soát thành công
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

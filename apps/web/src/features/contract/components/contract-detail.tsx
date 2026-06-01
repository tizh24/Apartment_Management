import React, { useState } from 'react';
import { Contract, ContractStatus } from '../types/contract.type';
import { ContractTimeline } from './contract-timeline';
import { ExpiryAlert } from './expiry-alert';
import { ChangeHistory } from './change-history';
import { 
    FileText, Landmark, User, Calendar, Coins, Users, ArrowLeft, 
    RefreshCw, StopCircle, Ban, HelpCircle, Save, CheckCircle
} from 'lucide-react';

interface ContractDetailProps {
    contract: Contract;
    onBack: () => void;
    onRenew: (id: string, newEndDate: string, newPrice: number, changedBy: string) => void;
    onTerminate: (id: string, changedBy: string) => void;
    onCancel: (id: string, changedBy: string) => void;
}

export function ContractDetail({
    contract,
    onBack,
    onRenew,
    onTerminate,
    onCancel
}: ContractDetailProps) {
    const [showRenewForm, setShowRenewForm] = useState(false);
    const [newEndDate, setNewEndDate] = useState('');
    const [newPrice, setNewPrice] = useState(contract.price);
    const [renewError, setRenewError] = useState('');

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

    const handleRenewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRenewError('');

        if (!newEndDate) {
            setRenewError('Vui lòng chọn ngày hết hạn mới.');
            return;
        }

        if (new Date(newEndDate) <= new Date(contract.endDate)) {
            setRenewError('Ngày kết thúc mới phải sau ngày hết hạn hiện tại.');
            return;
        }

        if (newPrice <= 0) {
            setRenewError('Mức giá thuê mới phải lớn hơn 0 ₫.');
            return;
        }

        onRenew(contract.id, newEndDate, newPrice, 'Admin');
        setShowRenewForm(false);
    };

    const getStatusBadge = (status: ContractStatus) => {
        const config = {
            active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            expired: 'bg-slate-50 text-slate-600 border-slate-200',
            terminated: 'bg-orange-50 text-orange-700 border-orange-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200'
        };
        const labels = { active: 'Đang hoạt động', expired: 'Hết hạn', terminated: 'Đã thanh lý', cancelled: 'Đã hủy' };
        return (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            
            {/* Expiry alerts */}
            <ExpiryAlert endDate={contract.endDate} status={contract.status} />

            {/* Back button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#fcd5ce]">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b463f] hover:text-[#ff385c] bg-white border border-[#fcd5ce] px-3 py-1.5 rounded-xl hover:shadow-sm transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>

                {contract.status === 'active' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowRenewForm(!showRenewForm)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Gia hạn HĐ
                        </button>
                        <button
                            onClick={() => {
                                if (confirm(`Bạn có thực sự muốn THANH LÝ (Checkout) sớm hợp đồng ${contract.id}? Cọc sẽ được bàn giao hoàn trả.`)) {
                                    onTerminate(contract.id, 'Admin');
                                }
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                        >
                            <StopCircle className="h-3.5 w-3.5" />
                            Thanh lý / Trả phòng
                        </button>
                        <button
                            onClick={() => {
                                if (confirm(`Bạn có thực sự muốn HỦY BỎ hợp đồng ${contract.id}? Hành động này sẽ đánh dấu Hủy trực tiếp trên hệ thống.`)) {
                                    onCancel(contract.id, 'Admin');
                                }
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                        >
                            <Ban className="h-3.5 w-3.5" />
                            Hủy hợp đồng
                        </button>
                    </div>
                )}
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left panel: Core metadata & timeline */}
                <div className="lg:col-span-1 space-y-6">
                    {/* General Specs */}
                    <div className="rounded-2xl border border-[#fcd5ce] bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-[#fcd5ce]/30 pb-3 mb-1">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#ff385c]" />
                                <h3 className="font-extrabold text-sm text-[#3f2d28]">{contract.id}</h3>
                            </div>
                            {getStatusBadge(contract.status)}
                        </div>

                        <div className="space-y-3.5 text-xs text-[#5b463f]">
                            <div className="flex items-center gap-2">
                                <Landmark className="h-4 w-4 text-[#caa79a]" />
                                <span>Phòng thuê: <strong className="text-[#3f2d28]">P.{contract.roomNumber} ({contract.buildingName})</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-[#caa79a]" />
                                <span>Khách thuê: <strong className="text-[#3f2d28]">{contract.customerName}</strong> ({contract.customerPhone})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#caa79a]" />
                                <span>Kỳ hạn: <strong>{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Coins className="h-4 w-4 text-[#caa79a]" />
                                <span>Giá thuê định kỳ: <strong className="text-[#ff385c]">{formatCurrency(contract.price)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Coins className="h-4 w-4 text-[#caa79a]" />
                                <span>Tiền đặt cọc: <strong className="text-[#ff385c]">{formatCurrency(contract.deposit)}</strong></span>
                            </div>
                            {contract.saleName && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-[#caa79a]" />
                                    <span>Môi giới: <strong>{contract.saleName}</strong></span>
                                </div>
                            )}
                        </div>

                        {contract.notes && (
                            <p className="text-[11px] text-[#8f6f64] bg-[#fff8f6] p-3 rounded-xl border border-[#fcd5ce]/30 italic leading-relaxed">
                                "* Ghi chú điều khoản: {contract.notes}"
                            </p>
                        )}
                    </div>

                    {/* Progress timeline */}
                    <ContractTimeline startDate={contract.startDate} endDate={contract.endDate} status={contract.status} />
                </div>

                {/* Right panel: Renew form or Audit Change logs */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Renew Form Panel */}
                    {showRenewForm && contract.status === 'active' && (
                        <form onSubmit={handleRenewSubmit} className="bg-[#fff8f6] p-5 rounded-2xl border border-[#fcd5ce] space-y-4 animate-in slide-in-from-top-3 duration-200">
                            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-2.5 mb-1">
                                <h3 className="text-xs font-bold text-[#3f2d28] uppercase tracking-wider flex items-center gap-1.5">
                                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                                    Gia hạn hợp đồng thuê phòng
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowRenewForm(false)}
                                    className="text-[#8f6f64] hover:text-[#ff385c]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {renewError && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                                    {renewError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#5b463f] mb-1.5 uppercase">Ngày hết hạn mới *</label>
                                    <input
                                        type="date"
                                        value={newEndDate}
                                        onChange={(e) => setNewEndDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#5b463f] mb-1.5 uppercase">Giá thuê mới hàng tháng (₫) *</label>
                                    <input
                                        type="number"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#fcd5ce]/30">
                                <button
                                    type="button"
                                    onClick={() => setShowRenewForm(false)}
                                    className="px-3.5 py-1.5 text-xs font-semibold text-[#5b463f] rounded-lg border border-[#fcd5ce]"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1 px-4.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    Xác nhận gia hạn
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Change logs audits */}
                    <div className="bg-white border border-[#fcd5ce] p-6 rounded-2xl shadow-sm">
                        <ChangeHistory history={contract.changeHistory} />
                    </div>

                </div>

            </div>

        </div>
    );
}

// Inline fake placeholder for X
function X({ className, ...props }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    );
}

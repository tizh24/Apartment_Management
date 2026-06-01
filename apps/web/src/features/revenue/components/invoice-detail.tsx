import React, { useState } from 'react';
import { Invoice, InvoiceStatus, InvoiceType } from '../types/revenue.type';
import { PaymentStatusBadge } from './payment-status';
import { PartialPayment } from './partial-payment';
import { 
    FileText, Landmark, User, Calendar, Coins, ArrowLeft, 
    CheckCircle, CreditCard, Ban, Trash2, History, AlertCircle 
} from 'lucide-react';

interface InvoiceDetailProps {
    invoice: Invoice;
    onBack: () => void;
    onAddPayment: (invoiceId: string, paymentData: any) => void;
    onConfirmReceipt: (invoiceId: string) => void;
    onCancelInvoice: (invoiceId: string) => void;
}

export function InvoiceDetail({
    invoice,
    onBack,
    onAddPayment,
    onConfirmReceipt,
    onCancelInvoice
}: InvoiceDetailProps) {
    const [showPayForm, setShowPayForm] = useState(false);

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

    const formatTime = (isoStr: string) => {
        return new Date(isoStr).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInvoiceTypeLabel = (type: InvoiceType) => {
        const labels = {
            room: 'Tiền phòng định kỳ',
            utility: 'Chỉ số Điện & Nước',
            service: 'Chi phí Dịch vụ phát sinh',
            other: 'Khoản thu khác'
        };
        return labels[type] || 'Khoản thu';
    };

    const getInvoiceTypeColor = (type: InvoiceType) => {
        const config = {
            room: 'text-[#ff385c] bg-[#fff8f6] border-[#fcd5ce]/40',
            utility: 'text-blue-700 bg-blue-50 border-blue-200',
            service: 'text-amber-700 bg-amber-50 border-amber-200',
            other: 'text-slate-700 bg-slate-50 border-slate-200'
        };
        return config[type] || config.other;
    };

    const getMethodLabel = (method: string) => {
        const labels = { transfer: 'Chuyển khoản', cash: 'Tiền mặt', qr: 'Quét mã QR' };
        return labels[method as keyof typeof labels] || 'Khác';
    };

    return (
        <div className="space-y-6">
            
            {/* Header / Actions row */}
            <div className="flex items-center justify-between pb-3 border-b border-[#fcd5ce]">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b463f] hover:text-[#ff385c] bg-white border border-[#fcd5ce] px-3 py-1.5 rounded-xl hover:shadow-sm transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>

                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPayForm(!showPayForm)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                        >
                            <CreditCard className="h-3.5 w-3.5" />
                            Ghi nhận thanh toán
                        </button>
                        <button
                            onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xác nhận đối soát ĐẦY ĐỦ số tiền ${formatCurrency(invoice.unpaidAmount)} cho hóa đơn này?`)) {
                                    onConfirmReceipt(invoice.id);
                                }
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                        >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Đối soát toàn bộ (Paid)
                        </button>
                        <button
                            onClick={() => {
                                if (confirm(`Bạn có chắc muốn hủy bỏ hóa đơn ${invoice.invoiceNumber}?`)) {
                                    onCancelInvoice(invoice.id);
                                }
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                        >
                            <Ban className="h-3.5 w-3.5" />
                            Hủy hóa đơn
                        </button>
                    </div>
                )}
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left panel: Detailed Receipt Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-2xl border border-[#fcd5ce] bg-white p-6 shadow-md relative overflow-hidden space-y-5 flex flex-col justify-between">
                        
                        {/* Printable Receipt styling */}
                        <div className="space-y-4">
                            <div className="text-center pb-4 border-b border-dashed border-[#fcd5ce] space-y-1">
                                <p className="text-[10px] font-bold text-[#caa79a] uppercase tracking-widest">Biên lai thanh toán</p>
                                <h3 className="text-lg font-black text-[#3f2d28]">{invoice.invoiceNumber}</h3>
                                <div className="pt-2 flex justify-center">
                                    <PaymentStatusBadge status={invoice.status} />
                                </div>
                            </div>

                            <div className="space-y-3.5 text-xs text-[#5b463f]">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#8f6f64]">Loại khoản thu:</span>
                                    <span className={`inline-flex rounded-lg px-2 py-0.5 border text-[10px] font-bold uppercase ${getInvoiceTypeColor(invoice.type)}`}>
                                        {getInvoiceTypeLabel(invoice.type)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8f6f64]">Căn hộ:</span>
                                    <span className="font-bold text-[#3f2d28]">P.{invoice.roomNumber} ({invoice.buildingName})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8f6f64]">Khách hàng:</span>
                                    <span className="font-bold text-[#3f2d28]">{invoice.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8f6f64]">Ngày phát hành:</span>
                                    <span>{formatDate(invoice.issueDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8f6f64] font-semibold">Hạn thanh toán:</span>
                                    <span className="font-semibold text-red-600">{formatDate(invoice.dueDate)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Amount Totals */}
                        <div className="bg-[#fff8f6] border border-[#fcd5ce]/30 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between text-xs text-[#8f6f64]">
                                <span>Tổng số tiền:</span>
                                <span className="font-semibold text-[#3f2d28]">{formatCurrency(invoice.amount)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-emerald-700">
                                <span>Đã thanh toán:</span>
                                <span className="font-semibold">{formatCurrency(invoice.paidAmount)}</span>
                            </div>
                            <div className="border-t border-[#fcd5ce]/30 pt-2 flex justify-between text-sm font-extrabold text-[#ff385c]">
                                <span>Còn nợ:</span>
                                <span>{formatCurrency(invoice.unpaidAmount)}</span>
                            </div>
                        </div>

                        {invoice.notes && (
                            <p className="text-[10px] text-[#caa79a] italic leading-relaxed pt-2 border-t border-dashed border-[#fcd5ce]/30">
                                "* Ghi chú nội bộ: {invoice.notes}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Right panel: Payments log & forms */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Partial payment form */}
                    {showPayForm && (
                        <PartialPayment
                            invoiceId={invoice.id}
                            unpaidAmount={invoice.unpaidAmount}
                            onSubmit={(payData) => {
                                onAddPayment(invoice.id, payData);
                                setShowPayForm(false);
                            }}
                            onCancel={() => setShowPayForm(false)}
                        />
                    )}

                    {/* Historical Transactions stack */}
                    <div className="bg-white border border-[#fcd5ce] p-6 rounded-2xl shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-[#3f2d28] uppercase tracking-wider flex items-center gap-1.5">
                            <History className="h-4 w-4 text-[#ff385c]" />
                            Lịch sử các đợt đóng tiền
                        </h4>

                        {invoice.payments.length === 0 ? (
                            <div className="text-center py-6 text-xs text-[#caa79a] italic border border-dashed border-[#fcd5ce]/40 rounded-xl">
                                Chưa có giao dịch đóng tiền nào được ghi nhận cho hóa đơn này.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invoice.payments.map((p, idx) => (
                                    <div
                                        key={p.id || idx}
                                        className="rounded-xl border border-[#fcd5ce]/40 bg-[#fff8f6]/50 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs text-[#5b463f]"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-extrabold text-sm text-emerald-700">
                                                +{formatCurrency(p.amount)}
                                            </p>
                                            <div className="flex gap-x-3 text-[10px] text-[#caa79a] flex-wrap">
                                                <span>Ngày: {formatDate(p.paymentDate)} ({formatTime(p.paymentDate)})</span>
                                                <span>Hình thức: {getMethodLabel(p.paymentMethod)}</span>
                                            </div>
                                            {p.note && (
                                                <p className="text-[10px] italic text-[#8f6f64] mt-1">
                                                    "Ghi chú: {p.note}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="shrink-0 flex items-center bg-white px-2.5 py-1 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold w-fit">
                                            ✔ Giao dịch thành công
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>

        </div>
    );
}

import React, { useState } from 'react';
import { Customer, CustomerStatus, CustomerDocument } from '../types/customer.type';
import { CustomerStatusBadge } from './customer-status';
import { DocumentViewer } from './document-viewer';
import { DocumentUpload } from './document-upload';
import { 
    User, Phone, Mail, Calendar, Flag, Landmark, Coins, 
    ShieldAlert, Plus, ShieldCheck, ArrowLeft, Edit, Trash2, FileCheck 
} from 'lucide-react';

interface CustomerDetailProps {
    customer: Customer;
    onBack: () => void;
    onEdit: () => void;
    onDelete: (id: string) => void;
    onAddDocument: (customerId: string, docData: any) => void;
    onDeleteDocument: (customerId: string, docId: string) => void;
}

export function CustomerDetail({
    customer,
    onBack,
    onEdit,
    onDelete,
    onAddDocument,
    onDeleteDocument
}: CustomerDetailProps) {
    const [activeTab, setActiveTab] = useState<'documents' | 'contracts'>('documents');
    const [showUploadForm, setShowUploadForm] = useState(false);

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

    return (
        <div className="space-y-6">
            {/* Header / Back row */}
            <div className="flex items-center justify-between pb-3 border-b border-[#fcd5ce]">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b463f] hover:text-[#ff385c] bg-white border border-[#fcd5ce] px-3 py-1.5 rounded-xl hover:shadow-sm transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onEdit}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#5b463f] hover:text-[#ff385c] bg-white border border-[#fcd5ce] px-3 py-1.5 rounded-xl hover:shadow-sm transition-all"
                    >
                        <Edit className="h-3.5 w-3.5" />
                        Sửa hồ sơ
                    </button>
                    <button
                        onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ khách hàng ${customer.name}?`)) {
                                onDelete(customer.id);
                            }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa hồ sơ
                    </button>
                </div>
            </div>

            {/* Profile Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Panel: Basic Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-2xl border border-[#fcd5ce] bg-white p-5 shadow-sm space-y-5">
                        
                        {/* Profile Header */}
                        <div className="text-center pb-4 border-b border-[#fcd5ce]/30">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb5a7] to-[#ff385c] text-white font-black text-xl mb-3 shadow-md">
                                {customer.name.charAt(0)}
                            </div>
                            <h2 className="text-base font-bold text-[#3f2d28]">{customer.name}</h2>
                            <p className="text-xs text-[#8f6f64] mt-0.5">Quốc tịch: {customer.nationality}</p>
                            <div className="mt-2.5">
                                <CustomerStatusBadge status={customer.status} />
                            </div>
                        </div>

                        {/* Profile Parameters */}
                        <div className="space-y-3.5 text-xs text-[#5b463f]">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="h-4 w-4 text-[#caa79a]" />
                                <span>Ngày sinh: <strong>{formatDate(customer.dob)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Phone className="h-4 w-4 text-[#caa79a]" />
                                <span>Điện thoại: <strong>{customer.phone}</strong></span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Mail className="h-4 w-4 text-[#caa79a]" />
                                <span>Email: <strong className="text-[#3f2d28] truncate max-w-[180px] inline-block align-bottom">{customer.email}</strong></span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Flag className="h-4 w-4 text-[#caa79a]" />
                                <span>Nguồn gốc: <strong>{customer.nationality}</strong></span>
                            </div>
                        </div>

                        {/* Active Lease Info (If any) */}
                        {customer.status === 'active' && customer.currentRoomNumber && (
                            <div className="rounded-xl bg-[#fff8f6] p-3 border border-[#fcd5ce]/30 text-xs text-[#5b463f] space-y-2">
                                <div className="flex items-center gap-1.5 text-[#ff385c] font-bold uppercase tracking-wider text-[10px]">
                                    <Landmark className="h-4 w-4" />
                                    <span>Căn hộ đang thuê</span>
                                </div>
                                <p className="text-[#3f2d28] font-bold text-sm">
                                    Phòng P.{customer.currentRoomNumber}
                                </p>
                                <p className="text-[10px] text-[#8f6f64]">
                                    Tòa nhà: {customer.currentBuilding}
                                </p>
                            </div>
                        )}

                        {/* Debts / Unpaid Balance */}
                        <div className={`rounded-xl p-3 border text-xs space-y-1.5 ${
                            customer.totalUnpaid > 0
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                                {customer.totalUnpaid > 0 ? <ShieldAlert className="h-4 w-4 animate-bounce" /> : <ShieldCheck className="h-4 w-4" />}
                                <span>Dư nợ công nợ</span>
                            </div>
                            <p className="font-extrabold text-sm">
                                {formatCurrency(customer.totalUnpaid)}
                            </p>
                            <p className="text-[10px] opacity-80">
                                {customer.totalUnpaid > 0
                                    ? '* Khách hàng có khoản thanh toán quá hạn chưa trả!'
                                    : 'Hồ sơ tài chính hoàn toàn sạch sẽ.'}
                            </p>
                        </div>

                    </div>
                </div>

                {/* Right Panel: Tabs, Documents, Contract History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-[#fcd5ce] bg-[#fff8f6] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                activeTab === 'documents'
                                    ? 'bg-white text-[#ff385c] shadow-sm'
                                    : 'text-[#8f6f64] hover:text-[#5b463f]'
                            }`}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Hồ sơ tài liệu ({customer.documents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('contracts')}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                activeTab === 'contracts'
                                    ? 'bg-white text-[#ff385c] shadow-sm'
                                    : 'text-[#8f6f64] hover:text-[#5b463f]'
                            }`}
                        >
                            <FileCheck className="h-4 w-4" />
                            Lịch sử Hợp đồng ({customer.contractHistory.length})
                        </button>
                    </div>

                    {/* Tab Panels */}
                    <div className="p-1">
                        
                        {/* TAB: DOCUMENTS */}
                        {activeTab === 'documents' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-[#fcd5ce]/40 pb-2">
                                    <div>
                                        <h3 className="font-bold text-[#3f2d28] text-sm">Hồ sơ & Giấy tờ tùy thân</h3>
                                        <p className="text-[10px] text-[#b89184]">Quản lý CCCD, hộ chiếu, visa phục vụ chốt hợp đồng và khai báo tạm trú.</p>
                                    </div>
                                    {!showUploadForm && (
                                        <button
                                            onClick={() => setShowUploadForm(true)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-xl transition-all cursor-pointer shadow-sm"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Đính kèm tài liệu
                                        </button>
                                    )}
                                </div>

                                {showUploadForm && (
                                    <DocumentUpload
                                        onSubmit={(docData) => {
                                            onAddDocument(customer.id, docData);
                                            setShowUploadForm(false);
                                        }}
                                        onCancel={() => setShowUploadForm(false)}
                                    />
                                )}

                                <DocumentViewer
                                    documents={customer.documents}
                                    onDelete={(docId) => onDeleteDocument(customer.id, docId)}
                                />
                            </div>
                        )}

                        {/* TAB: CONTRACT HISTORY */}
                        {activeTab === 'contracts' && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-[#3f2d28] text-sm">Lịch sử Hợp đồng của khách hàng</h3>
                                    <p className="text-[10px] text-[#b89184]">Theo dõi danh sách các hợp đồng thuê nhà cũ hoặc đang hoạt động.</p>
                                </div>

                                {customer.contractHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center bg-white rounded-2xl border border-[#fcd5ce] p-6">
                                        <FileCheck className="h-8 w-8 text-[#caa79a] mb-2" />
                                        <p className="text-sm font-medium text-[#5b463f]">Chưa có lịch sử hợp đồng</p>
                                        <p className="text-xs text-[#b89184] mt-1 max-w-xs">
                                            Khách hàng này chưa từng ký kết hợp đồng thuê phòng nào.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-[#fcd5ce] bg-white overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-left text-xs">
                                                <thead className="bg-[#fff8f6] text-[#5b463f] border-b border-[#fcd5ce] font-bold text-[10px] uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3">Mã HĐ</th>
                                                        <th className="px-4 py-3">Căn hộ</th>
                                                        <th className="px-4 py-3">Giá thuê</th>
                                                        <th className="px-4 py-3">Thời hạn thuê</th>
                                                        <th className="px-4 py-3">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#fcd5ce]/30 text-[#3f2d28]">
                                                    {customer.contractHistory.map((c) => (
                                                        <tr key={c.id} className="hover:bg-[#fff8f6]/30">
                                                            <td className="px-4 py-3 font-semibold text-[#ff385c]">{c.id}</td>
                                                            <td className="px-4 py-3 font-medium">P.{c.roomNumber} ({c.buildingName})</td>
                                                            <td className="px-4 py-3 font-semibold">{formatCurrency(c.price)}</td>
                                                            <td className="px-4 py-3">{formatDate(c.startDate)} - {formatDate(c.endDate)}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                                                    c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    c.status === 'expired' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                                                    'bg-red-50 text-red-700 border-red-200'
                                                                }`}>
                                                                    {c.status === 'active' && 'Đang hoạt động'}
                                                                    {c.status === 'expired' && 'Đã hết hạn'}
                                                                    {c.status === 'cancelled' && 'Đã hủy'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

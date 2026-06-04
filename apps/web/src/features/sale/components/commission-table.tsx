import React, { useState } from 'react';
import { Commission, CommissionStatus } from '../types/sale.type';
import { Coins, CheckCircle, Clock, Check, Building, FileText, User } from 'lucide-react';

interface CommissionTableProps {
    commissions: Commission[];
    onPayCommissions: (commissionIds: string[]) => void;
    showAgentColumn?: boolean;
}

export function CommissionTable({
    commissions,
    onPayCommissions,
    showAgentColumn = true
}: CommissionTableProps) {
    const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Filtered commissions list
    const filteredComms = commissions.filter((c) => {
        if (statusFilter === 'all') return true;
        return c.status === statusFilter;
    });

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

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Select only unpaid commissions
            const unpaidIds = filteredComms.filter(c => c.status === 'unpaid').map(c => c.id);
            setSelectedIds(unpaidIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id) 
                : [...prev, id]
        );
    };

    // Selected amount summation
    const selectedAmount = commissions
        .filter(c => selectedIds.includes(c.id))
        .reduce((sum, c) => sum + c.amount, 0);

    const handleBulkPay = () => {
        if (selectedIds.length === 0) return;
        onPayCommissions(selectedIds);
        setSelectedIds([]);
    };

    return (
        <div className="space-y-4">
            
            {/* Header / Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fff8f6] border border-[#fcd5ce] p-3 rounded-2xl">
                
                {/* Tabs */}
                <div className="flex bg-white border border-[#fcd5ce] p-1 rounded-xl shadow-inner shrink-0">
                    <button
                        onClick={() => { setStatusFilter('all'); setSelectedIds([]); }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            statusFilter === 'all'
                                ? 'bg-[#ff385c] text-white shadow-sm'
                                : 'text-[#8f6f64] hover:bg-[#fff8f6]'
                        }`}
                    >
                        Tất cả phát sinh
                    </button>
                    <button
                        onClick={() => { setStatusFilter('unpaid'); setSelectedIds([]); }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            statusFilter === 'unpaid'
                                ? 'bg-[#ff385c] text-white shadow-sm'
                                : 'text-[#8f6f64] hover:bg-[#fff8f6]'
                        }`}
                    >
                        Chưa thanh toán
                    </button>
                    <button
                        onClick={() => { setStatusFilter('paid'); setSelectedIds([]); }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            statusFilter === 'paid'
                                ? 'bg-[#ff385c] text-white shadow-sm'
                                : 'text-[#8f6f64] hover:bg-[#fff8f6]'
                        }`}
                    >
                        Đã quyết toán
                    </button>
                </div>

                {/* Bulk pay CTA */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 animate-in slide-in-from-right duration-200">
                        <p className="text-xs text-[#5b463f]">
                            Đang chọn: <strong className="text-red-500 font-extrabold">{selectedIds.length}</strong> khoản hoa hồng (
                            <strong className="text-[#3f2d28] font-bold">{formatCurrency(selectedAmount)}</strong>)
                        </p>
                        <button
                            onClick={handleBulkPay}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                            <Coins className="h-3.5 w-3.5" />
                            Thanh toán hàng loạt
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            {filteredComms.length === 0 ? (
                <div className="text-center py-10 bg-white border border-[#fcd5ce]/40 rounded-2xl">
                    <Coins className="h-8 w-8 text-[#caa79a] mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#3f2d28]">Không tìm thấy bản ghi hoa hồng nào</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Không có dữ liệu phát sinh trong bộ lọc hiện tại.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-[#fcd5ce]/50 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead className="bg-[#fff8f6] text-[#5b463f] border-b border-[#fcd5ce] font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-4 py-3 w-10 text-center">
                                        {statusFilter !== 'paid' && (
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={
                                                    filteredComms.filter(c => c.status === 'unpaid').length > 0 &&
                                                    filteredComms.filter(c => c.status === 'unpaid').every(c => selectedIds.includes(c.id))
                                                }
                                                className="h-3.5 w-3.5 rounded border-[#fcd5ce] text-[#ff385c] focus:ring-[#ff385c]"
                                            />
                                        )}
                                    </th>
                                    <th className="px-4 py-3">Mã Hợp Đồng</th>
                                    {showAgentColumn && <th className="px-4 py-3">Cộng Tác Viên</th>
                                    }
                                    <th className="px-4 py-3">Căn Hộ & Phòng</th>
                                    <th className="px-4 py-3">Khách Thuê</th>
                                    <th className="px-4 py-3">Giá Thuê</th>
                                    <th className="px-4 py-3">Tỷ Lệ</th>
                                    <th className="px-4 py-3">Hoa Hồng Nhận</th>
                                    <th className="px-4 py-3">Trạng Thái</th>
                                    <th className="px-4 py-3">Ngày Chi Trả</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#fcd5ce]/30 text-[#3f2d28]">
                                {filteredComms.map((comm) => (
                                    <tr
                                        key={comm.id}
                                        className={`hover:bg-[#fff8f6]/30 transition-colors ${
                                            selectedIds.includes(comm.id) ? 'bg-[#fff8f6]/40' : ''
                                        }`}
                                    >
                                        <td className="px-4 py-3 text-center">
                                            {comm.status === 'unpaid' && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(comm.id)}
                                                    onChange={() => handleSelectRow(comm.id)}
                                                    className="h-3.5 w-3.5 rounded border-[#fcd5ce] text-[#ff385c] focus:ring-[#ff385c]"
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 font-bold text-[#ff385c]">
                                                <FileText className="h-3.5 w-3.5 text-[#caa79a]" />
                                                <span>{comm.contractNumber}</span>
                                            </div>
                                        </td>
                                        {showAgentColumn && (
                                            <td className="px-4 py-3 font-semibold text-[#5b463f]">
                                                {comm.saleId === 'sale-1' ? 'Nguyễn Văn Mỹ' : comm.saleId === 'sale-2' ? 'Lê Thị Thu' : 'CTV Khác'}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 space-y-0.5">
                                            <div className="flex items-center gap-1 font-bold text-[#3f2d28]">
                                                <Building className="h-3.5 w-3.5 text-[#caa79a]" />
                                                <span>P.{comm.roomNumber}</span>
                                            </div>
                                            <div className="text-[10px] text-[#caa79a]">{comm.buildingName}</div>
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-1 text-[#5b463f]">
                                                <User className="h-3 w-3 text-[#caa79a]" />
                                                <span>{comm.customerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-600">
                                            {formatCurrency(comm.rentAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-center sm:text-left">
                                            <span className="bg-[#fff8f6] border border-[#fcd5ce] px-1.5 py-0.5 rounded text-[10px] text-[#5b463f] font-bold">
                                                {comm.commissionRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-[#3f2d28]">
                                            {formatCurrency(comm.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase border ${
                                                comm.status === 'paid'
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                    : 'bg-rose-50 border-rose-200 text-rose-700'
                                            }`}>
                                                {comm.status === 'paid' ? 'Đã quyết toán' : 'Chưa quyết toán'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[#caa79a]">
                                            {comm.paymentDate ? (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                                    <span>{formatDate(comm.paymentDate)}</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-500">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Chờ chuyển</span>
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

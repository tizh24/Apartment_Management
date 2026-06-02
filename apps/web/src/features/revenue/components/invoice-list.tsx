import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRevenueStore } from '../store/revenue-store';
import { Invoice, InvoiceStatus, InvoiceType } from '../types/revenue.type';
import { PaymentStatusBadge } from './payment-status';
import { 
    Plus, Search, Coins, CheckCircle2, Clock, 
    AlertCircle, AlertTriangle, Filter, X, Grid, List, Building, Calendar, User, Layers
} from 'lucide-react';

export function InvoiceList() {
    const router = useRouter();
    const {
        invoices,
        searchQuery,
        statusFilter,
        typeFilter,
        setSearchQuery,
        setStatusFilter,
        setTypeFilter
    } = useRevenueStore();

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Compute Summary Stats
    const totalIssued = invoices.reduce((sum, inv) => sum + (inv.status !== 'cancelled' ? inv.amount : 0), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.unpaidAmount, 0);
    
    const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;
    const pendingConfirmationCount = invoices.filter((inv) => inv.status === 'unpaid' && inv.payments.length > 0).length;

    // Search and Filters
    const filteredInvoices = invoices.filter((inv) => {
        const matchesSearch = 
            inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.buildingName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        const matchesType = typeFilter === 'all' || inv.type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
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

    const getInvoiceTypeLabel = (type: InvoiceType) => {
        const labels = {
            room: 'Tiền phòng',
            utility: 'Điện & Nước',
            service: 'Dịch vụ',
            other: 'Khác'
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

    return (
        <div className="space-y-6">
            
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Doanh thu đã xuất */}
                <div className="rounded-2xl border border-[#fcd5ce] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Doanh thu đã xuất</span>
                    <p className="text-xl font-black text-[#3f2d28]">{formatCurrency(totalIssued)}</p>
                </div>

                {/* Đã thu */}
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Đã thu (Paid)</span>
                    <p className="text-xl font-black text-emerald-700">{formatCurrency(totalPaid)}</p>
                </div>

                {/* Tổng công nợ nợ */}
                <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Còn nợ (Outstanding)</span>
                    <p className="text-xl font-black text-red-600">{formatCurrency(totalOutstanding)}</p>
                </div>

                {/* Quá hạn */}
                <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Phiếu quá hạn</span>
                    <p className="text-2xl font-black text-rose-700">{overdueCount}</p>
                </div>

                {/* Chờ đối soát */}
                <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Chờ đối soát</span>
                    <p className="text-2xl font-black text-amber-700">{pendingConfirmationCount}</p>
                </div>

            </div>

            {/* Filter Toolbar (Google Drive style: flat, borderless) */}
            <div className="py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start">
                    
                    {/* Loại filter */}
                    <div className="flex items-center gap-1 bg-white border border-[#fcd5ce] rounded-xl px-3 py-1.5 text-xs text-[#3f2d28] font-medium shadow-sm">
                        <Filter className="h-3.5 w-3.5 text-[#ff385c]" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-transparent border-none outline-none text-[#3f2d28] cursor-pointer"
                        >
                            <option value="all">Tất cả loại thu</option>
                            <option value="room">Tiền phòng</option>
                            <option value="utility">Điện & Nước</option>
                            <option value="service">Dịch vụ phát sinh</option>
                            <option value="other">Khoản khác</option>
                        </select>
                    </div>

                    {/* Trạng thái filter */}
                    <div className="flex items-center gap-1 bg-white border border-[#fcd5ce] rounded-xl px-3 py-1.5 text-xs text-[#3f2d28] font-medium shadow-sm">
                        <Filter className="h-3.5 w-3.5 text-[#ff385c]" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none outline-none text-[#3f2d28] cursor-pointer"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="unpaid">Chưa thanh toán</option>
                            <option value="partial">Thanh toán một phần</option>
                            <option value="overdue">Quá hạn</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                </div>

                {/* Search Bar & Switcher Toggle */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    
                    {/* Search Input */}
                    <div className="relative w-full md:w-80 flex items-center bg-[#fff8f6] border border-[#fcd5ce]/40 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                        <Search className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Số hóa đơn, phòng, tên khách..."
                            className="w-full bg-transparent text-xs text-[#3f2d28] placeholder-[#b89184] outline-none"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-[#caa79a] hover:text-[#ff385c]">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* View switcher */}
                    <div className="flex items-center border border-[#fcd5ce] rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 transition-colors cursor-pointer ${
                                viewMode === 'grid' ? 'bg-[#ff385c] text-white' : 'text-[#8f6f64] hover:bg-[#fff8f6]'
                            }`}
                            title="Hiển thị dạng thẻ"
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 transition-colors cursor-pointer ${
                                viewMode === 'list' ? 'bg-[#ff385c] text-white' : 'text-[#8f6f64] hover:bg-[#fff8f6]'
                            }`}
                            title="Hiển thị dạng bảng"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>

                </div>

            </div>

            {/* Main Content */}
            {filteredInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-none p-6">
                    <Coins className="h-14 w-14 text-[#caa79a] mb-3" />
                    <p className="text-base font-bold text-[#3f2d28]">Không tìm thấy hóa đơn nào</p>
                    <p className="text-xs text-[#8f6f64] max-w-sm mt-1 mb-4">
                        Thử điều chỉnh lại cụm từ tìm kiếm hoặc cấu hình bộ lọc trạng thái.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                            setTypeFilter('all');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-[#ff385c] bg-[#fff8f6] border border-[#fcd5ce] rounded-xl hover:bg-[#fcd5ce]/30 transition-all cursor-pointer"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            ) : viewMode === 'list' ? (
                /* Table list view (Google Drive style) */
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead className="text-[#8f6f64] border-b border-[#fcd5ce] font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Mã hóa đơn</th>
                                <th className="px-6 py-4">Loại thu</th>
                                <th className="px-6 py-4">Phòng</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Ngày hết hạn</th>
                                <th className="px-6 py-4">Tổng tiền</th>
                                <th className="px-6 py-4">Đã thu</th>
                                <th className="px-6 py-4">Còn nợ</th>
                                <th className="px-6 py-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="text-[#3f2d28]">
                            {filteredInvoices.map((inv) => (
                                <tr
                                    key={inv.id}
                                    onClick={() => router.push('/admin/revenue/' + inv.id)}
                                    className="hover:bg-[#fff8f6]/70 border-b border-[#fcd5ce]/30 cursor-pointer transition-all duration-200"
                                >
                                    <td className="px-6 py-4 font-bold text-sm text-[#ff385c]">{inv.invoiceNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-lg px-2 py-0.5 border text-[10px] font-bold uppercase ${getInvoiceTypeColor(inv.type)}`}>
                                            {getInvoiceTypeLabel(inv.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold">P.{inv.roomNumber} <span className="text-[10px] font-normal text-[#8f6f64]">({inv.buildingName})</span></td>
                                    <td className="px-6 py-4 font-medium">{inv.customerName}</td>
                                    <td className="px-6 py-4 font-medium text-red-600">{formatDate(inv.dueDate)}</td>
                                    <td className="px-6 py-4 font-bold">{formatCurrency(inv.amount)}</td>
                                    <td className="px-6 py-4 text-emerald-700 font-semibold">{formatCurrency(inv.paidAmount)}</td>
                                    <td className="px-6 py-4 text-red-600 font-extrabold">{formatCurrency(inv.unpaidAmount)}</td>
                                    <td className="px-6 py-4">
                                        <PaymentStatusBadge status={inv.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Grid view cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredInvoices.map((inv) => (
                        <div
                            key={inv.id}
                            onClick={() => router.push('/admin/revenue/' + inv.id)}
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#fcd5ce] bg-white p-5 shadow-sm hover:shadow-lg transition-all hover:border-[#ffb5a7] duration-300 cursor-pointer"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#fcd5ce]/20">
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-4.5 w-4.5 text-[#ff385c]" />
                                        <h3 className="text-sm font-bold text-[#3f2d28] group-hover:text-[#ff385c] transition-colors">{inv.invoiceNumber}</h3>
                                    </div>
                                    <span className={`inline-flex rounded-lg px-2 py-0.5 border text-[10px] font-bold uppercase ${getInvoiceTypeColor(inv.type)}`}>
                                        {getInvoiceTypeLabel(inv.type)}
                                    </span>
                                </div>

                                <div className="space-y-2 text-[11px] text-[#8f6f64]">
                                    <div className="flex items-center gap-1.5 text-[#3f2d28] font-bold">
                                        <Layers className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>Phòng: P.{inv.roomNumber} ({inv.buildingName})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>Khách: <strong className="text-[#5b463f]">{inv.customerName}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>Hạn nộp: <strong className="text-red-500">{formatDate(inv.dueDate)}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#fcd5ce]/20 flex items-center justify-between">
                                <div className="text-[11px] font-semibold">
                                    <p className="text-[#caa79a]">Tổng: {formatCurrency(inv.amount)}</p>
                                    <p className="text-red-600 font-extrabold">Còn nợ: {formatCurrency(inv.unpaidAmount)}</p>
                                </div>
                                <div className="shrink-0 pt-1">
                                    <PaymentStatusBadge status={inv.status} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

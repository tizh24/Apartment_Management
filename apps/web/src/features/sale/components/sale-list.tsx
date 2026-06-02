import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaleStore } from '../store/sale-store';
import { Sale, SaleStatus } from '../types/sale.type';
import { 
    Users, Search, Coins, CheckCircle2, Clock, 
    Filter, X, Grid, List, Phone, Mail, Calendar, Sparkles 
} from 'lucide-react';

export function SaleList() {
    const router = useRouter();
    const {
        sales,
        searchQuery,
        statusFilter,
        setSearchQuery,
        setStatusFilter
    } = useSaleStore();

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Compute Summary Stats
    const totalAgents = sales.length;
    const activeAgents = sales.filter((s) => s.status === 'active').length;
    const totalComm = sales.reduce((sum, s) => sum + s.totalCommission, 0);
    const totalPaidComm = sales.reduce((sum, s) => sum + s.paidCommission, 0);
    const totalUnpaidComm = sales.reduce((sum, s) => sum + s.unpaidCommission, 0);

    // Search and Filters
    const filteredSales = sales.filter((s) => {
        const matchesSearch = 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.phone.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        
        return matchesSearch && matchesStatus;
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

    return (
        <div className="space-y-6">
            
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Tổng số Agent */}
                <div className="rounded-2xl border border-[#fcd5ce] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Tổng cộng CTV</span>
                    <p className="text-xl font-black text-[#3f2d28]">{totalAgents}</p>
                </div>

                {/* Hoạt động */}
                <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Đang hoạt động</span>
                    <p className="text-xl font-black text-blue-700">{activeAgents}</p>
                </div>

                {/* Tổng hoa hồng phát sinh */}
                <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Tổng hoa hồng</span>
                    <p className="text-xl font-black text-amber-700">{formatCurrency(totalComm)}</p>
                </div>

                {/* Đã chi trả */}
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Đã quyết toán</span>
                    <p className="text-xl font-black text-emerald-700">{formatCurrency(totalPaidComm)}</p>
                </div>

                {/* Còn nợ hoa hồng */}
                <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Còn nợ (Unpaid)</span>
                    <p className="text-xl font-black text-red-600">{formatCurrency(totalUnpaidComm)}</p>
                </div>

            </div>

            {/* Filter Toolbar (Google Drive style: flat, borderless) */}
            <div className="py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start">
                    
                    {/* Trạng thái filter */}
                    <div className="flex items-center gap-1 bg-white border border-[#fcd5ce] rounded-xl px-3 py-1.5 text-xs text-[#3f2d28] font-medium shadow-sm">
                        <Filter className="h-3.5 w-3.5 text-[#ff385c]" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none outline-none text-[#3f2d28] cursor-pointer"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Ngừng kích hoạt</option>
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
                            placeholder="Tìm tên, email, sđt CTV..."
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
            {filteredSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-none p-6">
                    <Users className="h-14 w-14 text-[#caa79a] mb-3" />
                    <p className="text-base font-bold text-[#3f2d28]">Không tìm thấy CTV nào</p>
                    <p className="text-xs text-[#8f6f64] max-w-sm mt-1 mb-4">
                        Thử điều chỉnh lại cụm từ tìm kiếm hoặc cấu hình bộ lọc trạng thái.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-[#ff385c] bg-[#fff8f6] border border-[#fcd5ce] rounded-xl hover:bg-[#fcd5ce]/30 transition-all cursor-pointer"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            ) : viewMode === 'list' ? (
                /* Table view (Google Drive style) */
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead className="text-[#8f6f64] border-b border-[#fcd5ce] font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Tên cộng tác viên</th>
                                <th className="px-6 py-4">Liên hệ</th>
                                <th className="px-6 py-4">Ngày tham gia</th>
                                <th className="px-6 py-4">Hợp đồng mang về</th>
                                <th className="px-6 py-4">Tổng hoa hồng</th>
                                <th className="px-6 py-4">Đã quyết toán</th>
                                <th className="px-6 py-4">Chưa quyết toán</th>
                                <th className="px-6 py-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="text-[#3f2d28]">
                            {filteredSales.map((sale) => (
                                <tr
                                    key={sale.id}
                                    onClick={() => router.push('/admin/sales/' + sale.id)}
                                    className="hover:bg-[#fff8f6]/70 border-b border-[#fcd5ce]/30 cursor-pointer transition-all duration-200"
                                >
                                    <td className="px-6 py-4 font-bold text-sm text-[#ff385c] hover:underline">
                                        {sale.name}
                                    </td>
                                    <td className="px-6 py-4 space-y-0.5">
                                        <div className="flex items-center gap-1 text-[#5b463f] font-medium">
                                            <Phone className="h-3 w-3 text-[#caa79a]" />
                                            <span>{sale.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[#caa79a] text-[10px]">
                                            <Mail className="h-3 w-3 text-[#caa79a]" />
                                            <span>{sale.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[#caa79a]">
                                        {formatDate(sale.joinedDate)}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-center sm:text-left pl-10">
                                        <span className="bg-[#fff8f6] border border-[#fcd5ce] px-2 py-0.5 rounded-lg text-xs text-[#3f2d28] font-bold">
                                            {sale.totalContracts}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold">{formatCurrency(sale.totalCommission)}</td>
                                    <td className="px-6 py-4 text-emerald-700 font-semibold">{formatCurrency(sale.paidCommission)}</td>
                                    <td className="px-6 py-4 text-red-600 font-extrabold">{formatCurrency(sale.unpaidCommission)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                                            sale.status === 'active' 
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                                : 'bg-slate-50 border-slate-200 text-slate-500'
                                        }`}>
                                            {sale.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Grid view cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredSales.map((sale) => (
                        <div
                            key={sale.id}
                            onClick={() => router.push('/admin/sales/' + sale.id)}
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#fcd5ce] bg-white p-5 shadow-sm hover:shadow-lg transition-all hover:border-[#ffb5a7] duration-300 cursor-pointer"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#fcd5ce]/20">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4.5 w-4.5 text-[#ff385c]" />
                                        <h3 className="text-sm font-bold text-[#3f2d28] group-hover:text-[#ff385c] transition-colors">{sale.name}</h3>
                                    </div>
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase border ${
                                        sale.status === 'active' 
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                            : 'bg-slate-50 border-slate-200 text-slate-500'
                                    }`}>
                                        {sale.status === 'active' ? 'Hoạt động' : 'Khóa'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-[11px] text-[#8f6f64]">
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>{sale.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span className="truncate">{sale.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>CTV từ: {formatDate(sale.joinedDate)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#fcd5ce]/20 flex items-center justify-between">
                                <div className="text-[11px] font-semibold">
                                    <p className="text-slate-500">Mã CTV: {sale.id}</p>
                                    <p className="text-[#3f2d28]">HĐ mang về: <strong>{sale.totalContracts}</strong></p>
                                </div>
                                <div className="text-right text-[11px]">
                                    <p className="text-[#caa79a]">Tổng HH: {formatCurrency(sale.totalCommission)}</p>
                                    <p className="text-red-600 font-extrabold">Còn nợ: {formatCurrency(sale.unpaidCommission)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

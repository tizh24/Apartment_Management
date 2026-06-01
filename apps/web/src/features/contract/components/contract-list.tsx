import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContractStore } from '../store/contract-store';
import { Contract, ContractStatus } from '../types/contract.type';
import { 
    Plus, Search, FileText, CheckCircle2, Clock, 
    XCircle, Ban, Filter, X, Grid, List, Calendar, Coins, User, Layers
} from 'lucide-react';

export function ContractList() {
    const router = useRouter();
    const {
        contracts,
        searchQuery,
        statusFilter,
        setSearchQuery,
        setStatusFilter
    } = useContractStore();

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Compute Summary Stats
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter((c) => c.status === 'active').length;
    const expiredContracts = contracts.filter((c) => c.status === 'expired').length;
    const terminatedContracts = contracts.filter((c) => c.status === 'terminated').length;

    // Expiring soon: active contracts with endDate within 30 days
    const expiringSoonContracts = contracts.filter((c) => {
        if (c.status !== 'active') return false;
        const end = new Date(c.endDate);
        const today = new Date();
        const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
    }).length;

    // Search and Filters
    const filteredContracts = contracts.filter((c) => {
        const matchesSearch = 
            c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.buildingName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
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

    const getStatusBadge = (status: ContractStatus) => {
        const config = {
            active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            expired: 'bg-slate-50 text-slate-600 border-slate-200',
            terminated: 'bg-orange-50 text-orange-700 border-orange-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200'
        };
        const labels = { active: 'Hoạt động', expired: 'Hết hạn', terminated: 'Đã thanh lý', cancelled: 'Đã hủy' };
        return (
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Tổng hợp đồng */}
                <div className="rounded-2xl border border-[#fcd5ce] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Tổng hợp đồng</span>
                        <div className="h-7 w-7 rounded-lg bg-[#fff8f6] flex items-center justify-center border border-[#fcd5ce]/30">
                            <FileText className="h-4 w-4 text-[#8f6f64]" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#3f2d28]">{totalContracts}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Hồ sơ lưu trữ</p>
                </div>

                {/* Hoạt động */}
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Đang hoạt động</span>
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/30">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-emerald-700">{activeContracts}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Khách đang ở</p>
                </div>

                {/* Sắp hết hạn */}
                <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Sắp hết hạn</span>
                        <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/30 animate-pulse">
                            <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-amber-700">{expiringSoonContracts}</p>
                    <p className="text-[10px] text-[#b89184] mt-0.5">Trong vòng 30 ngày</p>
                </div>

                {/* Hết hạn */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Đã hết hạn</span>
                        <div className="h-7 w-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200/30">
                            <XCircle className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-700">{expiredContracts}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Cần bàn giao cọc</p>
                </div>

                {/* Đã thanh lý */}
                <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Đã thanh lý</span>
                        <div className="h-7 w-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200/30">
                            <Ban className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-orange-700">{terminatedContracts}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Lưu trữ thanh lý</p>
                </div>

            </div>

            {/* Filter Toolbar */}
            <div className="rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                
                {/* Search Input */}
                <div className="relative w-full md:w-80 flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 shadow-inner focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                    <Search className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Mã hợp đồng, số phòng, tên khách..."
                        className="w-full bg-transparent text-xs text-[#3f2d28] placeholder-[#b89184] outline-none"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-[#caa79a] hover:text-[#ff385c]">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    
                    {/* Trạng thái filter */}
                    <div className="flex items-center gap-1 bg-white border border-[#fcd5ce] rounded-xl px-3 py-1.5 text-xs text-[#3f2d28] font-medium shadow-sm">
                        <Filter className="h-3.5 w-3.5 text-[#ff385c]" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none outline-none text-[#3f2d28] cursor-pointer"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="expired">Hết hạn</option>
                            <option value="terminated">Đã thanh lý</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
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
            {filteredContracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-[#fcd5ce] p-6">
                    <FileText className="h-14 w-14 text-[#caa79a] mb-3" />
                    <p className="text-base font-bold text-[#3f2d28]">Không tìm thấy hợp đồng nào</p>
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
                /* Table list view */
                <div className="rounded-3xl border border-[#fcd5ce] bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead className="bg-[#fff8f6] text-[#5b463f] border-b border-[#fcd5ce] font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Mã HĐ</th>
                                    <th className="px-6 py-4">Phòng</th>
                                    <th className="px-6 py-4">Khách hàng</th>
                                    <th className="px-6 py-4">Thời hạn thuê</th>
                                    <th className="px-6 py-4">Giá thuê</th>
                                    <th className="px-6 py-4">Tiền đặt cọc</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#fcd5ce]/40 text-[#3f2d28]">
                                {filteredContracts.map((c) => (
                                    <tr
                                        key={c.id}
                                        onClick={() => router.push('/admin/contracts/' + c.id)}
                                        className="hover:bg-[#fff8f6]/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-sm text-[#ff385c]">{c.id}</td>
                                        <td className="px-6 py-4 font-bold">P.{c.roomNumber} <span className="text-[10px] font-normal text-[#8f6f64]">({c.buildingName})</span></td>
                                        <td className="px-6 py-4 font-medium">{c.customerName}</td>
                                        <td className="px-6 py-4">{formatDate(c.startDate)} - {formatDate(c.endDate)}</td>
                                        <td className="px-6 py-4 font-extrabold text-sm">{formatCurrency(c.price)}</td>
                                        <td className="px-6 py-4 font-semibold text-[#8f6f64]">{formatCurrency(c.deposit)}</td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(c.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Grid view cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredContracts.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => router.push('/admin/contracts/' + c.id)}
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#fcd5ce] bg-white p-5 shadow-sm hover:shadow-lg transition-all hover:border-[#ffb5a7] duration-300 cursor-pointer"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#fcd5ce]/20">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4.5 w-4.5 text-[#ff385c]" />
                                        <h3 className="text-sm font-bold text-[#3f2d28] group-hover:text-[#ff385c] transition-colors">{c.id}</h3>
                                    </div>
                                    {getStatusBadge(c.status)}
                                </div>

                                <div className="space-y-2 text-[11px] text-[#8f6f64]">
                                    <div className="flex items-center gap-1.5 text-[#3f2d28] font-bold">
                                        <Layers className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>Phòng: P.{c.roomNumber} ({c.buildingName})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>Khách: <strong className="text-[#5b463f]">{c.customerName}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>Thời gian: {formatDate(c.startDate)} - {formatDate(c.endDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Coins className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>Giá thuê: <strong className="text-[#ff385c]">{formatCurrency(c.price)}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#fcd5ce]/20 text-right">
                                <span className="text-[11px] text-[#caa79a] font-bold group-hover:text-[#ff385c]">
                                    Chi tiết hợp đồng →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

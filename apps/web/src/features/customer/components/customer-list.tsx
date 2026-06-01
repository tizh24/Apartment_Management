import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerStore } from '../store/customer-store';
import { CustomerStatusBadge } from './customer-status';
import { Customer } from '../types/customer.type';
import { 
    Plus, Search, Users, CheckCircle2, HelpCircle, 
    XCircle, ShieldAlert, Filter, X, Grid, List, Sparkles, Phone, Mail, FileCheck, Layers
} from 'lucide-react';

export function CustomerList() {
    const router = useRouter();
    const {
        customers,
        searchQuery,
        statusFilter,
        setSearchQuery,
        setStatusFilter,
        addCustomer,
        updateCustomer,
        deleteCustomer
    } = useCustomerStore();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Compute Summary Stats
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === 'active').length;
    const potentialCustomers = customers.filter((c) => c.status === 'potential').length;
    const inactiveCustomers = customers.filter((c) => c.status === 'inactive').length;
    const indebtedCustomers = customers.filter((c) => c.totalUnpaid > 0).length;

    // Search and Filters
    const filteredCustomers = customers.filter((c) => {
        const matchesSearch = 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.currentRoomNumber && c.currentRoomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.currentBuilding && c.currentBuilding.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    return (
        <div className="space-y-6">
            
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Tổng số khách */}
                <div className="rounded-2xl border border-[#fcd5ce] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Tổng số khách</span>
                        <div className="h-7 w-7 rounded-lg bg-[#fff8f6] flex items-center justify-center border border-[#fcd5ce]/30">
                            <Users className="h-4 w-4 text-[#8f6f64]" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#3f2d28]">{totalCustomers}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Hồ sơ đã đăng ký</p>
                </div>

                {/* Đang thuê */}
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Đang thuê</span>
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/30">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-emerald-700">{activeCustomers}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Hợp đồng hoạt động</p>
                </div>

                {/* Khách tiềm năng */}
                <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Tiềm năng</span>
                        <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/30">
                            <Sparkles className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-blue-700">{potentialCustomers}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Chưa chốt phòng</p>
                </div>

                {/* Khách cũ / Inactive */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Đã trả phòng</span>
                        <div className="h-7 w-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200/30">
                            <XCircle className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-700">{inactiveCustomers}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Hợp đồng đã đóng</p>
                </div>

                {/* Nợ quá hạn */}
                <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Nợ chưa thu</span>
                        <div className="h-7 w-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200/30">
                            <ShieldAlert className="h-4 w-4 animate-bounce" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-red-600">{indebtedCustomers}</p>
                    <p className="text-[10px] text-[#b89184] mt-0.5">Yêu cầu đối soát</p>
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
                        placeholder="Tên khách, SĐT, Email, Số phòng..."
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
                    
                    {/* Trạng thái Dropdown */}
                    <div className="flex items-center gap-1 bg-white border border-[#fcd5ce] rounded-xl px-3 py-1.5 text-xs text-[#3f2d28] font-medium shadow-sm">
                        <Filter className="h-3.5 w-3.5 text-[#ff385c]" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none outline-none text-[#3f2d28] cursor-pointer"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang thuê</option>
                            <option value="potential">Khách tiềm năng</option>
                            <option value="inactive">Đã thanh lý</option>
                        </select>
                    </div>

                    {/* View mode toggle */}
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

            {/* List / Grid Content */}
            {filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-[#fcd5ce] p-6">
                    <Users className="h-14 w-14 text-[#caa79a] mb-3" />
                    <p className="text-base font-bold text-[#3f2d28]">Không tìm thấy khách hàng nào</p>
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
            ) : viewMode === 'grid' ? (
                /* Grid view: Premium customer cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredCustomers.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => router.push('/admin/customers/' + c.id)}
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#fcd5ce] bg-white p-5 shadow-sm hover:shadow-lg transition-all hover:border-[#ffb5a7] duration-300 cursor-pointer"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#fcd5ce]/20">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff8f6] border border-[#fcd5ce]/40 text-[#ff385c] font-black text-sm">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[#3f2d28] group-hover:text-[#ff385c] transition-colors line-clamp-1">
                                                {c.name}
                                            </h3>
                                            <p className="text-[10px] text-[#caa79a]">Quốc tịch: {c.nationality}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <CustomerStatusBadge status={c.status} />
                                    </div>
                                </div>

                                <div className="space-y-2 text-[11px] text-[#8f6f64]">
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span>SĐT: <strong className="text-[#5b463f]">{c.phone}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-[#caa79a]" />
                                        <span className="truncate">Email: <strong className="text-[#5b463f]" title={c.email}>{c.email}</strong></span>
                                    </div>
                                    {c.status === 'active' && c.currentRoomNumber && (
                                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#fcd5ce]/10 text-emerald-700 font-semibold">
                                            <Layers className="h-3.5 w-3.5 text-emerald-500" />
                                            <span>Đang thuê: P.{c.currentRoomNumber} ({c.currentBuilding})</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Outstanding balance or papers info */}
                            <div className="mt-4 pt-3 border-t border-[#fcd5ce]/20 flex items-center justify-between text-[11px]">
                                {c.totalUnpaid > 0 ? (
                                    <span className="text-red-600 font-bold">
                                        Còn nợ: {formatCurrency(c.totalUnpaid)}
                                    </span>
                                ) : (
                                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                        ✔ Không còn nợ
                                    </span>
                                )}
                                <span className="text-[#caa79a] hover:text-[#ff385c] font-bold">
                                    Chi tiết →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List view: Detailed admin table */
                <div className="rounded-3xl border border-[#fcd5ce] bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead className="bg-[#fff8f6] text-[#5b463f] border-b border-[#fcd5ce] font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Họ và tên</th>
                                    <th className="px-6 py-4">Quốc tịch</th>
                                    <th className="px-6 py-4">Số điện thoại</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4">Căn hộ thuê</th>
                                    <th className="px-6 py-4">Nợ chưa thu</th>
                                    <th className="px-6 py-4">Tài liệu đính kèm</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#fcd5ce]/40 text-[#3f2d28]">
                                {filteredCustomers.map((c) => (
                                    <tr
                                        key={c.id}
                                        onClick={() => router.push('/admin/customers/' + c.id)}
                                        className="hover:bg-[#fff8f6]/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-sm text-[#ff385c]">{c.name}</td>
                                        <td className="px-6 py-4">{c.nationality}</td>
                                        <td className="px-6 py-4 font-medium">{c.phone}</td>
                                        <td className="px-6 py-4">{c.email}</td>
                                        <td className="px-6 py-4">
                                            <CustomerStatusBadge status={c.status} />
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {c.status === 'active' && c.currentRoomNumber ? (
                                                <span className="font-bold text-[#3f2d28]">P.{c.currentRoomNumber} ({c.currentBuilding})</span>
                                            ) : (
                                                <span className="text-[#caa79a] italic">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-extrabold text-xs">
                                            {c.totalUnpaid > 0 ? (
                                                <span className="text-red-600">{formatCurrency(c.totalUnpaid)}</span>
                                            ) : (
                                                <span className="text-emerald-700">0 ₫</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-[#8f6f64] font-medium">
                                            {c.documents.length > 0 ? (
                                                <span className="inline-flex items-center gap-1 rounded bg-[#fff8f6] px-2 py-0.5 border border-[#fcd5ce] text-[10px] font-bold text-[#ff385c]">
                                                    <FileCheck className="h-3 w-3" />
                                                    {c.documents.length} Giấy tờ
                                                </span>
                                            ) : (
                                                <span className="text-[#caa79a] italic">Không có</span>
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

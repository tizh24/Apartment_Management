'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/features/dashboard/components/layouts';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { UserCheck, Plus, Search, Filter, Shield, ToggleLeft, ToggleRight, Trash2, Key, X, CheckCircle2, UserCheck2, AlertCircle } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { CustomSelect } from '@/components/ui/custom-select';

const ROLE_OPTIONS = [
    { value: 'all', label: 'Tất cả tài khoản' },
    { value: 'admin', label: 'Chủ apartment (Admin)' },
    { value: 'staff', label: 'Nhân viên vận hành' },
    { value: 'sale', label: 'Cộng tác viên (Sale)' },
    { value: 'customer', label: 'Khách thuê' },
];

interface Account {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'staff' | 'sale' | 'customer';
    status: 'active' | 'locked';
    createdAt: string;
}

const INITIAL_ACCOUNTS: Account[] = [
    {
        id: 'acc-1',
        name: 'Nguyễn Văn Admin',
        email: 'admin@apartmgmt.com',
        phone: '0901234567',
        role: 'admin',
        status: 'active',
        createdAt: '2025-01-10',
    },
    {
        id: 'acc-2',
        name: 'Trần Thị Nhân Viên',
        email: 'nhanvien@apartmgmt.com',
        phone: '0987654321',
        role: 'staff',
        status: 'active',
        createdAt: '2025-05-15',
    },
    {
        id: 'acc-3',
        name: 'Phạm Văn Sale',
        email: 'sale@apartmgmt.com',
        phone: '0912345678',
        role: 'sale',
        status: 'active',
        createdAt: '2025-08-20',
    },
    {
        id: 'acc-4',
        name: 'Hoàng Văn Khách',
        email: 'khach@apartmgmt.com',
        phone: '0933445566',
        role: 'customer',
        status: 'active',
        createdAt: '2025-11-01',
    },
    {
        id: 'acc-5',
        name: 'Đặng Văn Cựu Sale',
        email: 'cuusale@apartmgmt.com',
        phone: '0944556677',
        role: 'sale',
        status: 'locked',
        createdAt: '2025-06-12',
    },
];

const ROLE_LABELS: Record<string, { label: string; badge: string }> = {
    admin: { label: 'Chủ apartment (Admin)', badge: 'bg-[#ffb5a7] text-[#ff385c]' },
    staff: { label: 'Nhân viên vận hành', badge: 'bg-[#fcd5ce] text-[#7d4e41]' },
    sale: { label: 'Cộng tác viên (Sale)', badge: 'bg-[#fec89a] text-[#7d5f55]' },
    customer: { label: 'Khách thuê', badge: 'bg-[#f9dcc4] text-[#8f6f64]' },
};

export default function AdminAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'admin' | 'staff' | 'sale' | 'customer'>('staff');
    const [password, setPassword] = useState('');

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleCreateAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !phone) {
            triggerToast('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }

        const newAccount: Account = {
            id: `acc-${Date.now()}`,
            name,
            email,
            phone,
            role,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
        };

        setAccounts([newAccount, ...accounts]);
        setIsCreateOpen(false);
        triggerToast(`Đã cấp tài khoản thành công cho "${name}".`);
        
        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setRole('staff');
        setPassword('');
    };

    const handleToggleStatus = (id: string, currentStatus: 'active' | 'locked', accountName: string) => {
        const nextStatus = currentStatus === 'active' ? 'locked' : 'active';
        setAccounts(accounts.map(acc => acc.id === id ? { ...acc, status: nextStatus } : acc));
        triggerToast(
            nextStatus === 'locked' 
                ? `Đã khóa tài khoản của "${accountName}".` 
                : `Đã mở khóa tài khoản của "${accountName}".`
        );
    };

    const handleDeleteAccount = (id: string, accountName: string) => {
        if (confirm(`Bạn có chắc muốn xóa tài khoản của "${accountName}"? Hành động này không thể hoàn tác.`)) {
            setAccounts(accounts.filter(acc => acc.id !== id));
            triggerToast(`Đã xóa tài khoản "${accountName}".`);
        }
    };

    const handleResetPassword = (accountName: string) => {
        triggerToast(`Đã gửi liên kết đặt lại mật khẩu tới email của "${accountName}".`);
    };

    // Filter accounts
    const filteredAccounts = accounts.filter(acc => {
        const matchesSearch = 
            acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            acc.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
            acc.phone.includes(searchQuery);
        
        const matchesRole = roleFilter === 'all' || acc.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset pagination on search or filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter]);

    // Paginated accounts
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6 relative">
                
                {/* Toast Notification */}
                {toastMessage && (
                    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300 bg-[#3f2d28] text-white text-xs font-bold px-4 py-3 rounded-full shadow-xl flex items-center gap-2 border border-[#fcd5ce]/20">
                        <CheckCircle2 className="h-4 w-4 text-[#ff385c]" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Breadcrumb>
                        <BreadcrumbList className="text-sm text-[#8f6f64]">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild className="hover:text-[#5b463f] transition-colors">
                                    <Link href="/admin">Admin</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-[#3f2d28]">
                                    Quản lý tài khoản
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto hover:-translate-y-0.5"
                    >
                        <Plus className="h-4 w-4" />
                        Cấp tài khoản mới
                    </button>
                </div>

                {/* Filter and Search Bar (Google Drive style: flat, borderless) */}
                <div className="py-3 flex flex-col md:flex-row gap-4 justify-between items-center">
                    
                    {/* Role Filter on the Left */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-start">
                        <CustomSelect
                            value={roleFilter}
                            onChange={setRoleFilter}
                            options={ROLE_OPTIONS}
                            icon={Filter}
                        />
                    </div>

                    {/* Search Input on the Right */}
                    <div className="relative w-full md:w-80 flex items-center bg-[#fff8f6] border border-[#fcd5ce]/40 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                        <Search className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm theo tên, email, điện thoại..."
                            className="w-full bg-transparent text-xs text-[#3f2d28] placeholder-[#b89184] outline-none"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-[#caa79a] hover:text-[#ff385c]">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                </div>

                {/* Accounts Table List (Google Drive style) */}
                <div className="space-y-4">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="text-[#8f6f64] border-b border-[#fcd5ce] font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-3.5 px-5">Tên người dùng</th>
                                    <th className="py-3.5 px-4">Thông tin liên hệ</th>
                                    <th className="py-3.5 px-4">Vai trò hệ thống</th>
                                    <th className="py-3.5 px-4">Ngày cấp</th>
                                    <th className="py-3.5 px-4">Trạng thái</th>
                                    <th className="py-3.5 px-5 text-right">Thao tác nhanh</th>
                                </tr>
                            </thead>
                            <tbody className="text-[#3f2d28]">
                                {paginatedAccounts.length > 0 ? (
                                    paginatedAccounts.map((acc) => (
                                        <tr key={acc.id} className="hover:bg-[#fff8f6]/70 border-b border-[#fcd5ce]/30 cursor-pointer transition-all duration-200 group">
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fec89a] text-xs font-black text-[#ff385c] border border-[#fcd5ce]">
                                                        {acc.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[#3f2d28] text-xs group-hover:text-[#ff385c] transition-colors">{acc.name}</p>
                                                        <p className="text-[10px] text-[#caa79a] mt-0.5">ID: {acc.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 space-y-0.5 text-[#5b463f]">
                                                <p className="font-medium">{acc.email}</p>
                                                <p className="text-[10px] text-[#8f6f64]">{acc.phone}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${ROLE_LABELS[acc.role].badge}`}>
                                                    {ROLE_LABELS[acc.role].label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-medium text-[#8f6f64]">
                                                {acc.createdAt}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    acc.status === 'active' 
                                                        ? 'bg-green-50 text-green-700 border border-green-200' 
                                                        : 'bg-red-50 text-red-700 border border-red-200'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                                        acc.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                                    }`} />
                                                    {acc.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end items-center gap-2.5">
                                                    <button
                                                        onClick={() => handleResetPassword(acc.name)}
                                                        className="h-8 w-8 rounded-full bg-[#fff8f6] hover:bg-[#fcd5ce]/30 text-[#caa79a] hover:text-[#ff385c] flex items-center justify-center border border-[#fcd5ce]/20 transition-all cursor-pointer"
                                                        title="Đặt lại mật khẩu"
                                                    >
                                                        <Key className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(acc.id, acc.status, acc.name)}
                                                        className={`h-8 w-8 rounded-full flex items-center justify-center border border-[#fcd5ce]/20 transition-all cursor-pointer ${
                                                            acc.status === 'active' 
                                                                ? 'bg-[#fff8f6] text-green-600 hover:bg-green-50' 
                                                                : 'bg-[#ff385c]/10 text-[#ff385c] hover:bg-[#ff385c]/25'
                                                        }`}
                                                        title={acc.status === 'active' ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}
                                                    >
                                                        {acc.status === 'active' ? <ToggleRight className="h-4.5 w-4.5" /> : <ToggleLeft className="h-4.5 w-4.5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAccount(acc.id, acc.name)}
                                                        disabled={acc.role === 'admin'}
                                                        className={`h-8 w-8 rounded-full flex items-center justify-center border border-[#fcd5ce]/20 transition-all cursor-pointer bg-[#fff8f6] text-[#caa79a] hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none`}
                                                        title="Xóa tài khoản"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-[#caa79a] font-bold">
                                            <div className="flex flex-col items-center gap-2 justify-center">
                                                <AlertCircle className="h-6 w-6 text-[#caa79a]" />
                                                <p>Không tìm thấy tài khoản nào khớp với bộ lọc.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        totalItems={filteredAccounts.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>

                {/* Create Modal Dialog */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f2d28]/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-[#fcd5ce] shadow-2xl animate-in scale-in duration-200">
                            
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-[#fff8f6] to-[#f9dcc4]/30 px-6 py-4 flex items-center justify-between border-b border-[#fcd5ce]/30">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffb5a7] text-[#ff385c]">
                                        <UserCheck2 className="h-4.5 w-4.5" />
                                    </div>
                                    <h3 className="text-sm font-black text-[#3f2d28]">Cấp tài khoản mới</h3>
                                </div>
                                <button 
                                    onClick={() => setIsCreateOpen(false)}
                                    className="h-7 w-7 rounded-full hover:bg-[#fcd5ce]/40 flex items-center justify-center text-[#7d5f55] hover:text-[#ff385c] transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Họ và tên người dùng *</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all bg-white"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#5b463f] block">Email đăng nhập *</label>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="username@domain.com"
                                            className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#5b463f] block">Số điện thoại *</label>
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="09xx xxx xxx"
                                            className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all bg-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Mật khẩu ban đầu *</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Tạo mật khẩu bảo mật..."
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all bg-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Vai trò trên hệ thống</label>
                                    <select 
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as 'admin' | 'staff' | 'sale' | 'customer')}
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all bg-white font-medium cursor-pointer"
                                    >
                                        <option value="staff">Nhân viên vận hành</option>
                                        <option value="sale">Cộng tác viên (Sale / CTV)</option>
                                        <option value="customer">Khách thuê phòng</option>
                                        <option value="admin">Quản trị viên hệ thống (Admin)</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 justify-end pt-3 border-t border-[#fcd5ce]/30">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreateOpen(false)}
                                        className="px-4 py-2 rounded-lg border border-[#fcd5ce] hover:bg-[#fff8f6] text-[#7d5f55] text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-5 py-2 rounded-lg bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                        Cấp tài khoản
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

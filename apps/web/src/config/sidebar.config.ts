/**
 * Sidebar navigation configuration by role
 * 5 roles: Admin, Staff, Accountant, Sale, Customer
 */

import { UserRole } from '@/types/roles';
import {
    LayoutDashboard,
    DoorOpen,
    Users,
    FileText,
    CreditCard,
    BarChart3,
    Sparkles,
    Settings,
    LayoutGrid,
    AlertCircle,
    Ticket,
    User,
    LogOut,
    Receipt,
    TrendingUp,
    Banknote,
    Star,
    FileBarChart,
    HandCoins,
    MessageSquare,
} from 'lucide-react';

export interface SidebarItem {
    id: string;
    label: string;
    href: string;
    icon: any;
    submenu?: SidebarItem[];
    badge?: string | number;
}

export interface SidebarConfig {
    main: SidebarItem[];
    bottom: SidebarItem[];
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────
const adminSidebar: SidebarConfig = {
    main: [
        { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { id: 'rooms', label: 'Quản lý phòng', href: '/admin/rooms', icon: DoorOpen },
        { id: 'customers', label: 'Quản lý khách hàng', href: '/admin/customers', icon: Users },
        { id: 'contracts', label: 'Hợp đồng thuê', href: '/admin/contracts', icon: FileText },
        { id: 'revenue', label: 'Doanh thu & Khoản thu', href: '/admin/revenue', icon: CreditCard },
        { id: 'sales', label: 'Sale & Hoa hồng', href: '/admin/sales', icon: BarChart3 },
        { id: 'ai-tools', label: 'AI Tools', href: '/admin/ai-assistant', icon: Sparkles },
        { id: 'settings', label: 'Cài đặt hệ thống', href: '/admin/settings', icon: Settings },
    ],
    bottom: [
        { id: 'profile', label: 'Hồ sơ cá nhân', href: '/admin/profile', icon: User },
        { id: 'logout', label: 'Đăng xuất', href: '/auth/logout', icon: LogOut },
    ],
};

// ─── STAFF (Nhân viên vận hành) ───────────────────────────────────────────────
const staffSidebar: SidebarConfig = {
    main: [
        { id: 'dashboard', label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
        { id: 'rooms', label: 'Phòng', href: '/staff/rooms', icon: DoorOpen },
        { id: 'customers', label: 'Khách hàng', href: '/staff/customers', icon: Users },
        { id: 'contracts', label: 'Hợp đồng', href: '/staff/contracts', icon: FileText },
        { id: 'payments', label: 'Thanh toán', href: '/staff/payments', icon: CreditCard },
        { id: 'support', label: 'Yêu cầu hỗ trợ', href: '/staff/support', icon: AlertCircle },
    ],
    bottom: [
        { id: 'profile', label: 'Hồ sơ cá nhân', href: '/staff/profile', icon: User },
        { id: 'logout', label: 'Đăng xuất', href: '/auth/logout', icon: LogOut },
    ],
};

// ─── ACCOUNTANT (Kế toán / Thu ngân) ─────────────────────────────────────────
const accountantSidebar: SidebarConfig = {
    main: [
        { id: 'dashboard', label: 'Dashboard', href: '/accountant', icon: LayoutDashboard },
        { id: 'revenue', label: 'Doanh thu', href: '/accountant/revenue', icon: TrendingUp },
        { id: 'invoices', label: 'Khoản phải thu', href: '/accountant/invoices', icon: Receipt },
        { id: 'pending', label: 'Chờ xác nhận', href: '/accountant/pending', icon: Banknote },
        { id: 'reports', label: 'Báo cáo', href: '/accountant/reports', icon: FileBarChart },
    ],
    bottom: [
        { id: 'profile', label: 'Hồ sơ cá nhân', href: '/accountant/profile', icon: User },
        { id: 'logout', label: 'Đăng xuất', href: '/auth/logout', icon: LogOut },
    ],
};

// ─── SALE (Cộng tác viên) ─────────────────────────────────────────────────────
const saleSidebar: SidebarConfig = {
    main: [
        { id: 'dashboard', label: 'Dashboard', href: '/sale', icon: LayoutDashboard },
        { id: 'my-contracts', label: 'Hợp đồng của tôi', href: '/sale/contracts', icon: FileText },
        { id: 'commission', label: 'Hoa hồng', href: '/sale/commission', icon: HandCoins },
    ],
    bottom: [
        { id: 'profile', label: 'Hồ sơ cá nhân', href: '/sale/profile', icon: User },
        { id: 'logout', label: 'Đăng xuất', href: '/auth/logout', icon: LogOut },
    ],
};

// ─── CUSTOMER (Khách thuê) ────────────────────────────────────────────────────
const customerSidebar: SidebarConfig = {
    main: [
        { id: 'home', label: 'Trang chủ', href: '/guest-portal', icon: LayoutGrid },
        { id: 'my-room', label: 'Phòng của tôi', href: '/guest-portal/room', icon: DoorOpen },
        { id: 'payments', label: 'Thanh toán', href: '/guest-portal/payments', icon: CreditCard },
        { id: 'support', label: 'Hỗ trợ / Khiếu nại', href: '/guest-portal/support', icon: MessageSquare },
        { id: 'reviews', label: 'Đánh giá dịch vụ', href: '/guest-portal/review', icon: Star },
    ],
    bottom: [
        { id: 'account', label: 'Tài khoản', href: '/guest-portal/account', icon: User },
        { id: 'logout', label: 'Đăng xuất', href: '/auth/logout', icon: LogOut },
    ],
};

// ─── Registry ─────────────────────────────────────────────────────────────────
export const sidebarByRole: Record<UserRole, SidebarConfig> = {
    [UserRole.ADMIN]: adminSidebar,
    [UserRole.STAFF]: staffSidebar,
    [UserRole.ACCOUNTANT]: accountantSidebar,
    [UserRole.SALE]: saleSidebar,
    [UserRole.CUSTOMER]: customerSidebar,
};

export const getSidebarConfig = (role: UserRole): SidebarConfig => {
    return sidebarByRole[role];
};

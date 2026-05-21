/**
 * Sidebar navigation configuration by role
 * Each role has its own set of menu items
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

const adminSidebar: SidebarConfig = {
    main: [
        {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
        },
        {
            id: 'rooms',
            label: 'Room Management',
            href: '/admin/rooms',
            icon: DoorOpen,
        },
        {
            id: 'customers',
            label: 'Customer Management',
            href: '/admin/customers',
            icon: Users,
        },
        {
            id: 'contracts',
            label: 'Contracts',
            href: '/admin/contracts',
            icon: FileText,
        },
        {
            id: 'revenue',
            label: 'Revenue & Billing',
            href: '/admin/revenue-billing',
            icon: CreditCard,
        },
        {
            id: 'sales',
            label: 'Sales & Commission',
            href: '/admin/sales',
            icon: BarChart3,
        },
        {
            id: 'ai-tools',
            label: 'AI Tools',
            href: '/admin/ai-assistant',
            icon: Sparkles,
        },
        {
            id: 'settings',
            label: 'System Settings',
            href: '/admin/settings',
            icon: Settings,
        },
    ],
    bottom: [
        {
            id: 'profile',
            label: 'Profile',
            href: '/admin/profile',
            icon: User,
        },
        {
            id: 'logout',
            label: 'Logout',
            href: '/auth/logout',
            icon: LogOut,
        },
    ],
};

const staffSidebar: SidebarConfig = {
    main: [
        {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/staff',
            icon: LayoutDashboard,
        },
        {
            id: 'rooms',
            label: 'Rooms',
            href: '/staff/rooms',
            icon: DoorOpen,
        },
        {
            id: 'customers',
            label: 'Customers',
            href: '/staff/customers',
            icon: Users,
        },
        {
            id: 'contracts',
            label: 'Contracts',
            href: '/staff/contracts',
            icon: FileText,
        },
        {
            id: 'payments',
            label: 'Payments',
            href: '/staff/payments',
            icon: CreditCard,
        },
        {
            id: 'support',
            label: 'Support Requests',
            href: '/staff/support',
            icon: AlertCircle,
        },
    ],
    bottom: [
        {
            id: 'profile',
            label: 'Profile',
            href: '/staff/profile',
            icon: User,
        },
        {
            id: 'logout',
            label: 'Logout',
            href: '/auth/logout',
            icon: LogOut,
        },
    ],
};

const customerSidebar: SidebarConfig = {
    main: [
        {
            id: 'home',
            label: 'Home',
            href: '/guest-portal',
            icon: LayoutGrid,
        },
        {
            id: 'my-room',
            label: 'My Room',
            href: '/guest-portal/room',
            icon: DoorOpen,
        },
        {
            id: 'payments',
            label: 'Payments',
            href: '/guest-portal/payments',
            icon: CreditCard,
        },
        {
            id: 'support',
            label: 'Support',
            href: '/guest-portal/support',
            icon: Ticket,
        },
    ],
    bottom: [
        {
            id: 'account',
            label: 'Account',
            href: '/guest-portal/account',
            icon: User,
        },
        {
            id: 'logout',
            label: 'Logout',
            href: '/auth/logout',
            icon: LogOut,
        },
    ],
};

export const sidebarByRole: Record<UserRole, SidebarConfig> = {
    [UserRole.ADMIN]: adminSidebar,
    [UserRole.STAFF]: staffSidebar,
    [UserRole.CUSTOMER]: customerSidebar,
};

export const getSidebarConfig = (role: UserRole): SidebarConfig => {
    return sidebarByRole[role];
};

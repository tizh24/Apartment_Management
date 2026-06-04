/**
 * Role types and enums for the apartment management system
 * 4 roles per PRD: Admin, Staff (Nhân viên vận hành),
 * Sale (Cộng tác viên), Customer (Khách thuê)
 */

export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    SALE = 'sale',
    CUSTOMER = 'customer',
}

export type RoleType = UserRole | 'admin' | 'staff' | 'sale' | 'customer';

export interface RolePermissions {
    // Analytics & reporting
    canViewAnalytics: boolean;
    canViewRevenue: boolean;
    canConfirmPayments: boolean;
    canExportReports: boolean;

    // Operations
    canManageRooms: boolean;
    canInputUtility: boolean;
    canManageCustomers: boolean;
    canManageContracts: boolean;
    canManageBilling: boolean;

    // Sales
    canManageSales: boolean;
    canViewOwnContracts: boolean;       // SALE: only see own contracts
    canViewOwnCommissions: boolean;     // SALE: only see own commissions

    // AI & System
    canAccessAITools: boolean;
    canAccessSystemSettings: boolean;

    // Guest / Customer
    canViewAllCustomers: boolean;
    canViewOwnData: boolean;
    canMakePayments: boolean;
    canCreateSupportTickets: boolean;
    canSubmitReviews: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
    [UserRole.ADMIN]: {
        canViewAnalytics: true,
        canViewRevenue: true,
        canConfirmPayments: true,
        canExportReports: true,
        canManageRooms: true,
        canInputUtility: true,
        canManageCustomers: true,
        canManageContracts: true,
        canManageBilling: true,
        canManageSales: true,
        canViewOwnContracts: true,
        canViewOwnCommissions: true,
        canAccessAITools: true,
        canAccessSystemSettings: true,
        canViewAllCustomers: true,
        canViewOwnData: true,
        canMakePayments: true,
        canCreateSupportTickets: true,
        canSubmitReviews: false,
    },
    [UserRole.STAFF]: {
        // Nhân viên vận hành: quản lý phòng, khách, hợp đồng, điện nước + báo cáo, doanh thu, phân tích
        canViewAnalytics: true,
        canViewRevenue: true,
        canConfirmPayments: true,
        canExportReports: true,
        canManageRooms: true,
        canInputUtility: true,
        canManageCustomers: true,
        canManageContracts: true,
        canManageBilling: true,
        canManageSales: false,
        canViewOwnContracts: false,
        canViewOwnCommissions: false,
        canAccessAITools: false,
        canAccessSystemSettings: false,
        canViewAllCustomers: true,
        canViewOwnData: false,
        canMakePayments: true,
        canCreateSupportTickets: true,
        canSubmitReviews: false,
    },
    [UserRole.SALE]: {
        // Sale/Cộng tác viên: chỉ xem HĐ + hoa hồng của mình
        canViewAnalytics: false,
        canViewRevenue: false,
        canConfirmPayments: false,
        canExportReports: false,
        canManageRooms: false,
        canInputUtility: false,
        canManageCustomers: false,
        canManageContracts: false,
        canManageBilling: false,
        canManageSales: false,
        canViewOwnContracts: true,
        canViewOwnCommissions: true,
        canAccessAITools: false,
        canAccessSystemSettings: false,
        canViewAllCustomers: false,
        canViewOwnData: true,
        canMakePayments: false,
        canCreateSupportTickets: false,
        canSubmitReviews: false,
    },
    [UserRole.CUSTOMER]: {
        // Khách thuê: cổng khách hàng, thanh toán, khiếu nại, đánh giá
        canViewAnalytics: false,
        canViewRevenue: false,
        canConfirmPayments: false,
        canExportReports: false,
        canManageRooms: false,
        canInputUtility: false,
        canManageCustomers: false,
        canManageContracts: false,
        canManageBilling: false,
        canManageSales: false,
        canViewOwnContracts: false,
        canViewOwnCommissions: false,
        canAccessAITools: false,
        canAccessSystemSettings: false,
        canViewAllCustomers: false,
        canViewOwnData: true,
        canMakePayments: true,
        canCreateSupportTickets: true,
        canSubmitReviews: true,
    },
};

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    roomNumber?: string;   // for CUSTOMER role
    buildingName?: string; // for CUSTOMER role
}

export const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Admin',
    [UserRole.STAFF]: 'Nhân viên vận hành',
    [UserRole.SALE]: 'Sale / Cộng tác viên',
    [UserRole.CUSTOMER]: 'Khách thuê',
};

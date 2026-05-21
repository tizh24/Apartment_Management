/**
 * Role types and enums for the apartment management system
 * Supports Admin, Staff, and Customer (Guest Portal) roles
 */

export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    CUSTOMER = 'customer',
}

export type RoleType = UserRole | 'admin' | 'staff' | 'customer';

export interface RolePermissions {
    canViewAnalytics: boolean;
    canManageRooms: boolean;
    canManageCustomers: boolean;
    canManageContracts: boolean;
    canManageBilling: boolean;
    canManageSales: boolean;
    canAccessAITools: boolean;
    canAccessSystemSettings: boolean;
    canViewAllCustomers: boolean;
    canViewOwnData: boolean;
    canMakePayments: boolean;
    canCreateSupportTickets: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
    [UserRole.ADMIN]: {
        canViewAnalytics: true,
        canManageRooms: true,
        canManageCustomers: true,
        canManageContracts: true,
        canManageBilling: true,
        canManageSales: true,
        canAccessAITools: true,
        canAccessSystemSettings: true,
        canViewAllCustomers: true,
        canViewOwnData: true,
        canMakePayments: true,
        canCreateSupportTickets: true,
    },
    [UserRole.STAFF]: {
        canViewAnalytics: false,
        canManageRooms: true,
        canManageCustomers: true,
        canManageContracts: true,
        canManageBilling: true,
        canManageSales: false,
        canAccessAITools: false,
        canAccessSystemSettings: false,
        canViewAllCustomers: true,
        canViewOwnData: false,
        canMakePayments: true,
        canCreateSupportTickets: true,
    },
    [UserRole.CUSTOMER]: {
        canViewAnalytics: false,
        canManageRooms: false,
        canManageCustomers: false,
        canManageContracts: false,
        canManageBilling: false,
        canManageSales: false,
        canAccessAITools: false,
        canAccessSystemSettings: false,
        canViewAllCustomers: false,
        canViewOwnData: true,
        canMakePayments: true,
        canCreateSupportTickets: true,
    },
};

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
}

'use client';

import React, { ReactNode } from 'react';
import { RoleProvider } from '@/context/RoleContext';
import { UserRole } from '@/types/roles';

interface RoleLayoutProps {
  children: ReactNode;
  role: UserRole;
}

const MOCK_USERS: Record<UserRole, { email: string; name: string }> = {
  [UserRole.ADMIN]: { email: 'admin@apartmgmt.com', name: 'Nguyễn Văn Admin' },
  [UserRole.STAFF]: { email: 'nhanvien@apartmgmt.com', name: 'Trần Thị Nhân Viên' },
  [UserRole.SALE]: { email: 'sale@apartmgmt.com', name: 'Phạm Văn Sale' },
  [UserRole.CUSTOMER]: { email: 'khach@apartmgmt.com', name: 'Hoàng Văn Khách' },
};

export function RoleLayout({ children, role }: RoleLayoutProps) {
  const mockInfo = MOCK_USERS[role];
  const mockUser = {
    id: `mock-${role}-1`,
    email: mockInfo.email,
    name: mockInfo.name,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
    roomNumber: role === UserRole.CUSTOMER ? '305' : undefined,
    buildingName: role === UserRole.CUSTOMER ? 'Tòa A' : undefined,
  };

  return (
    <RoleProvider initialUser={mockUser}>
      {children}
    </RoleProvider>
  );
}

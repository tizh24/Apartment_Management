'use client';

import React, { ReactNode } from 'react';
import { RoleProvider } from '@/context/RoleContext';
import { UserRole } from '@/types/roles';

interface RoleLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export function RoleLayout({ children, role }: RoleLayoutProps) {
  const mockUser = {
    id: '1',
    email: role === UserRole.ADMIN ? 'admin@apartmgmt.com' : role === UserRole.STAFF ? 'staff@apartmgmt.com' : 'customer@apartmgmt.com',
    name: role === UserRole.ADMIN ? 'Admin User' : role === UserRole.STAFF ? 'Staff Member' : 'Customer User',
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
  };

  return (
    <RoleProvider initialUser={mockUser}>
      {children}
    </RoleProvider>
  );
}

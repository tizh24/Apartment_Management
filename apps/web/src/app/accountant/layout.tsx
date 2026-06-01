import React, { ReactNode } from 'react';
import { RoleLayout } from '@/features/dashboard/components/RoleLayout';
import { UserRole } from '@/types/roles';

export default function AccountantLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role={UserRole.ACCOUNTANT}>
      {children}
    </RoleLayout>
  );
}

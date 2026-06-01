import React, { ReactNode } from 'react';
import { RoleLayout } from '@/features/dashboard/components/RoleLayout';
import { UserRole } from '@/types/roles';

export default function SaleLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role={UserRole.SALE}>
      {children}
    </RoleLayout>
  );
}

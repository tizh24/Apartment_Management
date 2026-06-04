'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '@/types/roles';

interface RoleContextType {
    user: User | null;
    role: UserRole | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export interface RoleProviderProps {
    children: ReactNode;
    initialUser?: User | null;
}

export function RoleProvider({ children, initialUser = null }: RoleProviderProps) {
    const [user, setUser] = React.useState<User | null>(initialUser);

    const role = user?.role || null;
    const isLoading = user === null && initialUser === null; // Basic loading state

    return (
        <RoleContext.Provider value={{ user, role, isLoading, setUser }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);

    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider');
    }

    return context;
}

export function useUserRole() {
    const { role } = useRole();
    return role;
}

export function useUser() {
    const { user } = useRole();
    return user;
}

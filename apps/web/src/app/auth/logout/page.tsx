'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        localStorage.removeItem('demo_role');
        localStorage.removeItem('demo_email');

        // Expire the test cookie immediately.
        document.cookie = 'demo_role=; path=/; max-age=0';

        router.replace('/');
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f8edeb] text-[#5b463f]">
            <p className="text-sm font-medium">Đang đăng xuất...</p>
        </main>
    );
}

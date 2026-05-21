'use client';

import pageImage from '../../images/page.png';
import { LoginForm } from '@/features/auth/components';
import type { ILoginFormValues } from '@/features/auth/types';

export default function Home() {
    const handleLogin = async (values: ILoginFormValues) => {
        // TODO: Xử lý logic login sau
        console.log('Login values:', values);
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            {/* Background image - scaled and slightly saturated for a vivid look */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${pageImage.src})`,
                    transform: 'scale(1.06)',
                    filter: 'saturate(1.16) contrast(1.05)'
                }}
            />

            {/* Lightweight overlay for contrast (no blur) */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,16,32,0.06)_0%,rgba(15,16,32,0.18)_40%,rgba(15,16,32,0.06)_100%)]" />

            {/* Top-left brand (bigger + clearer) */}
            <header className="absolute left-8 top-6 z-30">
                <div
                    className="inline-flex items-center gap-3 rounded-full border border-white/18 bg-white/8 px-5 py-3 text-sm font-bold uppercase tracking-wider text-black/100 shadow-sm transition-transform duration-200 ease-out hover:scale-105 hover:shadow-lg hover:bg-white/12 hover:text-white/100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    tabIndex={0}
                    role="button"
                >
                    Apartment Management
                </div>
            </header>

            {/* Responsive layout: form scales on small screens, shifts left on large */}
            <section className="relative z-20 mx-auto flex min-h-screen w-full max-w-[1400px] items-center justify-center md:justify-center lg:justify-start px-4 sm:px-8 lg:pl-16 xl:pl-24 py-12 lg:py-16">
                <div className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-[520px]">
                    <LoginForm onSubmit={handleLogin} />
                </div>
            </section>
        </main>
    );
}

'use client';

import { FormEvent, useState } from 'react';
import { ILoginFormValues, ILoginFormErrors } from '../types';



interface LoginFormProps {
    onSubmit?: (values: ILoginFormValues) => Promise<void>;
    isLoading?: boolean;
    submitError?: string;
}

export default function LoginForm({ onSubmit, isLoading = false, submitError }: LoginFormProps) {
    const [values, setValues] = useState<ILoginFormValues>({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<ILoginFormErrors>({});
    const [rememberMe, setRememberMe] = useState(false);

    /**
     * Validate form fields
     */
    const validateForm = (): boolean => {
        const newErrors: ILoginFormErrors = {};

        if (!values.email) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!values.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (values.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle input change
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear field error when user starts typing
        if (errors[name as keyof ILoginFormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (onSubmit) {
            try {
                await onSubmit(values);
            } catch (error) {
                console.error('Login error:', error);
            }
        }
    };

    return (
        <div className="relative w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/35 bg-[linear-gradient(180deg,rgba(190,80,171,0.80)_0%,rgba(162,104,181,0.74)_50%,rgba(192,173,219,0.76)_100%)] px-6 py-8 text-white shadow-[0_20px_60px_rgba(45,16,60,0.26)] sm:px-8 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_34%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.12),_transparent_38%)]" />

            <form onSubmit={handleSubmit} className="relative z-10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.18)] sm:text-4xl">
                        Login
                    </h2>
                </div>

                <div className="space-y-8">
                    {submitError && (
                        <div className="rounded-2xl border border-rose-200/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-50 shadow-sm">
                            {submitError}
                        </div>
                    )}

                    <div className="space-y-3">
                        <label htmlFor="email" className="block text-sm font-semibold text-white/95 sm:text-base">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={values.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="example@email.com"
                            className="h-11 w-full border-0 border-b-2 border-white/90 bg-transparent px-0 text-sm text-white placeholder:text-white/50 shadow-none outline-none transition-all duration-300 focus:border-white focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                        />
                        {errors.email && <p className="text-xs text-rose-100">{errors.email}</p>}
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="password" className="block text-sm font-semibold text-white/95 sm:text-base">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={values.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="••••••••"
                            className="h-11 w-full border-0 border-b-2 border-white/90 bg-transparent px-0 text-sm text-white placeholder:text-white/50 shadow-none outline-none transition-all duration-300 focus:border-white focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                        />
                        {errors.password && <p className="text-xs text-rose-100">{errors.password}</p>}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-semibold text-white sm:text-sm">
                        <label className="flex cursor-pointer items-center gap-2 select-none">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-white/70 bg-transparent accent-white"
                            />
                            <span>Remember Me</span>
                        </label>

                        <a href="#" className="transition-opacity hover:opacity-80 hover:underline">
                            Forget Password
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-base font-bold text-slate-900 shadow-[0_12px_28px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_14px_30px_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:opacity-70 sm:h-14 sm:text-lg"
                    >
                        {isLoading ? 'Processing...' : 'Log in'}
                    </button>


                </div>
            </form>
        </div>
    );
}

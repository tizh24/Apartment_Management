import React, { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { ROLE_LABELS, UserRole } from '@/types/roles';
import { 
    User, Mail, Phone, Lock, Save, KeyRound, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';

export function ProfileDetails() {
    const { user, setUser } = useRole();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Personal info states
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '0901234567');
    const [avatarSeed, setAvatarSeed] = useState(user?.name || 'admin');

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!user) {
        return (
            <div className="text-center py-10 bg-white border border-[#fcd5ce] rounded-3xl p-6">
                <AlertCircle className="h-10 w-10 text-[#caa79a] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#3f2d28]">Không tìm thấy thông tin tài khoản</p>
                <p className="text-xs text-[#caa79a] mt-0.5">Vui lòng đăng nhập lại để xem hồ sơ.</p>
            </div>
        );
    }

    const triggerToast = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const triggerError = (msg: string) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(''), 3000);
    };

    const handleSaveInfo = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!name.trim()) {
            triggerError('Họ và tên không được để trống.');
            return;
        }

        const updatedUser = {
            ...user,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`
        };

        setUser(updatedUser);
        triggerToast('Cập nhật thông tin cá nhân thành công.');
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!currentPassword) {
            triggerError('Vui lòng nhập mật khẩu hiện tại.');
            return;
        }

        if (newPassword.length < 6) {
            triggerError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
            return;
        }

        if (newPassword !== confirmPassword) {
            triggerError('Xác nhận mật khẩu mới không khớp.');
            return;
        }

        // Mock verification
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        triggerToast('Thay đổi mật khẩu tài khoản thành công.');
    };

    const randomizeAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setAvatarSeed(randomSeed);
    };

    return (
        <div className="space-y-6">
            
            {/* Success / Error notification */}
            {successMessage && (
                <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl shadow-sm animate-in fade-in slide-in-from-top duration-200">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl shadow-sm animate-in fade-in slide-in-from-top duration-200">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Avatar Card */}
                <div className="lg:col-span-1 rounded-3xl border border-[#fcd5ce] bg-white p-6 shadow-sm flex flex-col items-center justify-between gap-6 text-center">
                    <div className="space-y-4 w-full flex flex-col items-center">
                        
                        {/* Avatar Image Container */}
                        <div className="relative h-28 w-28 rounded-3xl bg-[#fff8f6] border border-[#fcd5ce] flex items-center justify-center p-3 shadow-inner group overflow-hidden">
                            <img
                                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                                alt="User Avatar"
                                className="h-full w-full object-contain p-2"
                            />
                        </div>

                        {/* Random Seed Button */}
                        <button
                            type="button"
                            onClick={randomizeAvatar}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#fcd5ce] text-[10px] font-bold text-[#8f6f64] hover:text-[#ff385c] hover:bg-[#fff8f6] rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Đổi ảnh đại diện ngẫu nhiên
                        </button>
                    </div>

                    <div className="space-y-1 w-full border-t border-[#fcd5ce]/30 pt-4">
                        <h2 className="text-base font-black text-[#3f2d28]">{user.name}</h2>
                        <span className="inline-flex rounded-full bg-[#fff8f6] border border-[#fcd5ce] px-3 py-0.5 text-xs text-[#ff385c] font-bold">
                            {ROLE_LABELS[user.role] || user.role}
                        </span>
                        <p className="text-[10px] text-[#caa79a] pt-1">ID Tài khoản: {user.id}</p>
                    </div>
                </div>

                {/* Right Side: Information Sub-forms */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* General Information Form */}
                    <div className="rounded-3xl border border-[#fcd5ce] bg-white p-6 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-[#fcd5ce]/30">
                            <h3 className="text-sm font-bold text-[#3f2d28] flex items-center gap-1.5">
                                <User className="h-4.5 w-4.5 text-[#ff385c]" />
                                Thông tin cá nhân
                            </h3>
                            <p className="text-[10px] text-[#caa79a]">Quản lý tên hiển thị, địa chỉ liên hệ và kênh giao tiếp chính thức.</p>
                        </div>

                        <form onSubmit={handleSaveInfo} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Họ và tên *</label>
                                    <div className="relative flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                                        <User className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-transparent outline-none text-[#3f2d28]"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Số điện thoại *</label>
                                    <div className="relative flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                                        <Phone className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-transparent outline-none text-[#3f2d28]"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs font-bold text-[#5b463f] block">Email tài khoản</label>
                                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500">
                                        <Mail className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-transparent outline-none text-slate-500 select-all cursor-not-allowed"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#fcd5ce]/30 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                                >
                                    <Save className="h-4 w-4" />
                                    Lưu thay đổi thông tin
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="rounded-3xl border border-[#fcd5ce] bg-white p-6 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-[#fcd5ce]/30">
                            <h3 className="text-sm font-bold text-[#3f2d28] flex items-center gap-1.5">
                                <KeyRound className="h-4.5 w-4.5 text-[#ff385c]" />
                                Bảo mật & Đổi mật khẩu
                            </h3>
                            <p className="text-[10px] text-[#caa79a]">Cập nhật mật khẩu tài khoản thường xuyên để nâng cao bảo mật hệ thống.</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Mật khẩu hiện tại *</label>
                                    <div className="relative flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                                        <Lock className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-transparent outline-none text-[#3f2d28]"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#5b463f] block">Mật khẩu mới *</label>
                                        <div className="relative flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                                            <Lock className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Tối thiểu 6 ký tự"
                                                className="w-full bg-transparent outline-none text-[#3f2d28]"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#5b463f] block">Xác nhận mật khẩu mới *</label>
                                        <div className="relative flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                                            <Lock className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Nhập lại mật khẩu mới"
                                                className="w-full bg-transparent outline-none text-[#3f2d28]"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#fcd5ce]/30 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                                >
                                    <KeyRound className="h-4 w-4" />
                                    Cập nhật mật khẩu mới
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

            </div>

        </div>
    );
}

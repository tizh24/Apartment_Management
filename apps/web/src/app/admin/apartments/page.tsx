'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/features/dashboard/components/layouts';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Building2, Plus, MapPin, Layers, DoorOpen, Trash2, ShieldAlert, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface Apartment {
    id: string;
    name: string;
    address: string;
    floors: number;
    roomsCount: number;
    status: 'active' | 'maintenance';
    description: string;
}

const INITIAL_APARTMENTS: Apartment[] = [
    {
        id: 'apt-1',
        name: 'Tòa nhà Harmony',
        address: '128 Trần Hưng Đạo, Phường Nguyễn Cư Trinh, Quận 1, TP. HCM',
        floors: 6,
        roomsCount: 48,
        status: 'active',
        description: 'Khu căn hộ studio dịch vụ cao cấp, an ninh 24/7, hầm để xe rộng rãi.',
    },
    {
        id: 'apt-2',
        name: 'Khu căn hộ Sunrise',
        address: '79 Nguyễn Thị Thập, Phường Tân Hưng, Quận 7, TP. HCM',
        floors: 5,
        roomsCount: 50,
        status: 'active',
        description: 'Vị trí đắc địa đối diện Lotte Mart, đầy đủ tiện ích xung quanh, camera an ninh.',
    },
    {
        id: 'apt-3',
        name: 'Building Moonlight',
        address: '202 Võ Thị Sáu, Phường Võ Thị Sáu, Quận 3, TP. HCM',
        floors: 4,
        roomsCount: 30,
        status: 'maintenance',
        description: 'Đang tiến hành sơn sửa lại mặt tiền và nâng cấp thang máy tòa nhà.',
    },
];

export default function AdminApartmentsPage() {
    const [apartments, setApartments] = useState<Apartment[]>(INITIAL_APARTMENTS);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [floors, setFloors] = useState(5);
    const [roomsCount, setRoomsCount] = useState(20);
    const [status, setStatus] = useState<'active' | 'maintenance'>('active');
    const [description, setDescription] = useState('');

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleCreateApartment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address) {
            triggerToast('Vui lòng điền đầy đủ tên và địa chỉ tòa nhà.');
            return;
        }

        const newApt: Apartment = {
            id: `apt-${Date.now()}`,
            name,
            address,
            floors: Number(floors),
            roomsCount: Number(roomsCount),
            status,
            description,
        };

        setApartments([newApt, ...apartments]);
        setIsCreateOpen(false);
        triggerToast(`Đã thêm thành công tòa nhà "${name}" vào hệ thống.`);
        
        // Reset form
        setName('');
        setAddress('');
        setFloors(5);
        setRoomsCount(20);
        setStatus('active');
        setDescription('');
    };

    const handleDeleteApartment = (id: string, aptName: string) => {
        if (confirm(`Bạn có chắc chắn muốn xóa tòa nhà "${aptName}" khỏi hệ thống?`)) {
            setApartments(apartments.filter((a) => a.id !== id));
            triggerToast(`Đã xóa tòa nhà "${aptName}".`);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6 relative">
                
                {/* Toast Notification */}
                {toastMessage && (
                    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300 bg-[#3f2d28] text-white text-xs font-bold px-4 py-3 rounded-full shadow-xl flex items-center gap-2 border border-[#fcd5ce]/20">
                        <CheckCircle2 className="h-4 w-4 text-[#ff385c]" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Breadcrumb>
                        <BreadcrumbList className="text-sm text-[#8f6f64]">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild className="hover:text-[#5b463f] transition-colors">
                                    <Link href="/admin">Admin</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-[#3f2d28]">
                                    Quản lý apartments
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm apartment mới
                    </button>
                </div>

                {/* Main Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apartments.map((apt) => (
                        <div 
                            key={apt.id} 
                            className="bg-white rounded-2xl p-5 border border-[#fcd5ce]/60 hover:shadow-xl hover:shadow-[#3f2d28]/5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                        >
                            {/* Decorative Top Accent Line */}
                            <div className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                                apt.status === 'active' ? 'bg-[#ffb5a7]' : 'bg-[#caa79a]'
                            }`} />

                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fcd5ce]/30 text-[#ff385c]">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        apt.status === 'active' 
                                            ? 'bg-[#f9dcc4] text-[#9f5c4c]' 
                                            : 'bg-[#fcd5ce] text-[#7d3e35]'
                                    }`}>
                                        {apt.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-base font-black text-[#3f2d28] group-hover:text-[#ff385c] transition-colors">{apt.name}</h3>
                                    <div className="flex items-start gap-1 text-xs text-[#8f6f64]">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#ff385c] mt-0.5" />
                                        <span className="leading-tight">{apt.address}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-[#9d786d] line-clamp-2 min-h-8 leading-relaxed">
                                    {apt.description || 'Chưa có thông tin mô tả chi tiết cho tòa nhà này.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-[#fff8f6]/70 border border-[#fcd5ce]/20 text-xs">
                                    <div className="flex items-center gap-2 text-[#5b463f]">
                                        <Layers className="h-4 w-4 text-[#ffb5a7]" />
                                        <div>
                                            <p className="text-[9px] text-[#caa79a] font-bold uppercase leading-none">Số tầng</p>
                                            <p className="font-bold text-[#3f2d28] mt-0.5">{apt.floors} Tầng</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#5b463f]">
                                        <DoorOpen className="h-4 w-4 text-[#ffb5a7]" />
                                        <div>
                                            <p className="text-[9px] text-[#caa79a] font-bold uppercase leading-none">Tổng số phòng</p>
                                            <p className="font-bold text-[#3f2d28] mt-0.5">{apt.roomsCount} Phòng</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-5 pt-3 border-t border-[#fcd5ce]/30">
                                <Link 
                                    href={`/admin/rooms?building=${encodeURIComponent(apt.name)}`}
                                    className="text-xs font-black text-[#ff385c] hover:underline"
                                >
                                    Xem danh sách phòng &rarr;
                                </Link>

                                <button
                                    onClick={() => handleDeleteApartment(apt.id, apt.name)}
                                    className="h-8 w-8 rounded-full bg-transparent hover:bg-red-50 text-[#caa79a] hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer"
                                    title="Xóa tòa nhà"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Modal Dialog */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f2d28]/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-[#fcd5ce] shadow-2xl animate-in scale-in duration-200">
                            
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-[#fff8f6] to-[#f9dcc4]/30 px-6 py-4 flex items-center justify-between border-b border-[#fcd5ce]/30">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffb5a7] text-[#ff385c]">
                                        <Building2 className="h-4.5 w-4.5" />
                                    </div>
                                    <h3 className="text-sm font-black text-[#3f2d28]">Thêm apartment mới</h3>
                                </div>
                                <button 
                                    onClick={() => setIsCreateOpen(false)}
                                    className="h-7 w-7 rounded-full hover:bg-[#fcd5ce]/40 flex items-center justify-center text-[#7d5f55] hover:text-[#ff385c] transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleCreateApartment} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Tên tòa nhà *</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ví dụ: Tòa nhà Harmony"
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] focus:ring-2 focus:ring-[#fec89a]/30 transition-all bg-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Địa chỉ tòa nhà *</label>
                                    <input 
                                        type="text" 
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Số nhà, tên đường, quận, thành phố..."
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] focus:ring-2 focus:ring-[#fec89a]/30 transition-all bg-white"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#5b463f] block">Số tầng</label>
                                        <input 
                                            type="number" 
                                            value={floors}
                                            onChange={(e) => setFloors(Number(e.target.value))}
                                            min="1"
                                            className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#5b463f] block">Số lượng phòng</label>
                                        <input 
                                            type="number" 
                                            value={roomsCount}
                                            onChange={(e) => setRoomsCount(Number(e.target.value))}
                                            min="1"
                                            className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Trạng thái vận hành</label>
                                    <select 
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as 'active' | 'maintenance')}
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all bg-white"
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="maintenance">Bảo trì</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Mô tả chi tiết</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Nhập mô tả thêm về tòa nhà (tiện ích, hầm đỗ xe, chính sách, v.v.)..."
                                        rows={3}
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-3 border-t border-[#fcd5ce]/30">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreateOpen(false)}
                                        className="px-4 py-2 rounded-lg border border-[#fcd5ce] hover:bg-[#fff8f6] text-[#7d5f55] text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-5 py-2 rounded-lg bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                        Thêm mới
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

'use client';

import React, { useState } from 'react';
import { use } from 'react';
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
import { useApartmentStore } from '@/features/apartment/store/apartment-store';
import { useRoomStore } from '@/features/room/store/room-store';
import { toast } from 'sonner';
import { 
    Building2, MapPin, Layers, DoorOpen, ArrowLeft, Edit3, Trash2, 
    Calendar, CheckCircle, Clock, AlertTriangle, ShieldCheck, Users, 
    Receipt, UserCheck, X, CheckCircle2 
} from 'lucide-react';

interface Params {
    id: string;
}

export default function ApartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const { apartments, updateApartment, deleteApartment } = useApartmentStore();
    const { rooms } = useRoomStore();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const apartment = apartments.find((a) => a.id === id);

    // Edit form states
    const [name, setName] = useState(apartment?.name || '');
    const [address, setAddress] = useState(apartment?.address || '');
    const [floors, setFloors] = useState(apartment?.floors || 5);
    const [roomsCount, setRoomsCount] = useState(apartment?.roomsCount || 20);
    const [status, setStatus] = useState<'active' | 'maintenance'>(apartment?.status || 'active');
    const [description, setDescription] = useState(apartment?.description || '');

    if (!apartment) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center space-y-4">
                    <AlertTriangle className="h-12 w-12 text-[#ff385c] mx-auto" />
                    <h3 className="text-lg font-black text-[#3f2d28]">Không tìm thấy apartment</h3>
                    <p className="text-xs text-[#caa79a]">Tòa nhà này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
                    <Link 
                        href="/admin/apartments"
                        className="inline-flex items-center gap-1 text-xs font-black text-[#ff385c] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    // Filter rooms belonging to this building
    // The building names in Room Store are e.g., "Tòa nhà A"
    // Our mock apartments have e.g., "Tòa nhà Harmony"
    // Let's match by comparing room.buildingName with apartment.name
    const associatedRooms = rooms.filter(
        (room) => room.buildingName.toLowerCase().includes(apartment.name.toLowerCase()) || 
                  apartment.name.toLowerCase().includes(room.buildingName.toLowerCase())
    );

    const occupiedCount = associatedRooms.filter((r) => r.status === 'occupied').length;
    const emptyCount = associatedRooms.filter((r) => r.status === 'vacant').length;
    const maintenanceCount = associatedRooms.filter((r) => r.status === 'maintenance').length;
    const occupancyRate = associatedRooms.length > 0 
        ? Math.round((occupiedCount / associatedRooms.length) * 100) 
        : 85; // fallback mock rate for initial pre-loaded apartments

    const handleUpdateApartment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address) {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc.');
            return;
        }

        updateApartment(apartment.id, {
            name,
            address,
            floors: Number(floors),
            roomsCount: Number(roomsCount),
            status,
            description,
        });

        setIsEditOpen(false);
        toast.success('Đã lưu các thay đổi cho tòa nhà.');
    };

    const handleToggleMaintenance = () => {
        const nextStatus = apartment.status === 'active' ? 'maintenance' : 'active';
        updateApartment(apartment.id, { status: nextStatus });
        if (nextStatus === 'maintenance') {
            toast.warning('Đã chuyển trạng thái tòa nhà sang Bảo trì.');
        } else {
            toast.success('Đã chuyển trạng thái tòa nhà sang Hoạt động.');
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6 relative">
                
                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5">
                        <Link 
                            href="/admin/apartments" 
                            className="h-8 w-8 rounded-full border border-[#fcd5ce] bg-white text-[#7d5f55] hover:text-[#ff385c] flex items-center justify-center shadow-sm transition-all"
                            title="Quay lại"
                        >
                            <ArrowLeft className="h-4.5 w-4.5" />
                        </Link>
                        <Breadcrumb>
                            <BreadcrumbList className="text-sm text-[#8f6f64]">
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild className="hover:text-[#5b463f] transition-colors">
                                        <Link href="/admin">Admin</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild className="hover:text-[#5b463f] transition-colors">
                                        <Link href="/admin/apartments">Apartments</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-semibold text-[#3f2d28]">{apartment.name}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        <button
                            onClick={handleToggleMaintenance}
                            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                apartment.status === 'active'
                                    ? 'border-[#caa79a] bg-white text-[#7d5f55] hover:bg-[#fff8f6]'
                                    : 'border-[#ff385c] bg-[#ff385c]/10 text-[#ff385c] hover:bg-[#ff385c]/20'
                            }`}
                        >
                            {apartment.status === 'active' ? 'Chuyển bảo trì' : 'Kích hoạt lại'}
                        </button>
                        
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <Edit3 className="h-4 w-4" />
                            Chỉnh sửa tòa nhà
                        </button>
                    </div>
                </div>

                {/* Building Main Info & Profile */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: General Info Card */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#fcd5ce]/60 shadow-sm space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffb5a7] text-[#ff385c] shrink-0 shadow-inner">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div className="space-y-1.5 min-w-0">
                                <h2 className="text-xl font-black text-[#3f2d28] leading-tight truncate">{apartment.name}</h2>
                                <div className="flex items-start gap-1 text-xs text-[#8f6f64]">
                                    <MapPin className="h-4 w-4 text-[#ff385c] shrink-0 mt-0.5" />
                                    <span>{apartment.address}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-[#5b463f] uppercase tracking-wider">Mô tả về tòa nhà</h4>
                            <p className="text-xs text-[#9d786d] leading-relaxed">
                                {apartment.description || 'Chưa có thông tin mô tả chi tiết cho khu căn hộ này.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2">
                            <div className="p-4 rounded-2xl bg-[#fff8f6]/50 border border-[#fcd5ce]/30 flex flex-col justify-between">
                                <p className="text-[10px] font-bold text-[#caa79a] uppercase leading-none">Số tầng</p>
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-xl font-black text-[#3f2d28]">{apartment.floors}</span>
                                    <span className="text-[10px] text-[#8f6f64] font-medium">Tầng</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#fff8f6]/50 border border-[#fcd5ce]/30 flex flex-col justify-between">
                                <p className="text-[10px] font-bold text-[#caa79a] uppercase leading-none">Tổng số phòng</p>
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-xl font-black text-[#3f2d28]">{apartment.roomsCount}</span>
                                    <span className="text-[10px] text-[#8f6f64] font-medium">Phòng</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#fff8f6]/50 border border-[#fcd5ce]/30 flex flex-col justify-between">
                                <p className="text-[10px] font-bold text-[#caa79a] uppercase leading-none">Tỉ lệ lấp đầy</p>
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-xl font-black text-[#ff385c]">{occupancyRate}%</span>
                                    <span className="text-[10px] text-[#8f6f64] font-medium">Đang thuê</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Performance Stats Panel */}
                    <div className="bg-white rounded-3xl p-6 border border-[#fcd5ce]/60 shadow-sm flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-[#3f2d28] pb-3 border-b border-[#fcd5ce]/30 flex items-center gap-1.5">
                                <ShieldCheck className="h-4.5 w-4.5 text-[#ff385c]" />
                                Tình trạng vận hành
                            </h3>
                            
                            <div className="space-y-3.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-[#8f6f64] font-medium">Trạng thái tòa nhà</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        apartment.status === 'active' 
                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                        {apartment.status === 'active' ? 'Hoạt động tốt' : 'Bảo trì sửa chữa'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-[#8f6f64] font-medium">Phòng đang cho thuê</span>
                                    <span className="font-bold text-[#3f2d28]">{associatedRooms.length > 0 ? occupiedCount : 42} Phòng</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-[#8f6f64] font-medium">Phòng đang trống</span>
                                    <span className="font-bold text-[#3f2d28]">{associatedRooms.length > 0 ? emptyCount : 6} Phòng</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-[#8f6f64] font-medium">Ngày thêm hệ thống</span>
                                    <span className="font-bold text-[#3f2d28]">{apartment.createdAt}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#fff8f6] to-[#f9dcc4]/20 border border-[#fcd5ce]/40 space-y-1">
                            <span className="text-[10px] font-bold text-[#caa79a] uppercase leading-none block">Doanh thu tháng (ước tính)</span>
                            <span className="text-xl font-black text-[#3f2d28] block pt-1">
                                {associatedRooms.length > 0 
                                    ? (occupiedCount * 5200000).toLocaleString('vi-VN') 
                                    : (42 * 5200000).toLocaleString('vi-VN')} ₫
                            </span>
                        </div>
                    </div>
                </div>

                {/* Rooms List Section specifically for this building */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-black text-[#3f2d28] flex items-center gap-2">
                            <DoorOpen className="h-5 w-5 text-[#ff385c]" />
                            Phòng thuộc tòa nhà ({associatedRooms.length > 0 ? associatedRooms.length : apartment.roomsCount})
                        </h3>
                        <Link 
                            href={`/admin/rooms?building=${encodeURIComponent(apartment.name)}`}
                            className="text-xs font-black text-[#ff385c] hover:underline"
                        >
                            Quản lý chi tiết &rarr;
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl border border-[#fcd5ce]/60 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-gradient-to-r from-[#fff8f6] to-[#f9dcc4]/20 border-b border-[#fcd5ce]/40 text-[#5b463f] font-black uppercase tracking-wider text-[10px]">
                                        <th className="py-3.5 px-5">Số phòng</th>
                                        <th className="py-3.5 px-4">Tầng</th>
                                        <th className="py-3.5 px-4">Diện tích</th>
                                        <th className="py-3.5 px-4">Giá thuê</th>
                                        <th className="py-3.5 px-4">Khách đang thuê</th>
                                        <th className="py-3.5 px-4">Trạng thái</th>
                                        <th className="py-3.5 px-5 text-right">Hợp đồng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#fcd5ce]/30">
                                    {associatedRooms.length > 0 ? (
                                        associatedRooms.map((room) => (
                                            <tr key={room.id} className="hover:bg-[#fff8f6]/30 transition-colors group">
                                                <td className="py-4 px-5 font-black text-[#3f2d28] text-sm group-hover:text-[#ff385c] transition-colors">
                                                    Phòng {room.roomNumber}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-[#8f6f64]">
                                                    Tầng {room.floor}
                                                </td>
                                                <td className="py-4 px-4 text-[#5b463f]">
                                                    {room.area} m²
                                                </td>
                                                <td className="py-4 px-4 font-bold text-[#3f2d28]">
                                                    {room.price.toLocaleString('vi-VN')} ₫
                                                </td>
                                                <td className="py-4 px-4">
                                                    {room.currentTenant ? (
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-[#3f2d28]">{room.currentTenant.name}</p>
                                                            <p className="text-[10px] text-[#caa79a]">{room.currentTenant.phone}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#caa79a] font-medium">Trống</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        room.status === 'occupied' 
                                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                                            : room.status === 'vacant'
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                    }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                            room.status === 'occupied' ? 'bg-green-500' : room.status === 'vacant' ? 'bg-blue-500' : 'bg-red-500'
                                                        }`} />
                                                        {room.status === 'occupied' ? 'Đang thuê' : room.status === 'vacant' ? 'Trống' : 'Bảo trì'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-right font-black text-[#ff385c]">
                                                    {room.currentTenant ? (
                                                        <Link href={`/admin/contracts?id=${room.currentTenant.contractId}`} className="hover:underline">
                                                            {room.currentTenant.contractId} &rarr;
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[#caa79a] font-medium">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        // Standard Fallback Mock list if Room store is empty for this building name
                                        [101, 102, 201, 202, 301].map((num) => (
                                            <tr key={num} className="hover:bg-[#fff8f6]/30 transition-colors group">
                                                <td className="py-4 px-5 font-black text-[#3f2d28] text-sm group-hover:text-[#ff385c] transition-colors">
                                                    Phòng {num}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-[#8f6f64]">
                                                    Tầng {Math.floor(num / 100)}
                                                </td>
                                                <td className="py-4 px-4 text-[#5b463f]">
                                                    25 m²
                                                </td>
                                                <td className="py-4 px-4 font-bold text-[#3f2d28]">
                                                    5,200,000 ₫
                                                </td>
                                                <td className="py-4 px-4">
                                                    {num !== 102 ? (
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-[#3f2d28]">Nguyễn Minh Tuấn</p>
                                                            <p className="text-[10px] text-[#caa79a]">0912345678</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#caa79a] font-medium">Trống</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        num !== 102
                                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                            num !== 102 ? 'bg-green-500' : 'bg-blue-500'
                                                        }`} />
                                                        {num !== 102 ? 'Đang thuê' : 'Trống'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-right font-black text-[#ff385c]">
                                                    {num !== 102 ? (
                                                        <span className="cursor-pointer hover:underline">CON-{num} &rarr;</span>
                                                    ) : (
                                                        <span className="text-[#caa79a] font-medium">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Edit Modal Dialog */}
                {isEditOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f2d28]/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-[#fcd5ce] shadow-2xl animate-in scale-in duration-200">
                            
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-[#fff8f6] to-[#f9dcc4]/30 px-6 py-4 flex items-center justify-between border-b border-[#fcd5ce]/30">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffb5a7] text-[#ff385c]">
                                        <Building2 className="h-4.5 w-4.5" />
                                    </div>
                                    <h3 className="text-sm font-black text-[#3f2d28]">Chỉnh sửa thông tin tòa nhà</h3>
                                </div>
                                <button 
                                    onClick={() => setIsEditOpen(false)}
                                    className="h-7 w-7 rounded-full hover:bg-[#fcd5ce]/40 flex items-center justify-center text-[#7d5f55] hover:text-[#ff385c] transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleUpdateApartment} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Tên tòa nhà *</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all bg-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Địa chỉ tòa nhà *</label>
                                    <input 
                                        type="text" 
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all bg-white"
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
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all bg-white font-medium"
                                    >
                                        <option value="active">Hoạt động tốt</option>
                                        <option value="maintenance">Bảo trì sửa chữa</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f] block">Mô tả chi tiết</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full text-xs border border-[#fcd5ce] rounded-xl px-4 py-2.5 outline-none focus:border-[#ff385c] transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-3 border-t border-[#fcd5ce]/30">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditOpen(false)}
                                        className="px-4 py-2 rounded-lg border border-[#fcd5ce] hover:bg-[#fff8f6] text-[#7d5f55] text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-5 py-2 rounded-lg bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                        Lưu thay đổi
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

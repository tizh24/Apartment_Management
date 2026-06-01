import React from 'react';
import { Room } from '../types/room.type';
import { RoomStatusBadge } from './room-status-badge';
import { Maximize2, User, Landmark, Layers, Eye } from 'lucide-react';

interface RoomCardProps {
    room: Room;
    onViewDetail: (id: string) => void;
    onEdit: (room: Room) => void;
}

export function RoomCard({ room, onViewDetail, onEdit }: RoomCardProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const defaultImage = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';
    const roomImg = room.images && room.images.length > 0 ? room.images[0] : defaultImage;

    return (
        <div
            onClick={() => onViewDetail(room.id)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#fcd5ce] bg-white shadow-sm hover:shadow-lg transition-all hover:border-[#ffb5a7] duration-300 cursor-pointer"
        >
            {/* Image Overlay */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                    src={roomImg}
                    alt={`Phòng ${room.roomNumber}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Building Badge */}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    <Landmark className="h-3 w-3 text-[#ffb5a7]" />
                    {room.buildingName}
                </span>

                {/* Status Badge */}
                <div className="absolute right-3 top-3">
                    <RoomStatusBadge status={room.status} />
                </div>
            </div>

            {/* Content Details */}
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base font-bold text-[#3f2d28] group-hover:text-[#ff385c] transition-colors">
                        Phòng P.{room.roomNumber}
                    </h3>
                    <p className="text-base font-extrabold text-[#ff385c]">
                        {formatCurrency(room.price)}
                        <span className="text-[10px] font-medium text-[#8f6f64] ml-0.5">/tháng</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#8f6f64] mb-3">
                    <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        Tầng {room.floor}
                    </span>
                    <span className="h-3 w-[1px] bg-[#fcd5ce]" />
                    <span className="inline-flex items-center gap-1">
                        <Maximize2 className="h-3.5 w-3.5" />
                        {room.area} m²
                    </span>
                </div>

                {/* Tenant / Status description */}
                <div className="mt-auto border-t border-[#fcd5ce]/30 pt-3">
                    {room.status === 'occupied' && room.currentTenant ? (
                        <div className="flex items-center justify-between text-xs text-[#5b463f]">
                            <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-[#ff385c]" />
                                <span>Khách: <strong className="text-[#3f2d28]">{room.currentTenant.name}</strong></span>
                            </div>
                            <span className="text-[10px] text-[#caa79a]">HĐ hoạt động</span>
                        </div>
                    ) : room.status === 'reserved' ? (
                        <p className="text-xs italic text-[#1565c0]">
                            Đã giữ cọc / chờ nhận phòng
                        </p>
                    ) : room.status === 'maintenance' ? (
                        <p className="text-xs text-orange-600 font-semibold flex items-center gap-1">
                            ⚠️ Đang sửa chữa bảo trì
                        </p>
                    ) : (
                        <p className="text-xs text-[#2e7d32] font-semibold flex items-center gap-1">
                            ✨ Sẵn sàng bàn giao phòng
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Action Overlay (Hover Only) */}
            <div className="absolute inset-0 bg-[#3f2d28]/3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ff385c] text-white px-4 py-2 text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Eye className="h-3.5 w-3.5" />
                    Xem chi tiết
                </span>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoomStore } from '../store/room-store';
import { RoomCard } from './room-card';
import { RoomDetail } from './room-detail';
import { RoomForm } from './room-form';
import { Room, RoomStatus, Tenant } from '../types/room.type';
import {
    Plus, Search, DoorOpen, CheckCircle, Clock,
    Wrench, CalendarRange, Filter, X, Grid, List, Sparkles, Building
} from 'lucide-react';

export function RoomList() {
    const router = useRouter();
    const {
        rooms,
        searchQuery,
        statusFilter,
        buildingFilter,
        selectedRoomId,
        setSearchQuery,
        setStatusFilter,
        setBuildingFilter,
        setSelectedRoomId,
        addRoom,
        updateRoom,
        deleteRoom,
        addUtilityReading,
        updateRoomStatus,
        assignTenant,
        removeTenant
    } = useRoomStore();

    // View states
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    // Compute Stats (DASH-01 requirement aligned)
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
    const vacantRooms = rooms.filter((r) => r.status === 'vacant').length;
    const reservedRooms = rooms.filter((r) => r.status === 'reserved').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Filters and Search (NFR-05 requirement)
    const filteredRooms = rooms.filter((room) => {
        const matchesSearch =
            room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (room.currentTenant && room.currentTenant.name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
        const matchesBuilding = buildingFilter === 'all' || room.buildingName === buildingFilter;

        return matchesSearch && matchesStatus && matchesBuilding;
    });

    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

    const handleFormSubmit = (roomData: any) => {
        if (editingRoom) {
            updateRoom(editingRoom.id, roomData);
        } else {
            addRoom(roomData);
        }
        setIsFormOpen(false);
        setEditingRoom(null);
    };

    const handleEditClick = (room: Room) => {
        setEditingRoom(room);
        setIsFormOpen(true);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    return (
        <div className="space-y-6">

            {/* DASH-01: Summary widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

                {/* Tổng số phòng */}
                <div className="rounded-2xl border border-[#fcd5ce] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Tổng số phòng</span>
                        <div className="h-7 w-7 rounded-lg bg-[#fff8f6] text-[#caa79a] flex items-center justify-center border border-[#fcd5ce]/30">
                            <DoorOpen className="h-4 w-4 text-[#8f6f64]" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#3f2d28]">{totalRooms}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Hiệu suất: {occupancyRate}%</p>
                </div>

                {/* Đang thuê */}
                <div className="rounded-2xl border border-[#ffcdd2] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Đang thuê</span>
                        <div className="h-7 w-7 rounded-lg bg-[#ffebee] text-[#ff385c] flex items-center justify-center border border-[#ffcdd2]/30">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#ff385c]">{occupiedRooms}</p>
                    <p className="text-[10px] text-[#b89184] mt-0.5">Đã lấp đầy</p>
                </div>

                {/* Phòng trống */}
                <div className="rounded-2xl border border-[#c8e6c9] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Phòng trống</span>
                        <div className="h-7 w-7 rounded-lg bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center border border-[#c8e6c9]/30">
                            <DoorOpen className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#2e7d32]">{vacantRooms}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Sẵn sàng đón khách</p>
                </div>

                {/* Đã giữ chỗ */}
                <div className="rounded-2xl border border-[#bbdefb] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Đã giữ chỗ</span>
                        <div className="h-7 w-7 rounded-lg bg-[#e3f2fd] text-[#1565c0] flex items-center justify-center border border-[#bbdefb]/30">
                            <CalendarRange className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#1565c0]">{reservedRooms}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Khách đã cọc trước</p>
                </div>

                {/* Đang bảo trì */}
                <div className="rounded-2xl border border-[#ffe0b2] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider">Bảo trì</span>
                        <div className="h-7 w-7 rounded-lg bg-[#fff3e0] text-[#ef6c00] flex items-center justify-center border border-[#ffe0b2]/30">
                            <Wrench className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#ef6c00]">{maintenanceRooms}</p>
                    <p className="text-[10px] text-[#caa79a] mt-0.5">Cần sửa chữa sửa soạn</p>
                </div>

            </div>

            {/* Filter and Search Section */}
            <div className="rounded-2xl border border-[#fcd5ce] bg-[#fff8f6] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">

                {/* Search Bar */}
                <div className="relative w-full md:w-80 flex items-center bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 shadow-inner focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
                    <Search className="h-4 w-4 text-[#caa79a] mr-2 shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Số phòng, tên khách, tòa nhà..."
                        className="w-full bg-transparent text-xs text-[#3f2d28] placeholder-[#b89184] outline-none"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-[#caa79a] hover:text-[#ff385c]">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Category Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">

                    {/* Tòa nhà Filter */}
                    <div className="flex items-center gap-1 bg-white border border-[#fcd5ce] rounded-xl px-3 py-1.5 text-xs text-[#3f2d28] font-medium shadow-sm">
                        <Building className="h-3.5 w-3.5 text-[#ff385c]" />
                        <select
                            value={buildingFilter}
                            onChange={(e) => setBuildingFilter(e.target.value)}
                            className="bg-transparent border-none outline-none text-[#3f2d28] cursor-pointer"
                        >
                            <option value="all">Tất cả Tòa nhà</option>
                            <option value="Tòa nhà A">Tòa nhà A</option>
                            <option value="Tòa nhà B">Tòa nhà B</option>
                        </select>
                    </div>

                    {/* Trạng thái Filter */}
                    <div className="flex items-center gap-1 bg-white border border-[#fcd5ce] rounded-xl px-3 py-1.5 text-xs text-[#3f2d28] font-medium shadow-sm">
                        <Filter className="h-3.5 w-3.5 text-[#ff385c]" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none outline-none text-[#3f2d28] cursor-pointer"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="vacant">Trống</option>
                            <option value="occupied">Đang thuê</option>
                            <option value="reserved">Đã giữ chỗ</option>
                            <option value="maintenance">Bảo trì</option>
                        </select>
                    </div>

                    {/* View Switchers */}
                    <div className="flex items-center border border-[#fcd5ce] rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#ff385c] text-white' : 'text-[#8f6f64] hover:bg-[#fff8f6]'
                                }`}
                            title="Hiển thị dạng thẻ"
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#ff385c] text-white' : 'text-[#8f6f64] hover:bg-[#fff8f6]'
                                }`}
                            title="Hiển thị dạng bảng"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>

                </div>

            </div>

            {/* Room Content Grid/List */}
            {filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-[#fcd5ce] p-6">
                    <DoorOpen className="h-14 w-14 text-[#caa79a] mb-3 animate-bounce" />
                    <p className="text-base font-bold text-[#3f2d28]">Không tìm thấy phòng phù hợp</p>
                    <p className="text-xs text-[#8f6f64] max-w-sm mt-1 mb-4">
                        Thử thay đổi bộ lọc hoặc nhập từ khóa tìm kiếm khác để hiển thị phòng.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                            setBuildingFilter('all');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-[#ff385c] bg-[#fff8f6] border border-[#fcd5ce] rounded-xl hover:bg-[#fcd5ce]/30 transition-all cursor-pointer"
                    >
                        Xóa tất cả bộ lọc
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid view: Premium Airbnb property card style */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredRooms.map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            onViewDetail={(id) => router.push('/admin/rooms/' + id)}
                            onEdit={handleEditClick}
                        />
                    ))}
                </div>
            ) : (
                /* List view: Detailed administrative table */
                <div className="rounded-3xl border border-[#fcd5ce] bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead className="bg-[#fff8f6] text-[#5b463f] border-b border-[#fcd5ce] font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Số phòng</th>
                                    <th className="px-6 py-4">Tòa nhà</th>
                                    <th className="px-6 py-4">Tầng số</th>
                                    <th className="px-6 py-4">Diện tích</th>
                                    <th className="px-6 py-4">Giá thuê / tháng</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4">Khách đang thuê</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#fcd5ce]/40 text-[#3f2d28]">
                                {filteredRooms.map((room) => (
                                    <tr
                                        key={room.id}
                                        onClick={() => router.push('/admin/rooms/' + room.id)}
                                        className="hover:bg-[#fff8f6]/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-sm text-[#ff385c]">P.{room.roomNumber}</td>
                                        <td className="px-6 py-4 font-medium">{room.buildingName}</td>
                                        <td className="px-6 py-4">{room.floor}</td>
                                        <td className="px-6 py-4">{room.area} m²</td>
                                        <td className="px-6 py-4 font-bold">{formatCurrency(room.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${room.status === 'vacant' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    room.status === 'occupied' ? 'bg-red-50 text-[#ff385c] border-red-200' :
                                                        room.status === 'reserved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                {room.status === 'vacant' && 'Trống'}
                                                {room.status === 'occupied' && 'Đang thuê'}
                                                {room.status === 'reserved' && 'Giữ chỗ'}
                                                {room.status === 'maintenance' && 'Bảo trì'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {room.status === 'occupied' && room.currentTenant ? (
                                                <span className="font-bold text-[#3f2d28]">{room.currentTenant.name}</span>
                                            ) : (
                                                <span className="text-[#caa79a] italic">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => router.push('/admin/rooms/' + room.id)}
                                                    className="p-1.5 hover:text-[#ff385c] hover:bg-[#fff8f6] rounded-lg transition-colors border border-transparent hover:border-[#fcd5ce]"
                                                    title="Xem chi tiết"
                                                >
                                                    <Search className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(room)}
                                                    className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                    title="Sửa phòng"
                                                >
                                                    <List className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Room / Edit Room dialog form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <RoomForm
                            room={editingRoom}
                            onSubmit={handleFormSubmit}
                            onCancel={() => {
                                setIsFormOpen(false);
                                setEditingRoom(null);
                            }}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}

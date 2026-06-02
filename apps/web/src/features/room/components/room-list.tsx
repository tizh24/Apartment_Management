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
import { Pagination } from '@/components/ui/pagination';
import { CustomSelect } from '@/components/ui/custom-select';

const BUILDING_OPTIONS = [
    { value: 'all', label: 'Tất cả Tòa nhà' },
    { value: 'Tòa nhà A', label: 'Tòa nhà A' },
    { value: 'Tòa nhà B', label: 'Tòa nhà B' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'vacant', label: 'Trống' },
    { value: 'occupied', label: 'Đang thuê' },
    { value: 'reserved', label: 'Đã giữ chỗ' },
    { value: 'maintenance', label: 'Bảo trì' },
];

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

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset pagination on search or filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, buildingFilter]);

    // Paginated items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

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
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Tổng số phòng</span>
                    <p className="text-2xl font-black text-[#3f2d28]">{totalRooms}</p>
                </div>

                {/* Đang thuê */}
                <div className="rounded-2xl border border-[#ffcdd2] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Đang thuê</span>
                    <p className="text-2xl font-black text-[#ff385c]">{occupiedRooms}</p>
                </div>

                {/* Phòng trống */}
                <div className="rounded-2xl border border-[#c8e6c9] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Phòng trống</span>
                    <p className="text-2xl font-black text-[#2e7d32]">{vacantRooms}</p>
                </div>

                {/* Đã giữ chỗ */}
                <div className="rounded-2xl border border-[#bbdefb] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Đã giữ chỗ</span>
                    <p className="text-2xl font-black text-[#1565c0]">{reservedRooms}</p>
                </div>

                {/* Đang bảo trì */}
                <div className="rounded-2xl border border-[#ffe0b2] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[11px] font-bold text-[#8f6f64] uppercase tracking-wider block mb-1">Bảo trì</span>
                    <p className="text-2xl font-black text-[#ef6c00]">{maintenanceRooms}</p>
                </div>

            </div>

            {/* Filter and Search Section (Google Drive style: flat, borderless) */}
            <div className="py-3 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Category Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start">

                    {/* Tòa nhà Filter */}
                    <CustomSelect
                        value={buildingFilter}
                        onChange={setBuildingFilter}
                        options={BUILDING_OPTIONS}
                        icon={Building}
                    />

                    {/* Trạng thái Filter */}
                    <CustomSelect
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={STATUS_OPTIONS}
                        icon={Filter}
                    />

                </div>

                {/* Search Bar & Switcher Toggle */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80 flex items-center bg-[#fff8f6] border border-[#fcd5ce]/40 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-[#ff385c] focus-within:ring-1 focus-within:ring-[#ff385c] transition-all">
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
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-none p-6">
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
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {paginatedRooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onViewDetail={(id) => router.push('/admin/rooms/' + id)}
                                onEdit={handleEditClick}
                            />
                        ))}
                    </div>
                    <Pagination
                        totalItems={filteredRooms.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            ) : (
                /* List view: Detailed administrative table (Google Drive style) */
                <div className="space-y-4">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead className="text-[#8f6f64] border-b border-[#fcd5ce] font-bold uppercase tracking-wider text-[10px]">
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
                            <tbody className="text-[#3f2d28]">
                                {paginatedRooms.map((room) => (
                                    <tr
                                        key={room.id}
                                        onClick={() => router.push('/admin/rooms/' + room.id)}
                                        className="hover:bg-[#fff8f6]/70 border-b border-[#fcd5ce]/30 cursor-pointer transition-all duration-200"
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
                    <Pagination
                        totalItems={filteredRooms.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
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

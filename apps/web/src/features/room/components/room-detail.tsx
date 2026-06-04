import React, { useState } from 'react';
import { Room, RoomStatus, Tenant } from '../types/room.type';
import { RoomStatusBadge } from './room-status-badge';
import { UtilityHistory } from './utility-history';
import { UtilityInputForm } from './utility-input-form';
import { TenantHistory } from './tenant-history';
import { 
    Maximize2, Landmark, Layers, Sparkles, Plus, Check, 
    Trash2, Edit, User, Phone, Mail, Calendar, Coins, 
    Lightbulb, Droplets, ArrowLeft, KeyRound, LogOut, CheckCircle, X
} from 'lucide-react';

interface RoomDetailProps {
    room: Room;
    onBack: () => void;
    onEdit: (room: Room) => void;
    onDelete: (id: string) => void;
    onAddUtilityReading: (roomId: string, readingData: any) => void;
    onUpdateStatus: (roomId: string, status: RoomStatus) => void;
    onAssignTenant: (roomId: string, tenant: Tenant) => void;
    onRemoveTenant: (roomId: string) => void;
}

export function RoomDetail({
    room,
    onBack,
    onEdit,
    onDelete,
    onAddUtilityReading,
    onUpdateStatus,
    onAssignTenant,
    onRemoveTenant
}: RoomDetailProps) {
    const [activeTab, setActiveTab] = useState<'tenant' | 'utility' | 'history'>('tenant');
    const [showUtilityForm, setShowUtilityForm] = useState(false);
    const [showAssignTenantForm, setShowAssignTenantForm] = useState(false);

    // Tenant assign form states
    const [tenantName, setTenantName] = useState('');
    const [tenantPhone, setTenantPhone] = useState('');
    const [tenantEmail, setTenantEmail] = useState('');
    const [tenantStartDate, setTenantStartDate] = useState('');
    const [tenantEndDate, setTenantEndDate] = useState('');
    const [tenantDeposit, setTenantDeposit] = useState(room.price);
    const [assignError, setAssignError] = useState('');

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const handleAssignTenantSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAssignError('');

        if (!tenantName.trim() || !tenantPhone.trim() || !tenantStartDate || !tenantEndDate) {
            setAssignError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
            return;
        }

        const newTenant: Tenant = {
            id: `tenant-${Date.now()}`,
            name: tenantName,
            phone: tenantPhone,
            email: tenantEmail || 'chua-cap-nhat@gmail.com',
            startDate: tenantStartDate,
            endDate: tenantEndDate,
            deposit: tenantDeposit,
            contractId: `CON-${room.roomNumber}-${String(Date.now()).slice(-4)}`
        };

        onAssignTenant(room.id, newTenant);
        setShowAssignTenantForm(false);
        
        // Reset form
        setTenantName('');
        setTenantPhone('');
        setTenantEmail('');
        setTenantStartDate('');
        setTenantEndDate('');
        setTenantDeposit(room.price);
    };

    const defaultImage = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';
    const roomImg = room.images && room.images.length > 0 ? room.images[0] : defaultImage;

    return (
        <div className="space-y-6">
            {/* Header / Back */}
            <div className="flex items-center justify-between pb-3 border-b border-[#fcd5ce]">
                <button
                    onClick={onBack}
                    className="inline-flex items-center justify-center h-8 w-8 text-[#5b463f] hover:text-[#ff385c] bg-white border border-[#fcd5ce] rounded-xl hover:shadow-sm transition-all cursor-pointer hover:bg-[#fff8f6]"
                    title="Quay lại danh sách"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(room)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#5b463f] hover:text-[#ff385c] bg-white border border-[#fcd5ce] px-3 py-1.5 rounded-xl hover:shadow-sm transition-all"
                    >
                        <Edit className="h-3.5 w-3.5" />
                        Sửa phòng
                    </button>
                    <button
                        onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa phòng P.${room.roomNumber}?`)) {
                                onDelete(room.id);
                            }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] px-3 py-1.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa phòng
                    </button>
                </div>
            </div>

            {/* Room Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Thumbnail, Basic details, Amenities */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Visual Card */}
                    <div className="rounded-2xl border border-[#fcd5ce] bg-white overflow-hidden shadow-sm">
                        <div className="relative aspect-video w-full">
                            <img src={roomImg} alt={`Phòng ${room.roomNumber}`} className="w-full h-full object-cover" />
                            <div className="absolute right-3 top-3">
                                <RoomStatusBadge status={room.status} />
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <h1 className="text-xl font-black text-[#3f2d28]">Phòng P.{room.roomNumber}</h1>
                                <p className="text-sm font-bold text-[#ff385c] mt-0.5">
                                    {formatCurrency(room.price)}
                                    <span className="text-xs font-normal text-[#8f6f64]">/tháng</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#fcd5ce]/30 text-xs text-[#5b463f]">
                                <div className="flex items-center gap-1.5">
                                    <Landmark className="h-4 w-4 text-[#caa79a]" />
                                    <span>Khu: <strong>{room.buildingName}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Layers className="h-4 w-4 text-[#caa79a]" />
                                    <span>Tầng số: <strong>{room.floor}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5 col-span-2">
                                    <Maximize2 className="h-4 w-4 text-[#caa79a]" />
                                    <span>Diện tích: <strong>{room.area} m²</strong></span>
                                </div>
                            </div>

                            {room.description && (
                                <p className="text-xs text-[#8f6f64] leading-relaxed pt-3 border-t border-[#fcd5ce]/30 italic">
                                    "{room.description}"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Amenities Checklist */}
                    <div className="rounded-2xl border border-[#fcd5ce] bg-white p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-[#3f2d28] uppercase tracking-wider mb-3">Tiện ích trong phòng</h3>
                        <div className="flex flex-wrap gap-2">
                            {room.amenities.length > 0 ? (
                                room.amenities.map((amenity) => (
                                    <span
                                        key={amenity}
                                        className="inline-flex items-center gap-1 rounded-lg bg-[#fff8f6] border border-[#fcd5ce]/40 px-2.5 py-1 text-xs font-medium text-[#ff385c]"
                                    >
                                        <Check className="h-3 w-3 stroke-[3px]" />
                                        {amenity}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-[#8f6f64] italic">Chưa có tiện ích ghi nhận.</p>
                            )}
                        </div>
                    </div>

                    {/* Change status utility */}
                    <div className="rounded-2xl border border-[#fcd5ce] bg-white p-5 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold text-[#3f2d28] uppercase tracking-wider">Cập nhật nhanh trạng thái</h3>
                        <div className="flex gap-2">
                            {(['vacant', 'reserved', 'maintenance'] as RoomStatus[]).map((statusVal) => {
                                if (room.status === 'occupied' && statusVal !== 'occupied') return null;
                                return (
                                    <button
                                        key={statusVal}
                                        onClick={() => onUpdateStatus(room.id, statusVal)}
                                        className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold text-center cursor-pointer transition-all ${
                                            room.status === statusVal
                                                ? 'bg-[#ff385c] text-white border-[#ff385c] shadow-sm'
                                                : 'bg-white border-[#fcd5ce] text-[#5b463f] hover:bg-[#fff8f6]'
                                        }`}
                                    >
                                        {statusVal === 'vacant' && 'Trống'}
                                        {statusVal === 'reserved' && 'Giữ chỗ'}
                                        {statusVal === 'maintenance' && 'Bảo trì'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* Right Side: Navigation Tabs, Detailed Sub-features */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-[#fcd5ce] bg-[#fff8f6] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('tenant')}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                activeTab === 'tenant'
                                    ? 'bg-white text-[#ff385c] shadow-sm'
                                    : 'text-[#8f6f64] hover:text-[#5b463f]'
                            }`}
                        >
                            <User className="h-4 w-4" />
                            Khách đang thuê
                        </button>
                        <button
                            onClick={() => setActiveTab('utility')}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                activeTab === 'utility'
                                    ? 'bg-white text-[#ff385c] shadow-sm'
                                    : 'text-[#8f6f64] hover:text-[#5b463f]'
                            }`}
                        >
                            <Lightbulb className="h-4 w-4" />
                            Chỉ số Điện & Nước
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                activeTab === 'history'
                                    ? 'bg-white text-[#ff385c] shadow-sm'
                                    : 'text-[#8f6f64] hover:text-[#5b463f]'
                            }`}
                        >
                            <KeyRound className="h-4 w-4" />
                            Lịch sử thuê phòng
                        </button>
                    </div>

                    {/* Tab Panels */}
                    <div className="p-1">
                        
                        {/* TAB: TENANT */}
                        {activeTab === 'tenant' && (
                            <div className="space-y-4">
                                {room.status === 'occupied' && room.currentTenant ? (
                                    <div className="rounded-2xl border border-[#fcd5ce] bg-white p-6 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#fcd5ce]/50 pb-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffebee] text-[#ff385c]">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[#3f2d28] text-sm">{room.currentTenant.name}</h3>
                                                    <p className="text-[10px] text-[#b89184]">Mã hợp đồng: {room.currentTenant.contractId}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Bạn có chắc muốn thanh lý hợp đồng và trả phòng cho khách ${room.currentTenant?.name}?`)) {
                                                        onRemoveTenant(room.id);
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff385c] bg-[#ffebee] border border-[#ffcdd2] px-2.5 py-1 rounded-lg hover:bg-[#ff385c] hover:text-white transition-colors cursor-pointer"
                                            >
                                                <LogOut className="h-3.5 w-3.5" />
                                                Trả phòng / Thanh lý
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5b463f]">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-[#8f6f64]" />
                                                    <span>Số điện thoại: <strong className="text-[#3f2d28]">{room.currentTenant.phone}</strong></span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-[#8f6f64]" />
                                                    <span>Địa chỉ email: <strong className="text-[#3f2d28]">{room.currentTenant.email}</strong></span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-[#8f6f64]" />
                                                    <span>Thời gian thuê: <strong className="text-[#3f2d28]">{formatDate(room.currentTenant.startDate)} - {formatDate(room.currentTenant.endDate)}</strong></span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Coins className="h-4 w-4 text-[#8f6f64]" />
                                                    <span>Tiền đặt cọc: <strong className="text-[#ff385c]">{formatCurrency(room.currentTenant.deposit)}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : showAssignTenantForm ? (
                                    <form onSubmit={handleAssignTenantSubmit} className="space-y-4 bg-[#fff8f6] p-5 rounded-2xl border border-[#fcd5ce]">
                                        <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-3 mb-2">
                                            <h3 className="text-sm font-bold text-[#3f2d28] uppercase tracking-wider">Đăng ký khách thuê mới</h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowAssignTenantForm(false)}
                                                className="text-[#8f6f64] hover:text-[#ff385c]"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {assignError && (
                                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                                                {assignError}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#5b463f] mb-1 uppercase">Tên khách thuê *</label>
                                                <input
                                                    type="text"
                                                    value={tenantName}
                                                    onChange={(e) => setTenantName(e.target.value)}
                                                    placeholder="Nguyễn Văn A"
                                                    className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-xs outline-none focus:border-[#ff385c]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#5b463f] mb-1 uppercase">Số điện thoại *</label>
                                                <input
                                                    type="text"
                                                    value={tenantPhone}
                                                    onChange={(e) => setTenantPhone(e.target.value)}
                                                    placeholder="09XXXXXXXX"
                                                    className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-xs outline-none focus:border-[#ff385c]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#5b463f] mb-1 uppercase">Email</label>
                                                <input
                                                    type="email"
                                                    value={tenantEmail}
                                                    onChange={(e) => setTenantEmail(e.target.value)}
                                                    placeholder="khachthue@gmail.com"
                                                    className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-xs outline-none focus:border-[#ff385c]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#5b463f] mb-1 uppercase">Tiền đặt cọc (₫) *</label>
                                                <input
                                                    type="number"
                                                    value={tenantDeposit}
                                                    onChange={(e) => setTenantDeposit(Number(e.target.value))}
                                                    className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-xs outline-none focus:border-[#ff385c]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#5b463f] mb-1 uppercase">Ngày bắt đầu *</label>
                                                <input
                                                    type="date"
                                                    value={tenantStartDate}
                                                    onChange={(e) => setTenantStartDate(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-xs outline-none focus:border-[#ff385c]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#5b463f] mb-1 uppercase">Ngày kết thúc *</label>
                                                <input
                                                    type="date"
                                                    value={tenantEndDate}
                                                    onChange={(e) => setTenantEndDate(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-[#fcd5ce] text-xs outline-none focus:border-[#ff385c]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#fcd5ce]/30">
                                            <button
                                                type="button"
                                                onClick={() => setShowAssignTenantForm(false)}
                                                className="px-3.5 py-1.5 text-xs font-semibold text-[#5b463f] rounded-lg border border-[#fcd5ce]"
                                            >
                                                Hủy bỏ
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
                                            >
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Lập hợp đồng
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-2xl border border-[#fcd5ce] p-6">
                                        <User className="h-10 w-10 text-[#caa79a] mb-2 animate-bounce" />
                                        <p className="text-sm font-bold text-[#3f2d28]">Phòng đang trống</p>
                                        <p className="text-xs text-[#8f6f64] max-w-sm mt-1 mb-4">
                                            Hãy lập hợp đồng gán khách thuê để cập nhật tình trạng lấp đầy phòng.
                                        </p>
                                        <button
                                            onClick={() => setShowAssignTenantForm(true)}
                                            className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-xl shadow-md transition-colors cursor-pointer"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Đăng ký khách thuê mới
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: UTILITY */}
                        {activeTab === 'utility' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-[#fcd5ce]/40 pb-2">
                                    <div>
                                        <h3 className="font-bold text-[#3f2d28] text-sm">Chỉ số Điện Nước định kỳ</h3>
                                        <p className="text-[10px] text-[#b89184]">Theo dõi và nhập chỉ số đầu / cuối kỳ thanh toán định kỳ hàng tháng.</p>
                                    </div>
                                    {!showUtilityForm && (
                                        <button
                                            onClick={() => setShowUtilityForm(true)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-xl transition-all cursor-pointer shadow-sm"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Ghi chỉ số mới
                                        </button>
                                    )}
                                </div>

                                {showUtilityForm && (
                                    <UtilityInputForm
                                        latestReading={room.utilityHistory.length > 0 ? room.utilityHistory[0] : null}
                                        onSubmit={(readingData) => {
                                            onAddUtilityReading(room.id, readingData);
                                            setShowUtilityForm(false);
                                        }}
                                        onCancel={() => setShowUtilityForm(false)}
                                    />
                                )}

                                <UtilityHistory history={room.utilityHistory} />
                            </div>
                        )}

                        {/* TAB: TENANT HISTORY */}
                        {activeTab === 'history' && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-[#3f2d28] text-sm">Lịch sử khách từng thuê phòng</h3>
                                    <p className="text-[10px] text-[#b89184]">Danh sách lưu trữ thông tin các khách thuê cũ đã thanh lý hợp đồng.</p>
                                </div>
                                <TenantHistory history={room.tenantHistory} />
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

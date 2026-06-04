import React, { useState, useEffect } from 'react';
import { Room, RoomStatus } from '../types/room.type';
import { Save, X, Plus, AlertCircle, Sparkles } from 'lucide-react';

interface RoomFormProps {
    room?: Room | null; // If null, we are in CREATE mode. Otherwise in EDIT mode.
    onSubmit: (roomData: {
        roomNumber: string;
        floor: number;
        price: number;
        area: number;
        status: RoomStatus;
        buildingName: string;
        description: string;
        amenities: string[];
        images: string[];
    }) => void;
    onCancel: () => void;
}

const AVAILABLE_AMENITIES = [
    'Điều hòa',
    'Tủ lạnh',
    'Máy giặt',
    'Giường đệm',
    'Tủ quần áo',
    'Bếp điện',
    'Bình nóng lạnh',
    'Smart TV',
    'Ban công',
    'Wifi miễn phí',
    'Khu để xe',
    'Thang máy'
];

const MOCK_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80'
];

export function RoomForm({ room, onSubmit, onCancel }: RoomFormProps) {
    const isEdit = !!room;

    const [roomNumber, setRoomNumber] = useState('');
    const [floor, setFloor] = useState(1);
    const [price, setPrice] = useState(5000000);
    const [area, setArea] = useState(25);
    const [status, setStatus] = useState<RoomStatus>('vacant');
    const [buildingName, setBuildingName] = useState('Tòa nhà A');
    const [description, setDescription] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (room) {
            setRoomNumber(room.roomNumber);
            setFloor(room.floor);
            setPrice(room.price);
            setArea(room.area);
            setStatus(room.status);
            setBuildingName(room.buildingName);
            setDescription(room.description);
            setSelectedAmenities(room.amenities);
            setImageUrl(room.images && room.images.length > 0 ? room.images[0] : '');
        } else {
            // Default setup for a new room
            setRoomNumber('');
            setFloor(1);
            setPrice(5000000);
            setArea(25);
            setStatus('vacant');
            setBuildingName('Tòa nhà A');
            setDescription('');
            setSelectedAmenities(['Điều hòa', 'Bình nóng lạnh']);
            setImageUrl('');
        }
    }, [room]);

    const handleAmenityChange = (amenity: string) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const handleAutoGenerateImage = () => {
        const randomImg = MOCK_ROOM_IMAGES[Math.floor(Math.random() * MOCK_ROOM_IMAGES.length)];
        setImageUrl(randomImg);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!roomNumber.trim()) {
            setError('Vui lòng nhập số phòng.');
            return;
        }

        if (price <= 0) {
            setError('Giá thuê phải lớn hơn 0.');
            return;
        }

        if (area <= 0) {
            setError('Diện tích phải lớn hơn 0.');
            return;
        }

        onSubmit({
            roomNumber,
            floor,
            price,
            area,
            status,
            buildingName,
            description,
            amenities: selectedAmenities,
            images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80']
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-4">
                <div>
                    <h2 className="text-lg font-bold text-[#3f2d28]">
                        {isEdit ? `Chỉnh sửa phòng P.${room?.roomNumber}` : 'Thêm phòng mới'}
                    </h2>
                    <p className="text-xs text-[#8f6f64] mt-0.5">
                        {isEdit ? 'Cập nhật lại thông tin cấu hình phòng.' : 'Nhập thông tin ban đầu để cấu hình phòng mới.'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-[#8f6f64] hover:text-[#ff385c] rounded-full p-2 hover:bg-[#fcd5ce]/30 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Số phòng */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Số phòng *</label>
                    <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="Ví dụ: P.204"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                        required
                    />
                </div>

                {/* Tòa nhà */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Tòa nhà / Khu vực *</label>
                    <select
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                    >
                        <option value="Tòa nhà A">Tòa nhà A</option>
                        <option value="Tòa nhà B">Tòa nhà B</option>
                        <option value="Tòa nhà C">Tòa nhà C</option>
                    </select>
                </div>

                {/* Tầng */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Tầng số *</label>
                    <input
                        type="number"
                        value={floor}
                        onChange={(e) => setFloor(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        min="1"
                        required
                    />
                </div>

                {/* Diện tích */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Diện tích (m²) *</label>
                    <input
                        type="number"
                        value={area}
                        onChange={(e) => setArea(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        min="1"
                        required
                    />
                </div>

                {/* Giá thuê */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Giá thuê hàng tháng (₫) *</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        min="1"
                        required
                    />
                </div>

                {/* Trạng thái */}
                <div>
                    <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Trạng thái ban đầu *</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as RoomStatus)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                        disabled={isEdit && room?.status === 'occupied'} // occupied status is managed by contract
                    >
                        <option value="vacant">Trống (Vacant)</option>
                        <option value="reserved">Đã giữ chỗ (Reserved)</option>
                        <option value="maintenance">Bảo trì (Maintenance)</option>
                        {isEdit && room?.status === 'occupied' && (
                            <option value="occupied">Đang thuê (Occupied)</option>
                        )}
                    </select>
                    {isEdit && room?.status === 'occupied' && (
                        <p className="text-[10px] text-[#ff385c] mt-1 font-semibold">
                            * Phòng đang có hợp đồng hoạt động. Trạng thái Đang thuê chỉ đổi được khi kết thúc hợp đồng.
                        </p>
                    )}
                </div>
            </div>

            {/* Mô tả */}
            <div>
                <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">Mô tả phòng</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả các chi tiết nổi bật của căn phòng..."
                    className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c] h-20 resize-none"
                />
            </div>

            {/* Ảnh phòng */}
            <div>
                <label className="block text-xs font-bold text-[#5b463f] mb-1.5 uppercase tracking-wider">URL Hình ảnh</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Nhập đường dẫn URL ảnh hoặc chọn ngẫu nhiên..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fcd5ce] bg-white text-sm text-[#3f2d28] outline-none focus:border-[#ff385c]"
                    />
                    <button
                        type="button"
                        onClick={handleAutoGenerateImage}
                        className="inline-flex items-center gap-1 shrink-0 px-3.5 py-2.5 border border-[#fcd5ce] text-[#5b463f] hover:bg-[#fcd5ce]/30 rounded-xl text-xs font-semibold transition-colors"
                        title="Chọn ảnh ngẫu nhiên tuyệt đẹp"
                    >
                        <Sparkles className="h-4 w-4 text-[#ff385c]" />
                        Chọn ảnh
                    </button>
                </div>
                {imageUrl && (
                    <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-[#fcd5ce]">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-0.5 rounded-full"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Tiện ích */}
            <div>
                <label className="block text-xs font-bold text-[#5b463f] mb-2 uppercase tracking-wider">Tiện ích kèm theo</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {AVAILABLE_AMENITIES.map((amenity) => {
                        const checked = selectedAmenities.includes(amenity);
                        return (
                            <button
                                type="button"
                                key={amenity}
                                onClick={() => handleAmenityChange(amenity)}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium text-left cursor-pointer transition-all ${
                                    checked
                                        ? 'bg-[#fff8f6] border-[#ff385c] text-[#ff385c] font-semibold'
                                        : 'bg-white border-[#fcd5ce] text-[#5b463f] hover:bg-[#fff8f6]/50'
                                }`}
                            >
                                <span className={`inline-flex h-4.5 w-4.5 items-center justify-center rounded border ${
                                    checked ? 'bg-[#ff385c] border-[#ff385c] text-white' : 'border-[#caa79a]'
                                }`}>
                                    {checked && <Plus className="h-3 w-3 rotate-45 stroke-[3px]" />}
                                </span>
                                <span>{amenity}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Nút lưu */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#fcd5ce] mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-sm font-semibold text-[#5b463f] rounded-xl border border-[#fcd5ce] hover:bg-[#fcd5ce]/20 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-xl transition-colors shadow-md hover:shadow-lg cursor-pointer"
                >
                    <Save className="h-4.5 w-4.5" />
                    Lưu thông tin
                </button>
            </div>
        </form>
    );
}

import { create } from 'zustand';
import { Room, RoomStatus, UtilityReading, Tenant } from '../types/room.type';

interface RoomState {
    rooms: Room[];
    searchQuery: string;
    statusFilter: string;
    buildingFilter: string;
    selectedRoomId: string | null;
    
    // Actions
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    setBuildingFilter: (building: string) => void;
    setSelectedRoomId: (id: string | null) => void;
    
    addRoom: (room: Omit<Room, 'id' | 'utilityHistory' | 'tenantHistory' | 'currentTenant'>) => void;
    updateRoom: (id: string, roomData: Partial<Room>) => void;
    deleteRoom: (id: string) => void;
    
    addUtilityReading: (roomId: string, reading: Omit<UtilityReading, 'id' | 'electricCost' | 'waterCost' | 'readDate' | 'isBilled'>) => void;
    updateRoomStatus: (roomId: string, status: RoomStatus) => void;
    assignTenant: (roomId: string, tenant: Tenant) => void;
    removeTenant: (roomId: string) => void;
}

const MOCK_AMENITIES = ['Điều hòa', 'Tủ lạnh', 'Máy giặt', 'Giường đệm', 'Tủ quần áo', 'Bếp điện', 'Bình nóng lạnh', 'Smart TV', 'Ban công'];

const INITIAL_ROOMS: Room[] = [
    {
        id: 'room-101',
        roomNumber: '101',
        floor: 1,
        price: 5200000,
        area: 25,
        status: 'occupied',
        buildingName: 'Tòa nhà A',
        description: 'Phòng studio tầng 1 thoáng mát, đầy đủ tiện nghi, phù hợp 1-2 người ở.',
        amenities: ['Điều hòa', 'Tủ lạnh', 'Giường đệm', 'Tủ quần áo', 'Bình nóng lạnh'],
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'],
        currentTenant: {
            id: 'tenant-1',
            name: 'Nguyễn Minh Tuấn',
            phone: '0912345678',
            email: 'tuan.nm@gmail.com',
            startDate: '2025-10-15',
            endDate: '2026-10-14',
            deposit: 5200000,
            contractId: 'CON-101'
        },
        utilityHistory: [
            {
                id: 'ut-101-04',
                period: '04/2026',
                electricStart: 1250,
                electricEnd: 1380,
                waterStart: 120,
                waterEnd: 132,
                electricPrice: 3500,
                waterPrice: 18000,
                electricCost: (1380 - 1250) * 3500,
                waterCost: (132 - 120) * 18000,
                readDate: '2026-04-30T17:30:00Z',
                readBy: 'Lê Văn Tám',
                isBilled: true
            },
            {
                id: 'ut-101-05',
                period: '05/2026',
                electricStart: 1380,
                electricEnd: 1540,
                waterStart: 132,
                waterEnd: 147,
                electricPrice: 3500,
                waterPrice: 18000,
                electricCost: (1540 - 1380) * 3500,
                waterCost: (147 - 132) * 18000,
                readDate: '2026-05-31T18:00:00Z',
                readBy: 'Lê Văn Tám',
                isBilled: true
            }
        ],
        tenantHistory: []
    },
    {
        id: 'room-102',
        roomNumber: '102',
        floor: 1,
        price: 5500000,
        area: 28,
        status: 'occupied',
        buildingName: 'Tòa nhà A',
        description: 'Phòng view sân vườn, thoáng mát, khu bếp riêng biệt sạch sẽ.',
        amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt', 'Giường đệm', 'Tủ quần áo', 'Bình nóng lạnh', 'Bếp điện'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'],
        currentTenant: {
            id: 'tenant-2',
            name: 'Trần Thị Lan',
            phone: '0987654321',
            email: 'lan.tt@yahoo.com',
            startDate: '2026-01-05',
            endDate: '2027-01-04',
            deposit: 5500000,
            contractId: 'CON-102'
        },
        utilityHistory: [
            {
                id: 'ut-102-05',
                period: '05/2026',
                electricStart: 840,
                electricEnd: 990,
                waterStart: 95,
                waterEnd: 106,
                electricPrice: 3500,
                waterPrice: 18000,
                electricCost: (990 - 840) * 3500,
                waterCost: (106 - 95) * 18000,
                readDate: '2026-05-31T18:15:00Z',
                readBy: 'Lê Văn Tám',
                isBilled: true
            }
        ],
        tenantHistory: []
    },
    {
        id: 'room-103',
        roomNumber: '103',
        floor: 1,
        price: 4800000,
        area: 22,
        status: 'vacant',
        buildingName: 'Tòa nhà A',
        description: 'Phòng trống tầng trệt, giá hợp lý, phù hợp sinh viên hoặc nhân viên văn phòng.',
        amenities: ['Điều hòa', 'Giường đệm', 'Tủ quần áo', 'Bình nóng lạnh'],
        images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80'],
        currentTenant: null,
        utilityHistory: [
            {
                id: 'ut-103-05',
                period: '05/2026',
                electricStart: 450,
                electricEnd: 460,
                waterStart: 30,
                waterEnd: 32,
                electricPrice: 3500,
                waterPrice: 18000,
                electricCost: (460 - 450) * 3500,
                waterCost: (32 - 30) * 18000,
                readDate: '2026-05-31T18:20:00Z',
                readBy: 'Lê Văn Tám',
                isBilled: true
            }
        ],
        tenantHistory: [
            {
                id: 'tenant-old-1',
                name: 'Phạm Đức Anh',
                phone: '0977888999',
                email: 'ducanh.p@gmail.com',
                startDate: '2025-05-01',
                endDate: '2026-05-01',
                deposit: 4800000,
                contractId: 'CON-099'
            }
        ]
    },
    {
        id: 'room-201',
        roomNumber: '201',
        floor: 2,
        price: 6000000,
        area: 30,
        status: 'occupied',
        buildingName: 'Tòa nhà A',
        description: 'Phòng studio tầng 2 cực rộng có ban công rộng rãi đón gió tự nhiên.',
        amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt', 'Giường đệm', 'Tủ quần áo', 'Bếp điện', 'Bình nóng lạnh', 'Ban công', 'Smart TV'],
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80'],
        currentTenant: {
            id: 'tenant-3',
            name: 'Lê Văn Long',
            phone: '0933445566',
            email: 'long.lv@gmail.com',
            startDate: '2026-02-15',
            endDate: '2027-02-14',
            deposit: 6000000,
            contractId: 'CON-201'
        },
        utilityHistory: [
            {
                id: 'ut-201-05',
                period: '05/2026',
                electricStart: 2100,
                electricEnd: 2320,
                waterStart: 180,
                waterEnd: 198,
                electricPrice: 3500,
                waterPrice: 18000,
                electricCost: (2320 - 2100) * 3500,
                waterCost: (198 - 180) * 18000,
                readDate: '2026-05-31T18:30:00Z',
                readBy: 'Lê Văn Tám',
                isBilled: true
            }
        ],
        tenantHistory: []
    },
    {
        id: 'room-202',
        roomNumber: '202',
        floor: 2,
        price: 5800000,
        area: 28,
        status: 'reserved',
        buildingName: 'Tòa nhà A',
        description: 'Phòng lầu 2 đã có khách cọc trước, sẽ dọn vào ở vào giữa tháng 6.',
        amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt', 'Giường đệm', 'Tủ quần áo', 'Bếp điện', 'Bình nóng lạnh', 'Ban công'],
        images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80'],
        currentTenant: null,
        utilityHistory: [],
        tenantHistory: []
    },
    {
        id: 'room-203',
        roomNumber: '203',
        floor: 2,
        price: 5700000,
        area: 27,
        status: 'maintenance',
        buildingName: 'Tòa nhà A',
        description: 'Phòng đang được sửa chữa chống thấm ban công và nâng cấp sơn tường.',
        amenities: ['Điều hòa', 'Tủ lạnh', 'Giường đệm', 'Tủ quần áo', 'Bình nóng lạnh'],
        images: ['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80'],
        currentTenant: null,
        utilityHistory: [],
        tenantHistory: []
    },
    {
        id: 'room-301',
        roomNumber: '301',
        floor: 3,
        price: 6500000,
        area: 32,
        status: 'occupied',
        buildingName: 'Tòa nhà A',
        description: 'Căn hộ mini 1 phòng ngủ tách biệt, phòng khách và ban công siêu rộng view Landmark 81.',
        amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt', 'Giường đệm', 'Tủ quần áo', 'Bếp điện', 'Bình nóng lạnh', 'Ban công', 'Smart TV'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'],
        currentTenant: {
            id: 'tenant-4',
            name: 'Phạm Hồng Nhung',
            phone: '0944556677',
            email: 'nhung.ph@hotmail.com',
            startDate: '2026-03-01',
            endDate: '2027-03-01',
            deposit: 13000000,
            contractId: 'CON-301'
        },
        utilityHistory: [
            {
                id: 'ut-301-05',
                period: '05/2026',
                electricStart: 920,
                electricEnd: 1140,
                waterStart: 60,
                waterEnd: 74,
                electricPrice: 3500,
                waterPrice: 18000,
                electricCost: (1140 - 920) * 3500,
                waterCost: (74 - 60) * 18000,
                readDate: '2026-05-31T18:40:00Z',
                readBy: 'Lê Văn Tám',
                isBilled: true
            }
        ],
        tenantHistory: []
    },
    {
        id: 'room-302',
        roomNumber: '302',
        floor: 3,
        price: 6200000,
        area: 30,
        status: 'vacant',
        buildingName: 'Tòa nhà A',
        description: 'Phòng tầng 3 ngập tràn ánh sáng tự nhiên, view cực đẹp, thoáng mát và yên tĩnh.',
        amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt', 'Giường đệm', 'Tủ quần áo', 'Bếp điện', 'Bình nóng lạnh', 'Ban công'],
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'],
        currentTenant: null,
        utilityHistory: [],
        tenantHistory: []
    },
    {
        id: 'room-b101',
        roomNumber: '101',
        floor: 1,
        price: 4900000,
        area: 24,
        status: 'occupied',
        buildingName: 'Tòa nhà B',
        description: 'Phòng studio Tòa B tầng trệt tiện lợi di chuyển, khu dân cư an ninh.',
        amenities: ['Điều hòa', 'Tủ lạnh', 'Giường đệm', 'Tủ quần áo', 'Bình nóng lạnh'],
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80'],
        currentTenant: {
            id: 'tenant-5',
            name: 'Vũ Hoàng Nam',
            phone: '0901234567',
            email: 'nam.vh@gmail.com',
            startDate: '2026-04-01',
            endDate: '2027-04-01',
            deposit: 4900000,
            contractId: 'CON-B101'
        },
        utilityHistory: [
            {
                id: 'ut-b101-05',
                period: '05/2026',
                electricStart: 180,
                electricEnd: 310,
                waterStart: 15,
                waterEnd: 24,
                electricPrice: 3500,
                waterPrice: 18000,
                electricCost: (310 - 180) * 3500,
                waterCost: (24 - 15) * 18000,
                readDate: '2026-05-31T18:45:00Z',
                readBy: 'Lê Văn Tám',
                isBilled: true
            }
        ],
        tenantHistory: []
    },
    {
        id: 'room-b201',
        roomNumber: '201',
        floor: 2,
        price: 5200000,
        area: 26,
        status: 'vacant',
        buildingName: 'Tòa nhà B',
        description: 'Căn hộ studio vừa sơn lại mới tinh, sàn gỗ sang trọng sạch sẽ.',
        amenities: ['Điều hòa', 'Tủ lạnh', 'Giường đệm', 'Tủ quần áo', 'Bếp điện', 'Bình nóng lạnh'],
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'],
        currentTenant: null,
        utilityHistory: [],
        tenantHistory: []
    }
];

export const useRoomStore = create<RoomState>((set) => ({
    rooms: INITIAL_ROOMS,
    searchQuery: '',
    statusFilter: 'all',
    buildingFilter: 'all',
    selectedRoomId: null,
    
    setSearchQuery: (query) => set({ searchQuery: query }),
    setStatusFilter: (status) => set({ statusFilter: status }),
    setBuildingFilter: (building) => set({ buildingFilter: building }),
    setSelectedRoomId: (id) => set({ selectedRoomId: id }),
    
    addRoom: (roomData) => set((state) => {
        const newRoom: Room = {
            ...roomData,
            id: `room-${Date.now()}`,
            currentTenant: null,
            utilityHistory: [],
            tenantHistory: []
        };
        return {
            rooms: [newRoom, ...state.rooms]
        };
    }),
    
    updateRoom: (id, roomData) => set((state) => ({
        rooms: state.rooms.map((room) => 
            room.id === id ? { ...room, ...roomData } : room
        )
    })),
    
    deleteRoom: (id) => set((state) => ({
        rooms: state.rooms.filter((room) => room.id !== id),
        selectedRoomId: state.selectedRoomId === id ? null : state.selectedRoomId
    })),
    
    addUtilityReading: (roomId, readingData) => set((state) => {
        const elecUsage = readingData.electricEnd - readingData.electricStart;
        const waterUsage = readingData.waterEnd - readingData.waterStart;
        
        const newReading: UtilityReading = {
            ...readingData,
            id: `ut-${Date.now()}`,
            electricCost: Math.max(0, elecUsage) * readingData.electricPrice,
            waterCost: Math.max(0, waterUsage) * readingData.waterPrice,
            readDate: new Date().toISOString(),
            isBilled: false
        };
        
        return {
            rooms: state.rooms.map((room) => {
                if (room.id !== roomId) return room;
                return {
                    ...room,
                    utilityHistory: [newReading, ...room.utilityHistory]
                };
            })
        };
    }),
    
    updateRoomStatus: (roomId, status) => set((state) => ({
        rooms: state.rooms.map((room) => 
            room.id === roomId ? { ...room, status } : room
        )
    })),
    
    assignTenant: (roomId, tenant) => set((state) => ({
        rooms: state.rooms.map((room) => {
            if (room.id !== roomId) return room;
            return {
                ...room,
                status: 'occupied',
                currentTenant: tenant
            };
        })
    })),
    
    removeTenant: (roomId) => set((state) => ({
        rooms: state.rooms.map((room) => {
            if (room.id !== roomId) return room;
            const history = room.currentTenant 
                ? [room.currentTenant, ...room.tenantHistory]
                : room.tenantHistory;
            return {
                ...room,
                status: 'vacant',
                currentTenant: null,
                tenantHistory: history
            };
        })
    }))
}));

import { create } from 'zustand';
import { Apartment } from '../types/apartment.type';

interface ApartmentState {
    apartments: Apartment[];
    searchQuery: string;
    statusFilter: string;
    
    // Actions
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    
    addApartment: (apartment: Omit<Apartment, 'id' | 'createdAt'>) => void;
    updateApartment: (id: string, apartmentData: Partial<Apartment>) => void;
    deleteApartment: (id: string) => void;
}

const INITIAL_APARTMENTS: Apartment[] = [
    {
        id: 'apt-1',
        name: 'Tòa nhà Harmony',
        address: '128 Trần Hưng Đạo, Phường Nguyễn Cư Trinh, Quận 1, TP. HCM',
        floors: 6,
        roomsCount: 48,
        status: 'active',
        description: 'Khu căn hộ studio dịch vụ cao cấp, an ninh 24/7, hầm để xe rộng rãi, máy giặt sấy sảnh chung.',
        createdAt: '2025-01-10',
    },
    {
        id: 'apt-2',
        name: 'Khu căn hộ Sunrise',
        address: '79 Nguyễn Thị Thập, Phường Tân Hưng, Quận 7, TP. HCM',
        floors: 5,
        roomsCount: 50,
        status: 'active',
        description: 'Vị trí đắc địa đối diện Lotte Mart, đầy đủ tiện ích xung quanh, camera an ninh từng hành lang.',
        createdAt: '2025-05-15',
    },
    {
        id: 'apt-3',
        name: 'Building Moonlight',
        address: '202 Võ Thị Sáu, Phường Võ Thị Sáu, Quận 3, TP. HCM',
        floors: 4,
        roomsCount: 30,
        status: 'maintenance',
        description: 'Đang tiến hành sơn sửa lại mặt tiền và nâng cấp thang máy tòa nhà.',
        createdAt: '2025-06-12',
    },
];

export const useApartmentStore = create<ApartmentState>((set) => ({
    apartments: INITIAL_APARTMENTS,
    searchQuery: '',
    statusFilter: 'all',
    
    setSearchQuery: (query) => set({ searchQuery: query }),
    setStatusFilter: (status) => set({ statusFilter: status }),
    
    addApartment: (aptData) => set((state) => {
        const newApt: Apartment = {
            ...aptData,
            id: `apt-${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0],
        };
        return { apartments: [newApt, ...state.apartments] };
    }),
    
    updateApartment: (id, apartmentData) => set((state) => ({
        apartments: state.apartments.map((apt) => 
            apt.id === id ? { ...apt, ...apartmentData } : apt
        )
    })),
    
    deleteApartment: (id) => set((state) => ({
        apartments: state.apartments.filter((apt) => apt.id !== id)
    })),
}));

export type RoomStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance';

export interface UtilityReading {
    id: string;
    period: string; // e.g., '06/2026'
    electricStart: number;
    electricEnd: number;
    waterStart: number;
    waterEnd: number;
    electricPrice: number; // price per kWh
    waterPrice: number; // price per m3
    electricCost: number;
    waterCost: number;
    readDate: string; // ISO date
    readBy: string; // Staff/Admin name
    isBilled: boolean;
}

export interface Tenant {
    id: string;
    name: string;
    phone: string;
    email: string;
    startDate: string;
    endDate: string;
    deposit: number;
    contractId: string;
}

export interface Room {
    id: string;
    roomNumber: string; // e.g., '201'
    floor: number; // e.g., 2
    price: number; // e.g., 5500000 (VND)
    area: number; // e.g., 25 (m2)
    status: RoomStatus;
    buildingName: string; // e.g., 'Tòa nhà A'
    description: string;
    amenities: string[]; // e.g., ['Điều hòa', 'Tủ lạnh', 'Nóng lạnh', 'Máy giặt', 'Ban công']
    currentTenant: Tenant | null;
    utilityHistory: UtilityReading[];
    tenantHistory: Tenant[];
    images: string[];
}

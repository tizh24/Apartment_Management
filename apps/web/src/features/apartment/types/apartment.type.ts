export interface Apartment {
    id: string;
    name: string;
    address: string;
    floors: number;
    roomsCount: number;
    status: 'active' | 'maintenance';
    description: string;
    createdAt: string;
}

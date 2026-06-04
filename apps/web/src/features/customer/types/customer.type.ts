export type CustomerStatus = 'active' | 'inactive' | 'potential';

export type DocumentType = 'cccd' | 'passport' | 'visa' | 'other';

export interface CustomerDocument {
    id: string;
    type: DocumentType;
    fileName: string;
    fileUrl: string;
    uploadDate: string; // ISO date
    expiryDate?: string; // ISO date
}

export interface ContractSummary {
    id: string;
    roomNumber: string;
    buildingName: string;
    price: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
}

export interface Customer {
    id: string;
    name: string;
    dob: string; // e.g. YYYY-MM-DD
    phone: string;
    email: string;
    nationality: string; // e.g. 'Việt Nam', 'Mỹ', 'Hàn Quốc'
    status: CustomerStatus;
    currentRoomId?: string;
    currentRoomNumber?: string;
    currentBuilding?: string;
    totalUnpaid: number; // outstanding debts
    documents: CustomerDocument[];
    contractHistory: ContractSummary[];
}

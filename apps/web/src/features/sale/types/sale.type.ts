export type SaleStatus = 'active' | 'inactive';
export type CommissionStatus = 'unpaid' | 'paid' | 'pending';

export interface Sale {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: SaleStatus;
    joinedDate: string;
    totalContracts: number;
    totalCommission: number;
    paidCommission: number;
    unpaidCommission: number;
}

export interface Commission {
    id: string;
    saleId: string;
    contractId: string;
    contractNumber: string;
    roomNumber: string;
    buildingName: string;
    customerName: string;
    rentAmount: number;
    commissionRate: number; // e.g. 10 for 10%
    amount: number;         // calculated: rentAmount * (commissionRate / 100)
    status: CommissionStatus;
    paymentDate?: string;
    paymentMethod?: string;
    notes?: string;
}

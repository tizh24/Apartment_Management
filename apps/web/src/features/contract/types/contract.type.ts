export type ContractStatus = 'active' | 'expired' | 'terminated' | 'cancelled';

export interface ContractChange {
    id: string;
    actionType: 'create' | 'renew' | 'terminate' | 'cancel';
    description: string;
    changeDate: string; // ISO date
    changedBy: string; // Admin / Staff name
}

export interface Contract {
    id: string;
    roomId: string;
    roomNumber: string;
    buildingName: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    saleId?: string;
    saleName?: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    price: number; // rental price
    deposit: number; // deposit amount
    status: ContractStatus;
    changeHistory: ContractChange[];
    notes?: string;
}

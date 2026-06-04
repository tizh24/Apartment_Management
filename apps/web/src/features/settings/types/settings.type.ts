export interface GeneralSettings {
    systemName: string;
    companyName: string;
    hotline: string;
    address: string;
    email: string;
}

export interface PricingSettings {
    electricityPrice: number; // VND/kWh
    waterPrice: number;       // VND/m3
    internetFee: number;      // VND/room/month
    serviceFee: number;       // VND/room/month
    trashFee: number;         // VND/room/month
}

export interface ContractSettings {
    defaultDepositMonths: number;
    commissionRate: number; // percentage, e.g. 10
    expiryWarningDays: number;
    lateFeePercentage: number; // percentage/day
}

export interface BankSettings {
    bankName: string;
    accountNumber: string;
    accountName: string;
    autoReconciliation: boolean;
}

export interface SystemSettings {
    general: GeneralSettings;
    pricing: PricingSettings;
    contract: ContractSettings;
    bank: BankSettings;
}

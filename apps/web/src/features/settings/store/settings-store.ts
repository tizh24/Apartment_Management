import { create } from 'zustand';
import { SystemSettings, GeneralSettings, PricingSettings, ContractSettings, BankSettings } from '../types/settings.type';

interface SettingsState {
    settings: SystemSettings;
    
    // Actions
    updateGeneralSettings: (updates: Partial<GeneralSettings>) => void;
    updatePricingSettings: (updates: Partial<PricingSettings>) => void;
    updateContractSettings: (updates: Partial<ContractSettings>) => void;
    updateBankSettings: (updates: Partial<BankSettings>) => void;
}

const DEFAULT_SETTINGS: SystemSettings = {
    general: {
        systemName: 'ApartMgmt',
        companyName: 'ApartMgmt Real Estate JSC',
        hotline: '1900 6789',
        address: '82 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội',
        email: 'support@apartmgmt.com'
    },
    pricing: {
        electricityPrice: 3800,
        waterPrice: 25000,
        internetFee: 150000,
        serviceFee: 100000,
        trashFee: 30000
    },
    contract: {
        defaultDepositMonths: 1,
        commissionRate: 10,
        expiryWarningDays: 30,
        lateFeePercentage: 0.2
    },
    bank: {
        bankName: 'MB Bank (Ngân hàng Quân Đội)',
        accountNumber: '1903820199201',
        accountName: 'NGUYEN VAN ADMIN',
        autoReconciliation: true
    }
};

export const useSettingsStore = create<SettingsState>((set) => ({
    settings: DEFAULT_SETTINGS,
    
    updateGeneralSettings: (updates) => set((state) => ({
        settings: {
            ...state.settings,
            general: { ...state.settings.general, ...updates }
        }
    })),
    
    updatePricingSettings: (updates) => set((state) => ({
        settings: {
            ...state.settings,
            pricing: { ...state.settings.pricing, ...updates }
        }
    })),
    
    updateContractSettings: (updates) => set((state) => ({
        settings: {
            ...state.settings,
            contract: { ...state.settings.contract, ...updates }
        }
    })),
    
    updateBankSettings: (updates) => set((state) => ({
        settings: {
            ...state.settings,
            bank: { ...state.settings.bank, ...updates }
        }
    }))
}));

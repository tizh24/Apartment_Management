import { create } from 'zustand';
import { Sale, Commission, SaleStatus, CommissionStatus } from '../types/sale.type';

interface SaleState {
    sales: Sale[];
    commissions: Commission[];
    searchQuery: string;
    statusFilter: string;
    commissionStatusFilter: string;

    // Actions
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    setCommissionStatusFilter: (status: string) => void;
    
    addSale: (saleData: Omit<Sale, 'id' | 'joinedDate' | 'totalContracts' | 'totalCommission' | 'paidCommission' | 'unpaidCommission'>) => void;
    updateSale: (id: string, updates: Partial<Sale>) => void;
    addCommission: (commissionData: Omit<Commission, 'id' | 'amount'>) => void;
    payCommissions: (commissionIds: string[], paymentMethod: string, notes?: string) => void;
}

const INITIAL_SALES: Sale[] = [
    {
        id: 'sale-1',
        name: 'Nguyễn Văn Mỹ',
        email: 'vanmy.nguyen@apartmgmt.com',
        phone: '0909123456',
        status: 'active',
        joinedDate: '2025-06-15',
        totalContracts: 2,
        totalCommission: 1010000,
        paidCommission: 520000,
        unpaidCommission: 490000
    },
    {
        id: 'sale-2',
        name: 'Lê Thị Thu',
        email: 'thule@apartmgmt.com',
        phone: '0988776655',
        status: 'active',
        joinedDate: '2025-09-01',
        totalContracts: 1,
        totalCommission: 550000,
        paidCommission: 0,
        unpaidCommission: 550000
    },
    {
        id: 'sale-3',
        name: 'Nguyễn Thị Mai',
        email: 'mainuyen@apartmgmt.com',
        phone: '0933221100',
        status: 'active',
        joinedDate: '2026-01-10',
        totalContracts: 0,
        totalCommission: 0,
        paidCommission: 0,
        unpaidCommission: 0
    }
];

const INITIAL_COMMISSIONS: Commission[] = [
    {
        id: 'comm-1',
        saleId: 'sale-1',
        contractId: 'CON-101',
        contractNumber: 'CON-101',
        roomNumber: '101',
        buildingName: 'Tòa nhà A',
        customerName: 'Nguyễn Minh Tuấn',
        rentAmount: 5200000,
        commissionRate: 10,
        amount: 520000,
        status: 'paid',
        paymentDate: '2025-10-20T10:00:00Z',
        paymentMethod: 'transfer',
        notes: 'Thanh toán hoa hồng hợp đồng P.101 kỳ đầu tiên.'
    },
    {
        id: 'comm-2',
        saleId: 'sale-2',
        contractId: 'CON-102',
        contractNumber: 'CON-102',
        roomNumber: '102',
        buildingName: 'Tòa nhà A',
        customerName: 'Trần Thị Lan',
        rentAmount: 5500000,
        commissionRate: 10,
        amount: 550000,
        status: 'unpaid',
        notes: 'Chưa đối soát hoa hồng hợp đồng P.102'
    },
    {
        id: 'comm-3',
        saleId: 'sale-1',
        contractId: 'CON-B101',
        contractNumber: 'CON-B101',
        roomNumber: '101',
        buildingName: 'Tòa nhà B',
        customerName: 'Vũ Hoàng Nam',
        rentAmount: 4900000,
        commissionRate: 10,
        amount: 490000,
        status: 'unpaid',
        notes: 'Đợi khách cọc thành công đợt 2 rồi đối soát.'
    }
];

export const useSaleStore = create<SaleState>((set) => ({
    sales: INITIAL_SALES,
    commissions: INITIAL_COMMISSIONS,
    searchQuery: '',
    statusFilter: 'all',
    commissionStatusFilter: 'all',

    setSearchQuery: (query) => set({ searchQuery: query }),
    setStatusFilter: (status) => set({ statusFilter: status }),
    setCommissionStatusFilter: (status) => set({ commissionStatusFilter: status }),

    addSale: (saleData) => set((state) => {
        const newSale: Sale = {
            ...saleData,
            id: `sale-${Date.now()}`,
            joinedDate: new Date().toISOString().split('T')[0],
            totalContracts: 0,
            totalCommission: 0,
            paidCommission: 0,
            unpaidCommission: 0
        };
        return { sales: [...state.sales, newSale] };
    }),

    updateSale: (id, updates) => set((state) => ({
        sales: state.sales.map((sale) => sale.id === id ? { ...sale, ...updates } : sale)
    })),

    addCommission: (commissionData) => set((state) => {
        const amount = Math.round(commissionData.rentAmount * (commissionData.commissionRate / 100));
        const newCommission: Commission = {
            ...commissionData,
            id: `comm-${Date.now()}`,
            amount
        };

        // Sync updates to Sale metrics
        const updatedSales = state.sales.map((sale) => {
            if (sale.id !== commissionData.saleId) return sale;
            
            const totalCommission = sale.totalCommission + amount;
            const unpaidCommission = sale.unpaidCommission + amount;
            return {
                ...sale,
                totalContracts: sale.totalContracts + 1,
                totalCommission,
                unpaidCommission
            };
        });

        return {
            commissions: [newCommission, ...state.commissions],
            sales: updatedSales
        };
    }),

    payCommissions: (commissionIds, paymentMethod, notes) => set((state) => {
        const paymentDate = new Date().toISOString();
        
        // 1. Update commission records
        const updatedCommissions = state.commissions.map((comm) => {
            if (!commissionIds.includes(comm.id)) return comm;
            return {
                ...comm,
                status: 'paid' as CommissionStatus,
                paymentDate,
                paymentMethod,
                notes: notes || comm.notes
            };
        });

        // 2. Recalculate agent sums
        const updatedSales = state.sales.map((sale) => {
            // Find all commissions for this agent
            const agentComms = updatedCommissions.filter(c => c.saleId === sale.id);
            const totalCommission = agentComms.reduce((sum, c) => sum + c.amount, 0);
            const paidCommission = agentComms.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
            const unpaidCommission = agentComms.filter(c => c.status === 'unpaid').reduce((sum, c) => sum + c.amount, 0);

            return {
                ...sale,
                totalCommission,
                paidCommission,
                unpaidCommission
            };
        });

        return {
            commissions: updatedCommissions,
            sales: updatedSales
        };
    })
}));

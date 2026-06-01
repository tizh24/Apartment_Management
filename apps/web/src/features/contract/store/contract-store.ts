import { create } from 'zustand';
import { Contract, ContractStatus, ContractChange } from '../types/contract.type';
import { useRoomStore } from '@/features/room/store/room-store';
import { useCustomerStore } from '@/features/customer/store/customer-store';

interface ContractState {
    contracts: Contract[];
    searchQuery: string;
    statusFilter: string;
    selectedContractId: string | null;

    // Actions
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    setSelectedContractId: (id: string | null) => void;

    addContract: (contractData: Omit<Contract, 'id' | 'status' | 'changeHistory'>) => void;
    updateContract: (id: string, contractData: Partial<Contract>) => void;
    renewContract: (id: string, newEndDate: string, newPrice: number, changedBy: string) => void;
    terminateContract: (id: string, changedBy: string) => void;
    cancelContract: (id: string, changedBy: string) => void;
}

const INITIAL_CONTRACTS: Contract[] = [
    {
        id: 'CON-101',
        roomId: 'room-101',
        roomNumber: '101',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-1',
        customerName: 'Nguyễn Minh Tuấn',
        customerPhone: '0912345678',
        saleName: 'Nguyễn Văn Mỹ',
        startDate: '2025-10-15',
        endDate: '2026-10-14',
        price: 5200000,
        deposit: 5200000,
        status: 'active',
        changeHistory: [
            {
                id: 'ch-101-1',
                actionType: 'create',
                description: 'Khởi tạo hợp đồng thuê phòng P.101',
                changeDate: '2025-10-15T09:00:00Z',
                changedBy: 'Admin'
            }
        ]
    },
    {
        id: 'CON-102',
        roomId: 'room-102',
        roomNumber: '102',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-2',
        customerName: 'Trần Thị Lan',
        customerPhone: '0987654321',
        saleName: 'Lê Thị Thu',
        startDate: '2026-01-05',
        endDate: '2027-01-04',
        price: 5500000,
        deposit: 5500000,
        status: 'active',
        changeHistory: [
            {
                id: 'ch-102-1',
                actionType: 'create',
                description: 'Khởi tạo hợp đồng thuê phòng P.102',
                changeDate: '2026-01-05T14:20:00Z',
                changedBy: 'Admin'
            }
        ]
    },
    {
        id: 'CON-201',
        roomId: 'room-201',
        roomNumber: '201',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-3',
        customerName: 'Lê Văn Long',
        customerPhone: '0933445566',
        startDate: '2026-02-15',
        endDate: '2027-02-14',
        price: 6000000,
        deposit: 6000000,
        status: 'active',
        changeHistory: [
            {
                id: 'ch-201-1',
                actionType: 'create',
                description: 'Khởi tạo hợp đồng thuê phòng P.201',
                changeDate: '2026-02-15T10:15:00Z',
                changedBy: 'Lê Văn Tám'
            }
        ]
    },
    {
        id: 'CON-301',
        roomId: 'room-301',
        roomNumber: '301',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-4',
        customerName: 'Phạm Hồng Nhung',
        customerPhone: '0944556677',
        startDate: '2026-03-01',
        endDate: '2027-03-01',
        price: 6500000,
        deposit: 13000000,
        status: 'active',
        changeHistory: [
            {
                id: 'ch-301-1',
                actionType: 'create',
                description: 'Khởi tạo hợp đồng thuê phòng P.301 với cọc 2 tháng',
                changeDate: '2026-03-01T08:30:00Z',
                changedBy: 'Admin'
            }
        ]
    },
    {
        id: 'CON-B101',
        roomId: 'room-b101',
        roomNumber: '101',
        buildingName: 'Tòa nhà B',
        customerId: 'cust-5',
        customerName: 'Vũ Hoàng Nam',
        customerPhone: '0901234567',
        startDate: '2026-04-01',
        endDate: '2027-04-01',
        price: 4900000,
        deposit: 4900000,
        status: 'active',
        changeHistory: [
            {
                id: 'ch-b101-1',
                actionType: 'create',
                description: 'Khởi tạo hợp đồng thuê Tòa B P.101',
                changeDate: '2026-04-01T11:00:00Z',
                changedBy: 'Lê Văn Tám'
            }
        ]
    },
    {
        id: 'CON-099',
        roomId: 'room-103',
        roomNumber: '103',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-7',
        customerName: 'Phạm Đức Anh',
        customerPhone: '0977888999',
        startDate: '2025-05-01',
        endDate: '2026-05-01',
        price: 4800000,
        deposit: 4800000,
        status: 'expired',
        changeHistory: [
            {
                id: 'ch-099-1',
                actionType: 'create',
                description: 'Khởi tạo hợp đồng cũ',
                changeDate: '2025-05-01T09:00:00Z',
                changedBy: 'Admin'
            }
        ]
    }
];

export const useContractStore = create<ContractState>((set) => ({
    contracts: INITIAL_CONTRACTS,
    searchQuery: '',
    statusFilter: 'all',
    selectedContractId: null,

    setSearchQuery: (query) => set({ searchQuery: query }),
    setStatusFilter: (status) => set({ statusFilter: status }),
    setSelectedContractId: (id) => set({ selectedContractId: id }),

    addContract: (contractData) => set((state) => {
        const contractId = `CON-${contractData.roomNumber}-${String(Date.now()).slice(-4)}`;
        const newContract: Contract = {
            ...contractData,
            id: contractId,
            status: 'active',
            changeHistory: [
                {
                    id: `ch-${Date.now()}`,
                    actionType: 'create',
                    description: `Khởi tạo hợp đồng thuê phòng P.${contractData.roomNumber}`,
                    changeDate: new Date().toISOString(),
                    changedBy: 'Admin'
                }
            ]
        };

        // Standard operational hooks updating Room and Customer databases
        const roomStore = useRoomStore.getState();
        const customerStore = useCustomerStore.getState();

        // 1. Assign room tenant status
        roomStore.assignTenant(contractData.roomId, {
            id: contractData.customerId,
            name: contractData.customerName,
            phone: contractData.customerPhone,
            email: 'khachthue@apartmgmt.com',
            startDate: contractData.startDate,
            endDate: contractData.endDate,
            deposit: contractData.deposit,
            contractId
        });

        // 2. Update customer status
        customerStore.updateCustomer(contractData.customerId, {
            status: 'active',
            currentRoomId: contractData.roomId,
            currentRoomNumber: contractData.roomNumber,
            currentBuilding: contractData.buildingName,
            contractHistory: [
                {
                    id: contractId,
                    roomNumber: contractData.roomNumber,
                    buildingName: contractData.buildingName,
                    price: contractData.price,
                    startDate: contractData.startDate,
                    endDate: contractData.endDate,
                    status: 'active'
                },
                ...customerStore.customers.find(c => c.id === contractData.customerId)?.contractHistory || []
            ]
        });

        return {
            contracts: [newContract, ...state.contracts]
        };
    }),

    updateContract: (id, contractData) => set((state) => ({
        contracts: state.contracts.map((c) => 
            c.id === id ? { ...c, ...contractData } : c
        )
    })),

    renewContract: (id, newEndDate, newPrice, changedBy) => set((state) => {
        return {
            contracts: state.contracts.map((c) => {
                if (c.id !== id) return c;
                
                const change: ContractChange = {
                    id: `ch-${Date.now()}`,
                    actionType: 'renew',
                    description: `Gia hạn hợp đồng đến ${newEndDate} với giá thuê ${newPrice.toLocaleString('vi-VN')} ₫`,
                    changeDate: new Date().toISOString(),
                    changedBy
                };

                // Sync Room Store
                const roomStore = useRoomStore.getState();
                roomStore.updateRoom(c.roomId, {
                    price: newPrice
                });

                return {
                    ...c,
                    endDate: newEndDate,
                    price: newPrice,
                    status: 'active',
                    changeHistory: [change, ...c.changeHistory]
                };
            })
        };
    }),

    terminateContract: (id, changedBy) => set((state) => {
        return {
            contracts: state.contracts.map((c) => {
                if (c.id !== id) return c;

                const change: ContractChange = {
                    id: `ch-${Date.now()}`,
                    actionType: 'terminate',
                    description: 'Thanh lý hợp đồng và trả cọc.',
                    changeDate: new Date().toISOString(),
                    changedBy
                };

                // Standard operational hooks clearing Room and Customer databases
                const roomStore = useRoomStore.getState();
                const customerStore = useCustomerStore.getState();

                roomStore.removeTenant(c.roomId);
                customerStore.updateCustomer(c.customerId, {
                    status: 'inactive',
                    currentRoomId: undefined,
                    currentRoomNumber: undefined,
                    currentBuilding: undefined,
                    contractHistory: customerStore.customers.find(cust => cust.id === c.customerId)?.contractHistory.map(ch => 
                        ch.id === id ? { ...ch, status: 'expired' } : ch
                    ) || []
                });

                return {
                    ...c,
                    status: 'terminated',
                    changeHistory: [change, ...c.changeHistory]
                };
            })
        };
    }),

    cancelContract: (id, changedBy) => set((state) => {
        return {
            contracts: state.contracts.map((c) => {
                if (c.id !== id) return c;

                const change: ContractChange = {
                    id: `ch-${Date.now()}`,
                    actionType: 'cancel',
                    description: 'Hủy bỏ hợp đồng thuê phòng.',
                    changeDate: new Date().toISOString(),
                    changedBy
                };

                // Sync Room and Customer
                const roomStore = useRoomStore.getState();
                const customerStore = useCustomerStore.getState();

                roomStore.removeTenant(c.roomId);
                customerStore.updateCustomer(c.customerId, {
                    status: 'inactive',
                    currentRoomId: undefined,
                    currentRoomNumber: undefined,
                    currentBuilding: undefined,
                    contractHistory: customerStore.customers.find(cust => cust.id === c.customerId)?.contractHistory.map(ch => 
                        ch.id === id ? { ...ch, status: 'cancelled' } : ch
                    ) || []
                });

                return {
                    ...c,
                    status: 'cancelled',
                    changeHistory: [change, ...c.changeHistory]
                };
            })
        };
    })
}));

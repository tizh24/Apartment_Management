import { create } from 'zustand';
import { Customer, CustomerStatus, CustomerDocument, ContractSummary } from '../types/customer.type';

interface CustomerState {
    customers: Customer[];
    searchQuery: string;
    statusFilter: string;
    selectedCustomerId: string | null;

    // Actions
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    setSelectedCustomerId: (id: string | null) => void;

    addCustomer: (customerData: Omit<Customer, 'id' | 'documents' | 'contractHistory' | 'totalUnpaid'>) => void;
    updateCustomer: (id: string, customerData: Partial<Customer>) => void;
    deleteCustomer: (id: string) => void;
    
    addDocument: (customerId: string, document: Omit<CustomerDocument, 'id' | 'uploadDate'>) => void;
    deleteDocument: (customerId: string, documentId: string) => void;
}

const INITIAL_CUSTOMERS: Customer[] = [
    {
        id: 'cust-1',
        name: 'Nguyễn Minh Tuấn',
        dob: '1992-05-14',
        phone: '0912345678',
        email: 'tuan.nm@gmail.com',
        nationality: 'Việt Nam',
        status: 'active',
        currentRoomId: 'room-101',
        currentRoomNumber: '101',
        currentBuilding: 'Tòa nhà A',
        totalUnpaid: 4500000,
        documents: [
            {
                id: 'doc-1-1',
                type: 'cccd',
                fileName: 'CCCD_NguyenMinhTuan_MatTruoc.jpg',
                fileUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80',
                uploadDate: '2025-10-15T09:00:00Z'
            },
            {
                id: 'doc-1-2',
                type: 'cccd',
                fileName: 'CCCD_NguyenMinhTuan_MatSau.jpg',
                fileUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80',
                uploadDate: '2025-10-15T09:05:00Z'
            }
        ],
        contractHistory: [
            {
                id: 'CON-101',
                roomNumber: '101',
                buildingName: 'Tòa nhà A',
                price: 5200000,
                startDate: '2025-10-15',
                endDate: '2026-10-14',
                status: 'active'
            }
        ]
    },
    {
        id: 'cust-2',
        name: 'Trần Thị Lan',
        dob: '1995-11-20',
        phone: '0987654321',
        email: 'lan.tt@yahoo.com',
        nationality: 'Việt Nam',
        status: 'active',
        currentRoomId: 'room-102',
        currentRoomNumber: '102',
        currentBuilding: 'Tòa nhà A',
        totalUnpaid: 1200000,
        documents: [
            {
                id: 'doc-2-1',
                type: 'passport',
                fileName: 'Passport_TranThiLan.pdf',
                fileUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80',
                uploadDate: '2026-01-05T14:20:00Z'
            }
        ],
        contractHistory: [
            {
                id: 'CON-102',
                roomNumber: '102',
                buildingName: 'Tòa nhà A',
                price: 5500000,
                startDate: '2026-01-05',
                endDate: '2027-01-04',
                status: 'active'
            }
        ]
    },
    {
        id: 'cust-3',
        name: 'Lê Văn Long',
        dob: '1988-03-08',
        phone: '0933445566',
        email: 'long.lv@gmail.com',
        nationality: 'Việt Nam',
        status: 'active',
        currentRoomId: 'room-201',
        currentRoomNumber: '201',
        currentBuilding: 'Tòa nhà A',
        totalUnpaid: 0,
        documents: [
            {
                id: 'doc-3-1',
                type: 'cccd',
                fileName: 'CCCD_LeVanLong.jpg',
                fileUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80',
                uploadDate: '2026-02-15T10:15:00Z'
            }
        ],
        contractHistory: [
            {
                id: 'CON-201',
                roomNumber: '201',
                buildingName: 'Tòa nhà A',
                price: 6000000,
                startDate: '2026-02-15',
                endDate: '2027-02-14',
                status: 'active'
            }
        ]
    },
    {
        id: 'cust-4',
        name: 'Phạm Hồng Nhung',
        dob: '1997-07-25',
        phone: '0944556677',
        email: 'nhung.ph@hotmail.com',
        nationality: 'Việt Nam',
        status: 'active',
        currentRoomId: 'room-301',
        currentRoomNumber: '301',
        currentBuilding: 'Tòa nhà A',
        totalUnpaid: 0,
        documents: [],
        contractHistory: [
            {
                id: 'CON-301',
                roomNumber: '301',
                buildingName: 'Tòa nhà A',
                price: 6500000,
                startDate: '2026-03-01',
                endDate: '2027-03-01',
                status: 'active'
            }
        ]
    },
    {
        id: 'cust-5',
        name: 'Vũ Hoàng Nam',
        dob: '1990-09-12',
        phone: '0901234567',
        email: 'nam.vh@gmail.com',
        nationality: 'Việt Nam',
        status: 'active',
        currentRoomId: 'room-b101',
        currentRoomNumber: '101',
        currentBuilding: 'Tòa nhà B',
        totalUnpaid: 0,
        documents: [],
        contractHistory: [
            {
                id: 'CON-B101',
                roomNumber: '101',
                buildingName: 'Tòa nhà B',
                price: 4900000,
                startDate: '2026-04-01',
                endDate: '2027-04-01',
                status: 'active'
            }
        ]
    },
    {
        id: 'cust-6',
        name: 'John Smith',
        dob: '1985-02-18',
        phone: '0888999111',
        email: 'john.smith@gmail.com',
        nationality: 'Mỹ',
        status: 'potential',
        totalUnpaid: 0,
        documents: [
            {
                id: 'doc-6-1',
                type: 'passport',
                fileName: 'Passport_JohnSmith.pdf',
                fileUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80',
                uploadDate: '2026-05-10T08:30:00Z',
                expiryDate: '2030-02-18'
            },
            {
                id: 'doc-6-2',
                type: 'visa',
                fileName: 'Visa_Vietnam_JohnSmith.jpg',
                fileUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80',
                uploadDate: '2026-05-10T08:35:00Z',
                expiryDate: '2026-11-10'
            }
        ],
        contractHistory: []
    },
    {
        id: 'cust-7',
        name: 'Phạm Đức Anh',
        dob: '1994-04-05',
        phone: '0977888999',
        email: 'ducanh.p@gmail.com',
        nationality: 'Việt Nam',
        status: 'inactive',
        totalUnpaid: 0,
        documents: [],
        contractHistory: [
            {
                id: 'CON-099',
                roomNumber: '103',
                buildingName: 'Tòa nhà A',
                price: 4800000,
                startDate: '2025-05-01',
                endDate: '2026-05-01',
                status: 'expired'
            }
        ]
    }
];

export const useCustomerStore = create<CustomerState>((set) => ({
    customers: INITIAL_CUSTOMERS,
    searchQuery: '',
    statusFilter: 'all',
    selectedCustomerId: null,

    setSearchQuery: (query) => set({ searchQuery: query }),
    setStatusFilter: (status) => set({ statusFilter: status }),
    setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

    addCustomer: (customerData) => set((state) => {
        const newCustomer: Customer = {
            ...customerData,
            id: `cust-${Date.now()}`,
            documents: [],
            contractHistory: [],
            totalUnpaid: 0
        };
        return {
            customers: [newCustomer, ...state.customers]
        };
    }),

    updateCustomer: (id, customerData) => set((state) => ({
        customers: state.customers.map((c) => 
            c.id === id ? { ...c, ...customerData } : c
        )
    })),

    deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        selectedCustomerId: state.selectedCustomerId === id ? null : state.selectedCustomerId
    })),

    addDocument: (customerId, docData) => set((state) => {
        const newDoc: CustomerDocument = {
            ...docData,
            id: `doc-${Date.now()}`,
            uploadDate: new Date().toISOString()
        };

        return {
            customers: state.customers.map((c) => {
                if (c.id !== customerId) return c;
                return {
                    ...c,
                    documents: [newDoc, ...c.documents]
                };
            })
        };
    }),

    deleteDocument: (customerId, documentId) => set((state) => ({
        customers: state.customers.map((c) => {
            if (c.id !== customerId) return c;
            return {
                ...c,
                documents: c.documents.filter((d) => d.id !== documentId)
            };
        })
    }))
}));

import { create } from 'zustand';
import { Invoice, InvoiceStatus, InvoiceType, PaymentRecord } from '../types/revenue.type';
import { useCustomerStore } from '@/features/customer/store/customer-store';

interface RevenueState {
    invoices: Invoice[];
    searchQuery: string;
    statusFilter: string;
    typeFilter: string;
    selectedInvoiceId: string | null;

    // Actions
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    setTypeFilter: (type: string) => void;
    setSelectedInvoiceId: (id: string | null) => void;

    addInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'unpaidAmount' | 'status' | 'payments'>) => void;
    addPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'paymentDate'>) => void;
    confirmPaymentReceipt: (invoiceId: string) => void;
    cancelInvoice: (invoiceId: string) => void;
}

const INITIAL_INVOICES: Invoice[] = [
    {
        id: 'inv-1',
        invoiceNumber: 'INV-2026-001',
        roomId: 'room-101',
        roomNumber: '101',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-1',
        customerName: 'Nguyễn Minh Tuấn',
        type: 'room',
        amount: 5200000,
        paidAmount: 700000,
        unpaidAmount: 4500000,
        dueDate: '2026-05-15',
        issueDate: '2026-05-01',
        status: 'overdue',
        payments: [
            {
                id: 'pay-1-1',
                amount: 700000,
                paymentDate: '2026-05-14T10:00:00Z',
                paymentMethod: 'transfer',
                note: 'Khách thanh toán một phần trước'
            }
        ],
        notes: 'Tiền phòng kỳ tháng 05/2026. Còn nợ lại 4.5M.'
    },
    {
        id: 'inv-2',
        invoiceNumber: 'INV-2026-002',
        roomId: 'room-102',
        roomNumber: '102',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-2',
        customerName: 'Trần Thị Lan',
        type: 'utility',
        amount: 1200000,
        paidAmount: 0,
        unpaidAmount: 1200000,
        dueDate: '2026-05-25',
        issueDate: '2026-05-10',
        status: 'overdue',
        payments: [],
        notes: 'Tiền điện nước kỳ tháng 04/2026.'
    },
    {
        id: 'inv-3',
        invoiceNumber: 'INV-2026-003',
        roomId: 'room-201',
        roomNumber: '201',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-3',
        customerName: 'Lê Văn Long',
        type: 'room',
        amount: 6000000,
        paidAmount: 6000000,
        unpaidAmount: 0,
        dueDate: '2026-05-15',
        issueDate: '2026-05-01',
        status: 'paid',
        payments: [
            {
                id: 'pay-3-1',
                amount: 6000000,
                paymentDate: '2026-05-12T15:30:00Z',
                paymentMethod: 'qr',
                note: 'Thanh toán quét mã QR thành công'
            }
        ]
    },
    {
        id: 'inv-4',
        invoiceNumber: 'INV-2026-004',
        roomId: 'room-301',
        roomNumber: '301',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-4',
        customerName: 'Phạm Hồng Nhung',
        type: 'room',
        amount: 6500000,
        paidAmount: 6500000,
        unpaidAmount: 0,
        dueDate: '2026-05-15',
        issueDate: '2026-05-01',
        status: 'paid',
        payments: [
            {
                id: 'pay-4-1',
                amount: 6500000,
                paymentDate: '2026-05-13T09:15:00Z',
                paymentMethod: 'transfer',
                note: 'Chuyển khoản thanh toán tiền phòng T5'
            }
        ]
    },
    {
        id: 'inv-5',
        invoiceNumber: 'INV-2026-005',
        roomId: 'room-b101',
        roomNumber: '101',
        buildingName: 'Tòa nhà B',
        customerId: 'cust-5',
        customerName: 'Vũ Hoàng Nam',
        type: 'room',
        amount: 4900000,
        paidAmount: 4900000,
        unpaidAmount: 0,
        dueDate: '2026-05-15',
        issueDate: '2026-05-01',
        status: 'paid',
        payments: [
            {
                id: 'pay-5-1',
                amount: 4900000,
                paymentDate: '2026-05-14T17:40:00Z',
                paymentMethod: 'transfer'
            }
        ]
    },
    {
        id: 'inv-6',
        invoiceNumber: 'INV-2026-006',
        roomId: 'room-101',
        roomNumber: '101',
        buildingName: 'Tòa nhà A',
        customerId: 'cust-1',
        customerName: 'Nguyễn Minh Tuấn',
        type: 'utility',
        amount: 850000,
        paidAmount: 0,
        unpaidAmount: 850000,
        dueDate: '2026-06-15',
        issueDate: '2026-06-01',
        status: 'unpaid',
        payments: [],
        notes: 'Hóa đơn Điện nước kỳ tháng 05/2026 chốt ngày 31/05.'
    }
];

export const useRevenueStore = create<RevenueState>((set) => ({
    invoices: INITIAL_INVOICES,
    searchQuery: '',
    statusFilter: 'all',
    typeFilter: 'all',
    selectedInvoiceId: null,

    setSearchQuery: (query) => set({ searchQuery: query }),
    setStatusFilter: (status) => set({ statusFilter: status }),
    setTypeFilter: (type) => set({ typeFilter: type }),
    setSelectedInvoiceId: (id) => set({ selectedInvoiceId: id }),

    addInvoice: (invoiceData) => set((state) => {
        const invNum = `INV-${new Date().getFullYear()}-${String(state.invoices.length + 1).padStart(3, '0')}`;
        const newInvoice: Invoice = {
            ...invoiceData,
            id: `inv-${Date.now()}`,
            invoiceNumber: invNum,
            paidAmount: 0,
            unpaidAmount: invoiceData.amount,
            status: 'unpaid',
            payments: []
        };

        // Sync Customer Store: Increase customer's total unpaid debts
        const customerStore = useCustomerStore.getState();
        const customer = customerStore.customers.find(c => c.id === invoiceData.customerId);
        if (customer) {
            customerStore.updateCustomer(invoiceData.customerId, {
                totalUnpaid: customer.totalUnpaid + invoiceData.amount
            });
        }

        return {
            invoices: [newInvoice, ...state.invoices]
        };
    }),

    addPayment: (invoiceId, paymentData) => set((state) => {
        const newPayment: PaymentRecord = {
            ...paymentData,
            id: `pay-${Date.now()}`,
            paymentDate: new Date().toISOString()
        };

        return {
            invoices: state.invoices.map((inv) => {
                if (inv.id !== invoiceId) return inv;

                const newPaid = inv.paidAmount + paymentData.amount;
                const newUnpaid = Math.max(0, inv.amount - newPaid);
                const newStatus: InvoiceStatus = newUnpaid === 0 ? 'paid' : 'partial';

                // Sync Customer Store: Deduct customer outstanding balance
                const customerStore = useCustomerStore.getState();
                const customer = customerStore.customers.find(c => c.id === inv.customerId);
                if (customer) {
                    customerStore.updateCustomer(inv.customerId, {
                        totalUnpaid: Math.max(0, customer.totalUnpaid - paymentData.amount)
                    });
                }

                return {
                    ...inv,
                    paidAmount: newPaid,
                    unpaidAmount: newUnpaid,
                    status: newStatus,
                    payments: [newPayment, ...inv.payments]
                };
            })
        };
    }),

    confirmPaymentReceipt: (invoiceId) => set((state) => {
        return {
            invoices: state.invoices.map((inv) => {
                if (inv.id !== invoiceId) return inv;
                if (inv.status === 'paid') return inv;

                const remaining = inv.unpaidAmount;
                const confirmPay: PaymentRecord = {
                    id: `pay-conf-${Date.now()}`,
                    amount: remaining,
                    paymentDate: new Date().toISOString(),
                    paymentMethod: 'transfer',
                    note: 'Xác nhận đối soát chuyển khoản ngân hàng thành công'
                };

                // Sync Customer Store
                const customerStore = useCustomerStore.getState();
                const customer = customerStore.customers.find(c => c.id === inv.customerId);
                if (customer) {
                    customerStore.updateCustomer(inv.customerId, {
                        totalUnpaid: Math.max(0, customer.totalUnpaid - remaining)
                    });
                }

                return {
                    ...inv,
                    paidAmount: inv.amount,
                    unpaidAmount: 0,
                    status: 'paid',
                    payments: [confirmPay, ...inv.payments]
                };
            })
        };
    }),

    cancelInvoice: (invoiceId) => set((state) => {
        return {
            invoices: state.invoices.map((inv) => {
                if (inv.id !== invoiceId) return inv;
                if (inv.status === 'cancelled') return inv;

                // Sync Customer Store
                const customerStore = useCustomerStore.getState();
                const customer = customerStore.customers.find(c => c.id === inv.customerId);
                if (customer) {
                    customerStore.updateCustomer(inv.customerId, {
                        totalUnpaid: Math.max(0, customer.totalUnpaid - inv.unpaidAmount)
                    });
                }

                return {
                    ...inv,
                    status: 'cancelled',
                    unpaidAmount: 0
                };
            })
        };
    })
}));

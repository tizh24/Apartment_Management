export type InvoiceStatus = 'unpaid' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export type InvoiceType = 'room' | 'utility' | 'service' | 'other';

export interface PaymentRecord {
    id: string;
    amount: number;
    paymentDate: string; // ISO date
    paymentMethod: 'transfer' | 'cash' | 'qr';
    receiptUrl?: string; // bank transfer receipt photo
    note?: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string; // e.g. 'INV-2026-001'
    roomId: string;
    roomNumber: string;
    buildingName: string;
    customerId: string;
    customerName: string;
    type: InvoiceType;
    amount: number;
    paidAmount: number;
    unpaidAmount: number;
    dueDate: string; // YYYY-MM-DD
    issueDate: string; // YYYY-MM-DD
    status: InvoiceStatus;
    payments: PaymentRecord[];
    receiptUrl?: string; // payment verification proof image
    notes?: string;
}

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/features/dashboard/components/layouts';
import { InvoiceDetail } from '@/features/revenue/components';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { useRevenueStore } from '@/features/revenue/store/revenue-store';

export default function AdminRevenueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { invoices, addPayment, confirmPaymentReceipt, cancelInvoice } = useRevenueStore();
    const invoice = invoices.find((inv) => inv.id === id);

    if (!invoice) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center space-y-4">
                    <h2 className="text-lg font-bold text-[#3f2d28]">Không tìm thấy hóa đơn</h2>
                    <p className="text-sm text-[#8f6f64]">Hóa đơn yêu cầu không tồn tại hoặc đã bị xóa.</p>
                    <button
                        onClick={() => router.push('/admin/revenue')}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#ff385c] rounded-xl hover:bg-[#e00b41]"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header Row containing Breadcrumb */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Breadcrumb>
                        <BreadcrumbList className="text-sm text-[#8f6f64]">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild className="hover:text-[#5b463f] transition-colors">
                                    <Link href="/admin">Admin</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild className="hover:text-[#5b463f] transition-colors font-medium">
                                    <Link href="/admin/revenue">Doanh thu & Khoản thu</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-[#3f2d28]">
                                    Chi tiết hóa đơn {invoice.invoiceNumber}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Detail Component */}
                <InvoiceDetail
                    invoice={invoice}
                    onBack={() => router.push('/admin/revenue')}
                    onAddPayment={addPayment}
                    onConfirmReceipt={confirmPaymentReceipt}
                    onCancelInvoice={cancelInvoice}
                />
            </div>
        </DashboardLayout>
    );
}

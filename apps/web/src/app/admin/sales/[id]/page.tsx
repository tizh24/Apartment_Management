'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/features/dashboard/components/layouts';
import { SaleDetail, SaleForm } from '@/features/sale/components';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { useSaleStore } from '@/features/sale/store/sale-store';

export default function AdminSaleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { sales, commissions, updateSale, payCommissions } = useSaleStore();
    const sale = sales.find((s) => s.id === id);

    const [isEditOpen, setIsEditOpen] = useState(false);

    if (!sale) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center space-y-4">
                    <h2 className="text-lg font-bold text-[#3f2d28]">Không tìm thấy CTV</h2>
                    <p className="text-sm text-[#8f6f64]">Hồ sơ cộng tác viên yêu cầu không tồn tại hoặc đã bị xóa.</p>
                    <button
                        onClick={() => router.push('/admin/sales')}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#ff385c] rounded-xl hover:bg-[#e00b41]"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const handleUpdateSale = (saleData: any) => {
        updateSale(sale.id, saleData);
        setIsEditOpen(false);
    };

    const handleToggleStatus = (saleId: string, newStatus: 'active' | 'inactive') => {
        updateSale(saleId, { status: newStatus });
    };

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
                                    <Link href="/admin/sales">Sale & Hoa hồng</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-[#3f2d28]">
                                    Chi tiết CTV {sale.name}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Detail Component */}
                <SaleDetail
                    sale={sale}
                    commissions={commissions}
                    onBack={() => router.push('/admin/sales')}
                    onEdit={() => setIsEditOpen(true)}
                    onToggleStatus={handleToggleStatus}
                    onPayCommissions={payCommissions}
                />

                {/* Edit Form Modal */}
                {isEditOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            <SaleForm
                                sale={sale}
                                onSubmit={handleUpdateSale}
                                onCancel={() => setIsEditOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

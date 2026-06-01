'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/features/dashboard/components/layouts';
import { CustomerDetail, CustomerForm } from '@/features/customer/components';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { useCustomerStore } from '@/features/customer/store/customer-store';

export default function AdminCustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { 
        customers, 
        updateCustomer, 
        deleteCustomer, 
        addDocument, 
        deleteDocument 
    } = useCustomerStore();
    
    const customer = customers.find((c) => c.id === id);

    const [isFormOpen, setIsFormOpen] = useState(false);

    if (!customer) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center space-y-4">
                    <h2 className="text-lg font-bold text-[#3f2d28]">Không tìm thấy khách hàng</h2>
                    <p className="text-sm text-[#8f6f64]">Hồ sơ khách hàng yêu cầu không tồn tại hoặc đã bị xóa.</p>
                    <button
                        onClick={() => router.push('/admin/customers')}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#ff385c] rounded-xl hover:bg-[#e00b41]"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const handleFormSubmit = (customerData: any) => {
        updateCustomer(customer.id, customerData);
        setIsFormOpen(false);
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
                                    <Link href="/admin/customers">Quản lý khách hàng</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-[#3f2d28]">
                                    Hồ sơ: {customer.name}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Detail View Component */}
                <CustomerDetail
                    customer={customer}
                    onBack={() => router.push('/admin/customers')}
                    onEdit={() => setIsFormOpen(true)}
                    onDelete={(custId) => {
                        deleteCustomer(custId);
                        router.push('/admin/customers');
                    }}
                    onAddDocument={addDocument}
                    onDeleteDocument={deleteDocument}
                />

                {/* Edit Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            <CustomerForm
                                customer={customer}
                                onSubmit={handleFormSubmit}
                                onCancel={() => setIsFormOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

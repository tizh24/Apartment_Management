'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/features/dashboard/components/layouts';
import { RoomDetail, RoomForm } from '@/features/room/components';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { useRoomStore } from '@/features/room/store/room-store';

export default function AdminRoomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { rooms, updateRoom, deleteRoom, addUtilityReading, updateRoomStatus, assignTenant, removeTenant } = useRoomStore();
    const room = rooms.find((r) => r.id === id);

    const [isFormOpen, setIsFormOpen] = useState(false);

    if (!room) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center space-y-4">
                    <h2 className="text-lg font-bold text-[#3f2d28]">Không tìm thấy phòng</h2>
                    <p className="text-sm text-[#8f6f64]">Căn phòng yêu cầu không tồn tại hoặc đã bị xóa.</p>
                    <button
                        onClick={() => router.push('/admin/rooms')}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#ff385c] rounded-xl hover:bg-[#e00b41]"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const handleFormSubmit = (roomData: any) => {
        updateRoom(room.id, roomData);
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
                                    <Link href="/admin/rooms">Quản lý phòng</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-[#3f2d28]">
                                    Chi tiết phòng P.{room.roomNumber}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Detail Component */}
                <RoomDetail
                    room={room}
                    onBack={() => router.push('/admin/rooms')}
                    onEdit={() => setIsFormOpen(true)}
                    onDelete={(roomId) => {
                        deleteRoom(roomId);
                        router.push('/admin/rooms');
                    }}
                    onAddUtilityReading={addUtilityReading}
                    onUpdateStatus={updateRoomStatus}
                    onAssignTenant={assignTenant}
                    onRemoveTenant={removeTenant}
                />

                {/* Edit Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            <RoomForm
                                room={room}
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

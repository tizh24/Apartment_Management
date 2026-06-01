'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/features/dashboard/components/layouts';
import { RoomList, RoomForm } from '@/features/room/components';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useRoomStore } from '@/features/room/store/room-store';

export default function AdminRoomsPage() {
    const { addRoom } = useRoomStore();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const handleCreateRoom = (roomData: any) => {
        addRoom(roomData);
        setIsCreateOpen(false);
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header line containing Breadcrumb and CTA Button */}
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
                                <BreadcrumbPage className="font-semibold text-[#3f2d28]">
                                    Quản lý phòng
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* "Thêm phòng mới" button */}
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm phòng mới
                    </button>
                </div>

                {/* Main room list container */}
                <RoomList />

                {/* Create Room Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            <RoomForm
                                room={null}
                                onSubmit={handleCreateRoom}
                                onCancel={() => setIsCreateOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

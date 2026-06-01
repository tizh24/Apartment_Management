import React from 'react';
import { RoomStatus } from '../types/room.type';
import { CheckCircle, DoorOpen, Wrench, CalendarRange } from 'lucide-react';

interface RoomStatusBadgeProps {
    status: RoomStatus;
    className?: string;
}

export function RoomStatusBadge({ status, className = '' }: RoomStatusBadgeProps) {
    const config = {
        vacant: {
            bg: 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]',
            label: 'Trống',
            icon: DoorOpen
        },
        occupied: {
            bg: 'bg-[#ffebee] text-[#ff385c] border-[#ffcdd2]',
            label: 'Đang thuê',
            icon: CheckCircle
        },
        reserved: {
            bg: 'bg-[#e3f2fd] text-[#1565c0] border-[#bbdefb]',
            label: 'Đã giữ chỗ',
            icon: CalendarRange
        },
        maintenance: {
            bg: 'bg-[#fff3e0] text-[#ef6c00] border-[#ffe0b2]',
            label: 'Bảo trì',
            icon: Wrench
        }
    };

    const current = config[status] || config.vacant;
    const Icon = current.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${current.bg} ${className}`}
        >
            <Icon className="h-3 w-3" />
            {current.label}
        </span>
    );
}

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConflictCheckerProps {
    roomId: string;
    startDate: string;
    endDate: string;
    existingContracts: Array<{
        roomId: string;
        roomNumber: string;
        startDate: string;
        endDate: string;
        status: string;
    }>;
}

export function ConflictChecker({ roomId, startDate, endDate, existingContracts }: ConflictCheckerProps) {
    if (!roomId || !startDate || !endDate) return null;

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) return null;

    // Filter active overlaps for the same room
    const conflicts = existingContracts.filter((c) => {
        if (c.roomId !== roomId) return false;
        if (c.status !== 'active') return false;

        const cStart = new Date(c.startDate);
        const cEnd = new Date(c.endDate);

        // Conflict check: c.start <= end AND c.end >= start
        return cStart <= parsedEnd && cEnd >= parsedStart;
    });

    const hasConflict = conflicts.length > 0;

    return (
        <div className={`p-4 rounded-xl border text-xs flex gap-2.5 ${
            hasConflict 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
            {hasConflict ? (
                <>
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500 animate-bounce" />
                    <div>
                        <p className="font-bold">⚠️ Cảnh báo xung đột lịch thuê!</p>
                        <p className="opacity-90 mt-0.5">
                            Phòng này đang có hợp đồng hoạt động trùng lặp từ <strong>{conflicts[0].startDate}</strong> đến <strong>{conflicts[0].endDate}</strong>.
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    <div>
                        <p className="font-bold">✔ Lịch thuê hoàn toàn hợp lệ</p>
                        <p className="opacity-90 mt-0.5">
                            Không có xung đột lịch thuê nào được ghi nhận cho khoảng thời gian này.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

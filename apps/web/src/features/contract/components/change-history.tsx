import React from 'react';
import { ContractChange } from '../types/contract.type';
import { Clock, Plus, RefreshCw, StopCircle, Ban, User, Calendar } from 'lucide-react';

interface ChangeHistoryProps {
    history: ContractChange[];
}

export function ChangeHistory({ history }: ChangeHistoryProps) {
    const formatDate = (isoStr: string) => {
        return new Date(isoStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'create':
                return <Plus className="h-3.5 w-3.5 text-emerald-600" />;
            case 'renew':
                return <RefreshCw className="h-3.5 w-3.5 text-blue-600" />;
            case 'terminate':
                return <StopCircle className="h-3.5 w-3.5 text-orange-600" />;
            case 'cancel':
                return <Ban className="h-3.5 w-3.5 text-red-600" />;
            default:
                return <Clock className="h-3.5 w-3.5 text-slate-600" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'create': return 'bg-emerald-50 border-emerald-200';
            case 'renew': return 'bg-blue-50 border-blue-200';
            case 'terminate': return 'bg-orange-50 border-orange-200';
            case 'cancel': return 'bg-red-50 border-red-200';
            default: return 'bg-slate-50 border-slate-200';
        }
    };

    if (history.length === 0) return null;

    return (
        <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#3f2d28] uppercase tracking-wider mb-2">Nhật ký thay đổi hợp đồng</h4>
            
            <div className="relative border-l border-[#fcd5ce] pl-4 ml-2.5 space-y-4">
                {history.map((change) => (
                    <div key={change.id} className="relative">
                        {/* Timeline Orb */}
                        <div className={`absolute -left-[27px] top-0.5 rounded-full border p-1 bg-white shadow-sm flex items-center justify-center`}>
                            {getIcon(change.actionType)}
                        </div>

                        {/* Audit Details */}
                        <div className={`rounded-xl border p-3 text-xs text-[#5b463f] ${getBgColor(change.actionType)}`}>
                            <p className="font-bold text-[#3f2d28]">{change.description}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#caa79a] mt-1.5 pt-1.5 border-t border-[#caa79a]/10">
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Người duyệt: {change.changedBy}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Thời điểm: {formatDate(change.changeDate)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import React from 'react';
import { CustomerDocument } from '../types/customer.type';
import { FileText, Calendar, Eye, Trash2, Download, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DocumentViewerProps {
    documents: CustomerDocument[];
    onDelete: (id: string) => void;
}

export function DocumentViewer({ documents, onDelete }: DocumentViewerProps) {
    const formatDate = (isoStr: string) => {
        return new Date(isoStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const isExpired = (expiryStr?: string) => {
        if (!expiryStr) return false;
        return new Date(expiryStr) < new Date();
    };

    const getDocBadge = (type: string) => {
        const config = {
            cccd: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            passport: 'bg-sky-50 text-sky-700 border-sky-200',
            visa: 'bg-pink-50 text-pink-700 border-pink-200',
            other: 'bg-slate-50 text-slate-700 border-slate-200'
        };
        const labels = { cccd: 'CCCD', passport: 'Hộ chiếu', visa: 'Thị thực/Visa', other: 'Khác' };
        return (
            <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase ${config[type as keyof typeof config] || config.other}`}>
                {labels[type as keyof typeof labels] || 'Khác'}
            </span>
        );
    };

    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white rounded-2xl border border-[#fcd5ce] p-6">
                <ShieldCheck className="h-8 w-8 text-[#caa79a] mb-2" />
                <p className="text-sm font-medium text-[#5b463f]">Chưa có giấy tờ đính kèm</p>
                <p className="text-xs text-[#b89184] mt-1 max-w-xs">
                    Tải lên CCCD hoặc Hộ chiếu để phục vụ chốt hợp đồng và đăng ký tạm trú.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc) => {
                const expired = isExpired(doc.expiryDate);
                return (
                    <div
                        key={doc.id}
                        className={`rounded-2xl border bg-white p-4 shadow-sm relative flex flex-col justify-between transition-shadow hover:shadow-md ${
                            expired ? 'border-red-300' : 'border-[#fcd5ce]'
                        }`}
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                {getDocBadge(doc.type)}
                                {expired && (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 border border-red-200 animate-pulse">
                                        <AlertTriangle className="h-3 w-3" />
                                        Hết hạn sử dụng!
                                    </span>
                                )}
                            </div>

                            <div className="flex items-start gap-2 pt-1">
                                <FileText className={`h-8 w-8 shrink-0 ${expired ? 'text-red-400' : 'text-[#caa79a]'}`} />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#3f2d28] truncate" title={doc.fileName}>
                                        {doc.fileName}
                                    </p>
                                    <p className="text-[10px] text-[#b89184] flex items-center gap-1 mt-0.5">
                                        <Calendar className="h-3 w-3" />
                                        Ngày ghi: {formatDate(doc.uploadDate)}
                                    </p>
                                    {doc.expiryDate && (
                                        <p className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${expired ? 'text-red-600' : 'text-[#8f6f64]'}`}>
                                            <AlertTriangle className="h-3 w-3" />
                                            Hạn dùng: {formatDate(doc.expiryDate)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#fcd5ce]/20 flex items-center justify-end gap-1">
                            <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 hover:text-[#ff385c] hover:bg-[#fff8f6] rounded-lg border border-transparent hover:border-[#fcd5ce] transition-all"
                                title="Xem tài liệu"
                            >
                                <Eye className="h-4 w-4" />
                            </a>
                            <a
                                href={doc.fileUrl}
                                download={doc.fileName}
                                className="p-1.5 hover:text-[#ff385c] hover:bg-[#fff8f6] rounded-lg border border-transparent hover:border-[#fcd5ce] transition-all"
                                title="Tải tài liệu"
                            >
                                <Download className="h-4 w-4" />
                            </a>
                            <button
                                onClick={() => {
                                    if (confirm(`Bạn có chắc muốn xóa tài liệu ${doc.fileName}?`)) {
                                        onDelete(doc.id);
                                    }
                                }}
                                className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all cursor-pointer"
                                title="Xóa tài liệu"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

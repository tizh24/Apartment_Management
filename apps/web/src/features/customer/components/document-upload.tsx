import React, { useState } from 'react';
import { DocumentType } from '../types/customer.type';
import { FileUp, Sparkles, X, Plus, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
    onSubmit: (docData: {
        type: DocumentType;
        fileName: string;
        fileUrl: string;
        expiryDate?: string;
    }) => void;
    onCancel: () => void;
}

const MOCK_DOCS = [
    { name: 'CCCD_NguyenVanA_MatTruoc.jpg', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80' },
    { name: 'Passport_JohnDoe.pdf', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80' },
    { name: 'Vietnam_Visa_JaneDoe.jpg', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80' }
];

export function DocumentUpload({ onSubmit, onCancel }: DocumentUploadProps) {
    const [type, setType] = useState<DocumentType>('cccd');
    const [fileName, setFileName] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [error, setError] = useState('');

    const handleAutoGenerate = () => {
        const rand = MOCK_DOCS[Math.floor(Math.random() * MOCK_DOCS.length)];
        setFileName(rand.name);
        setFileUrl(rand.url);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fileName.trim()) {
            setError('Vui lòng nhập tên tài liệu.');
            return;
        }

        onSubmit({
            type,
            fileName,
            fileUrl: fileUrl || 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80',
            expiryDate: expiryDate || undefined
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-[#fff8f6] p-5 rounded-2xl border border-[#fcd5ce]">
            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-2.5 mb-1">
                <h4 className="text-xs font-bold text-[#3f2d28] uppercase tracking-wider">Đính kèm giấy tờ cá nhân</h4>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-[#8f6f64] hover:text-[#ff385c]"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Loại giấy tờ */}
                <div>
                    <label className="block text-[10px] font-bold text-[#5b463f] mb-1.5 uppercase">Loại giấy tờ *</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as DocumentType)}
                        className="w-full px-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                        required
                    >
                        <option value="cccd">Căn cước công dân (CCCD)</option>
                        <option value="passport">Hộ chiếu (Passport)</option>
                        <option value="visa">Thị thực (Vietnam Visa)</option>
                        <option value="other">Giấy tờ khác</option>
                    </select>
                </div>

                {/* Hạn sử dụng */}
                <div>
                    <label className="block text-[10px] font-bold text-[#5b463f] mb-1.5 uppercase">Hạn sử dụng</label>
                    <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                    />
                </div>

                {/* Tên file */}
                <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#5b463f] mb-1.5 uppercase">Tên tài liệu đính kèm *</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="Ví dụ: Passport_NguyenVanA.pdf"
                            className="w-full px-3 py-2 rounded-xl border border-[#fcd5ce] bg-white text-xs text-[#3f2d28] outline-none focus:border-[#ff385c]"
                            required
                        />
                        <button
                            type="button"
                            onClick={handleAutoGenerate}
                            className="inline-flex items-center gap-1 shrink-0 px-3 py-2 border border-[#fcd5ce] text-[#5b463f] hover:bg-[#fcd5ce]/30 rounded-xl text-[11px] font-semibold transition-colors"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-[#ff385c]" />
                            Tải ảnh mẫu
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#fcd5ce]/30">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#5b463f] rounded-lg border border-[#fcd5ce] hover:bg-white transition-colors"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-lg shadow-sm cursor-pointer"
                >
                    <FileUp className="h-3.5 w-3.5" />
                    Đính kèm tài liệu
                </button>
            </div>
        </form>
    );
}

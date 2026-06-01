import React, { useState } from 'react';
import { useSettingsStore } from '../store/settings-store';
import { 
    Settings, Coins, FileText, Landmark, Save, ShieldAlert, CheckCircle2,
    ToggleLeft, ToggleRight, Info, AlertTriangle
} from 'lucide-react';

export function SettingsPanel() {
    const { 
        settings, 
        updateGeneralSettings, 
        updatePricingSettings, 
        updateContractSettings, 
        updateBankSettings 
    } = useSettingsStore();

    const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'contract' | 'bank'>('general');
    const [successMessage, setSuccessMessage] = useState('');

    // General tab state
    const [systemName, setSystemName] = useState(settings.general.systemName);
    const [companyName, setCompanyName] = useState(settings.general.companyName);
    const [hotline, setHotline] = useState(settings.general.hotline);
    const [address, setAddress] = useState(settings.general.address);
    const [email, setEmail] = useState(settings.general.email);

    // Pricing tab state
    const [electricityPrice, setElectricityPrice] = useState(settings.pricing.electricityPrice);
    const [waterPrice, setWaterPrice] = useState(settings.pricing.waterPrice);
    const [internetFee, setInternetFee] = useState(settings.pricing.internetFee);
    const [serviceFee, setServiceFee] = useState(settings.pricing.serviceFee);
    const [trashFee, setTrashFee] = useState(settings.pricing.trashFee);

    // Contract tab state
    const [defaultDepositMonths, setDefaultDepositMonths] = useState(settings.contract.defaultDepositMonths);
    const [commissionRate, setCommissionRate] = useState(settings.contract.commissionRate);
    const [expiryWarningDays, setExpiryWarningDays] = useState(settings.contract.expiryWarningDays);
    const [lateFeePercentage, setLateFeePercentage] = useState(settings.contract.lateFeePercentage);

    // Bank tab state
    const [bankName, setBankName] = useState(settings.bank.bankName);
    const [accountNumber, setAccountNumber] = useState(settings.bank.accountNumber);
    const [accountName, setAccountName] = useState(settings.bank.accountName);
    const [autoReconciliation, setAutoReconciliation] = useState(settings.bank.autoReconciliation);

    const triggerToast = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleSaveGeneral = (e: React.FormEvent) => {
        e.preventDefault();
        updateGeneralSettings({ systemName, companyName, hotline, address, email });
        triggerToast('Đã lưu cài đặt thông tin hệ thống thành công.');
    };

    const handleSavePricing = (e: React.FormEvent) => {
        e.preventDefault();
        updatePricingSettings({ 
            electricityPrice: Number(electricityPrice), 
            waterPrice: Number(waterPrice), 
            internetFee: Number(internetFee), 
            serviceFee: Number(serviceFee), 
            trashFee: Number(trashFee) 
        });
        triggerToast('Đã cập nhật biểu phí dịch vụ và năng lượng mới.');
    };

    const handleSaveContract = (e: React.FormEvent) => {
        e.preventDefault();
        updateContractSettings({ 
            defaultDepositMonths: Number(defaultDepositMonths), 
            commissionRate: Number(commissionRate), 
            expiryWarningDays: Number(expiryWarningDays), 
            lateFeePercentage: Number(lateFeePercentage) 
        });
        triggerToast('Đã cập nhật chính sách hợp đồng và phạt quá hạn.');
    };

    const handleSaveBank = (e: React.FormEvent) => {
        e.preventDefault();
        updateBankSettings({ bankName, accountNumber, accountName, autoReconciliation });
        triggerToast('Đã lưu cấu hình tài khoản ngân hàng thụ hưởng.');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Sidebar Tabs */}
            <div className="md:col-span-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 bg-[#fff8f6] border border-[#fcd5ce] p-2.5 rounded-3xl h-fit shadow-inner">
                
                {/* General Settings Tab */}
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-2.5 px-4 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap md:w-full ${
                        activeTab === 'general'
                            ? 'bg-[#ff385c] text-white shadow-md'
                            : 'text-[#8f6f64] hover:bg-white hover:text-[#ff385c]'
                    }`}
                >
                    <Settings className="h-4.5 w-4.5" />
                    <span>Cài đặt chung</span>
                </button>

                {/* Service Pricing Tab */}
                <button
                    onClick={() => setActiveTab('pricing')}
                    className={`flex items-center gap-2.5 px-4 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap md:w-full ${
                        activeTab === 'pricing'
                            ? 'bg-[#ff385c] text-white shadow-md'
                            : 'text-[#8f6f64] hover:bg-white hover:text-[#ff385c]'
                    }`}
                >
                    <Coins className="h-4.5 w-4.5" />
                    <span>Biểu phí dịch vụ</span>
                </button>

                {/* Lease Policies Tab */}
                <button
                    onClick={() => setActiveTab('contract')}
                    className={`flex items-center gap-2.5 px-4 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap md:w-full ${
                        activeTab === 'contract'
                            ? 'bg-[#ff385c] text-white shadow-md'
                            : 'text-[#8f6f64] hover:bg-white hover:text-[#ff385c]'
                    }`}
                >
                    <FileText className="h-4.5 w-4.5" />
                    <span>Chính sách thuê phòng</span>
                </button>

                {/* Payment Gateway Tab */}
                <button
                    onClick={() => setActiveTab('bank')}
                    className={`flex items-center gap-2.5 px-4 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap md:w-full ${
                        activeTab === 'bank'
                            ? 'bg-[#ff385c] text-white shadow-md'
                            : 'text-[#8f6f64] hover:bg-white hover:text-[#ff385c]'
                    }`}
                >
                    <Landmark className="h-4.5 w-4.5" />
                    <span>Cổng thanh toán</span>
                </button>

            </div>

            {/* Sub-form Panels */}
            <div className="md:col-span-3 space-y-4">
                
                {/* Success Toast banner */}
                {successMessage && (
                    <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl shadow-sm animate-in fade-in slide-in-from-top duration-200">
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="bg-white border border-[#fcd5ce] rounded-3xl p-6 shadow-sm">
                    
                    {/* General Settings Panel */}
                    {activeTab === 'general' && (
                        <form onSubmit={handleSaveGeneral} className="space-y-6">
                            <div className="pb-3 border-b border-[#fcd5ce]/30">
                                <h3 className="text-sm font-bold text-[#3f2d28]">Cấu hình hệ thống chung</h3>
                                <p className="text-[10px] text-[#caa79a]">Quản lý tên thương hiệu, thông tin vận hành và kênh liên lạc hỗ trợ.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Tên ứng dụng hệ thống</label>
                                    <input
                                        type="text"
                                        value={systemName}
                                        onChange={(e) => setSystemName(e.target.value)}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Tên doanh nghiệp / Đơn vị vận hành</label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Hotline hỗ trợ khẩn cấp</label>
                                    <input
                                        type="text"
                                        value={hotline}
                                        onChange={(e) => setHotline(e.target.value)}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Email liên hệ chính thức</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs font-bold text-[#5b463f]">Địa chỉ trụ sở điều hành</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#fcd5ce]/30 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer animate-in fade-in duration-200"
                                >
                                    <Save className="h-4.5 w-4.5" />
                                    Lưu cấu hình hệ thống
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Service Pricing Panel */}
                    {activeTab === 'pricing' && (
                        <form onSubmit={handleSavePricing} className="space-y-6">
                            <div className="pb-3 border-b border-[#fcd5ce]/30">
                                <h3 className="text-sm font-bold text-[#3f2d28]">Biểu phí dịch vụ & Điện nước</h3>
                                <p className="text-[10px] text-[#caa79a]">Đơn giá này được sử dụng để tự động tính toán hóa đơn khi chốt chỉ số điện nước định kỳ.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Đơn giá Điện (đ/kWh)</label>
                                    <input
                                        type="number"
                                        value={electricityPrice}
                                        onChange={(e) => setElectricityPrice(Number(e.target.value))}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Đơn giá Nước sinh hoạt (đ/m³)</label>
                                    <input
                                        type="number"
                                        value={waterPrice}
                                        onChange={(e) => setWaterPrice(Number(e.target.value))}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Phí Internet / WiFi (đ/phòng/tháng)</label>
                                    <input
                                        type="number"
                                        value={internetFee}
                                        onChange={(e) => setInternetFee(Number(e.target.value))}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Phí dịch vụ chung (Thang máy, dọn dẹp) (đ/phòng/tháng)</label>
                                    <input
                                        type="number"
                                        value={serviceFee}
                                        onChange={(e) => setServiceFee(Number(e.target.value))}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Phí thu gom rác (đ/phòng/tháng)</label>
                                    <input
                                        type="number"
                                        value={trashFee}
                                        onChange={(e) => setTrashFee(Number(e.target.value))}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#fcd5ce]/30 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer animate-in fade-in duration-200"
                                >
                                    <Save className="h-4.5 w-4.5" />
                                    Lưu biểu phí dịch vụ
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Lease Policy Panel */}
                    {activeTab === 'contract' && (
                        <form onSubmit={handleSaveContract} className="space-y-6">
                            <div className="pb-3 border-b border-[#fcd5ce]/30">
                                <h3 className="text-sm font-bold text-[#3f2d28]">Chính sách thuê phòng & Hợp đồng</h3>
                                <p className="text-[10px] text-[#caa79a]">Cài đặt các tham số mặc định áp dụng khi ký hợp đồng và các điều khoản nộp muộn.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Số tháng cọc mặc định</label>
                                    <select
                                        value={defaultDepositMonths}
                                        onChange={(e) => setDefaultDepositMonths(Number(e.target.value))}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2.5 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c] cursor-pointer"
                                    >
                                        <option value="1">1 tháng cọc</option>
                                        <option value="2">2 tháng cọc</option>
                                        <option value="3">3 tháng cọc</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Tỷ lệ hoa hồng giới thiệu của Sale mặc định (%)</label>
                                    <input
                                        type="number"
                                        value={commissionRate}
                                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        min="0"
                                        max="100"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Cảnh báo hết hạn hợp đồng trước (ngày)</label>
                                    <input
                                        type="number"
                                        value={expiryWarningDays}
                                        onChange={(e) => setExpiryWarningDays(Number(e.target.value))}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Tỷ lệ phạt nộp muộn hóa đơn (% / ngày)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={lateFeePercentage}
                                        onChange={(e) => setLateFeePercentage(Number(e.target.value))}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex gap-2 text-[11px] text-amber-800">
                                <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="font-bold">Lưu ý chính sách nộp muộn:</p>
                                    <p className="mt-0.5">Hệ thống sẽ dựa vào tỷ lệ phạt trên mỗi ngày nộp muộn sau khi quá hạn nộp hóa đơn (DueDate) để tính thêm khoản phạt tích lũy cộng dồn vào hóa đơn thanh toán tiếp theo.</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#fcd5ce]/30 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer animate-in fade-in duration-200"
                                >
                                    <Save className="h-4.5 w-4.5" />
                                    Lưu quy định hợp đồng
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Payment Gateway Panel */}
                    {activeTab === 'bank' && (
                        <form onSubmit={handleSaveBank} className="space-y-6">
                            <div className="pb-3 border-b border-[#fcd5ce]/30">
                                <h3 className="text-sm font-bold text-[#3f2d28]">Tài khoản ngân hàng thụ hưởng & Quyết toán</h3>
                                <p className="text-[10px] text-[#caa79a]">Cài đặt số tài khoản ngân hàng thụ hưởng để tự động tạo mã QR VietQR thu tiền phòng và đối soát.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Tên Ngân hàng thụ hưởng</label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#5b463f]">Số tài khoản nhận tiền</label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs font-bold text-[#5b463f]">Họ tên chủ tài khoản viết hoa (không dấu)</label>
                                    <input
                                        type="text"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                                        className="w-full bg-white border border-[#fcd5ce] rounded-xl px-3 py-2 text-xs text-[#3f2d28] outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c]"
                                        required
                                    />
                                </div>
                                
                                {/* Toggle switch for auto reconciling */}
                                <div className="sm:col-span-2 flex items-center justify-between p-3.5 border border-[#fcd5ce] rounded-2xl bg-[#fff8f6]/50">
                                    <div className="space-y-0.5 max-w-[80%]">
                                        <label className="text-xs font-bold text-[#5b463f] block">Tự động đối soát ngân hàng qua API Webhook</label>
                                        <span className="text-[10px] text-[#caa79a] block">Khi bật, hệ thống tự động kiểm tra số dư và tự đổi trạng thái hóa đơn sang Đã thanh toán khi phát hiện tiền về tài khoản ngân hàng.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAutoReconciliation(!autoReconciliation)}
                                        className="text-[#ff385c] hover:scale-105 transition-transform cursor-pointer shrink-0"
                                    >
                                        {autoReconciliation ? (
                                            <ToggleRight className="h-10 w-10 text-[#ff385c]" />
                                        ) : (
                                            <ToggleLeft className="h-10 w-10 text-[#caa79a]" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#fcd5ce]/30 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer animate-in fade-in duration-200"
                                >
                                    <Save className="h-4.5 w-4.5" />
                                    Kích hoạt tài khoản thụ hưởng
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>

        </div>
    );
}

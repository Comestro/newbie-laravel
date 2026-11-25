import React from 'react';
import { useForm } from '@inertiajs/react';
import { ShieldCheck, AlertCircle, UploadCloud, CheckCircle2, Clock, Store } from 'lucide-react';

export default function KycManager({ user, isRetailer = false }) {
    const { data, setData, post, processing, errors } = useForm({
        shop_name: user?.shop_name || '',
        avatar: null,
        aadhaar_card: user?.aadhaar_card || '',
        aadhaar_front: null,
        aadhaar_back: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/apply-to-retailer', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const isSubmitted = user?.apply_status === 'PENDING' || user?.apply_status === 'SUBMITTED';
    const isVerified = user?.is_kyc_approved || user?.apply_status === 'VERIFIED';
    const isRejected = user?.apply_status === 'REJECTED';

    return (
        <div className="space-y-4 max-w-2xl">
            {/* Status Banners */}
            {isVerified && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3.5 shadow-xs">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                        <p className="font-bold text-xs">KYC Verified & Approved</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                            Your retailer account documents are verified. You have full access to wholesale bulk pricing and ordering.
                        </p>
                    </div>
                </div>
            )}

            {isSubmitted && !isVerified && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3.5 shadow-xs">
                    <Clock className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                        <p className="font-bold text-xs">Application Under Review</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                            Our admin team is currently reviewing your uploaded Aadhaar card details. Placing orders will unlock once approved.
                        </p>
                    </div>
                </div>
            )}

            {isRejected && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3.5 shadow-xs">
                    <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                    <div>
                        <p className="font-bold text-xs">KYC Application Rejected</p>
                        <p className="text-[11px] text-rose-800 mt-0.5">
                            Reason: <span className="font-semibold">{user?.kyc_reject_reason || 'Please provide clear and valid Aadhaar documents.'}</span>
                        </p>
                        <p className="text-[11px] text-rose-700 mt-1">Please re-upload your valid documents below.</p>
                    </div>
                </div>
            )}

            {/* Document Form */}
            {(!isVerified || isRejected) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>{isRetailer ? 'Submit Retailer Verification Documents' : 'Retailer KYC Application'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-5">
                        Government Aadhaar verification is required for business identification and tax compliance.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Shop / Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={data.shop_name}
                                onChange={(e) => setData('shop_name', e.target.value)}
                                placeholder="e.g. Sharma Grocery & Provision Store"
                                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                            {errors.shop_name && <p className="text-[10px] text-rose-600 mt-1">{errors.shop_name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Aadhaar Card Number (12 Digits) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.aadhaar_card}
                                onChange={(e) => setData('aadhaar_card', e.target.value)}
                                placeholder="XXXX XXXX XXXX"
                                maxLength="12"
                                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none font-mono"
                                required
                            />
                            {errors.aadhaar_card && <p className="text-[10px] text-rose-600 mt-1">{errors.aadhaar_card}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Aadhaar Card Front Photo <span className="text-rose-500">*</span>
                                </label>
                                <label className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-purple-50/20 transition">
                                    <UploadCloud className="w-6 h-6 text-slate-400" />
                                    <span className="text-[11px] font-semibold text-slate-600">
                                        {data.aadhaar_front ? data.aadhaar_front.name : 'Upload Front Side'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">JPG, PNG (Max 2MB)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setData('aadhaar_front', e.target.files[0])}
                                        required={!isSubmitted}
                                    />
                                </label>
                                {errors.aadhaar_front && <p className="text-[10px] text-rose-600 mt-1">{errors.aadhaar_front}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Aadhaar Card Back Photo <span className="text-rose-500">*</span>
                                </label>
                                <label className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-purple-50/20 transition">
                                    <UploadCloud className="w-6 h-6 text-slate-400" />
                                    <span className="text-[11px] font-semibold text-slate-600">
                                        {data.aadhaar_back ? data.aadhaar_back.name : 'Upload Back Side'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">JPG, PNG (Max 2MB)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setData('aadhaar_back', e.target.files[0])}
                                        required={!isSubmitted}
                                    />
                                </label>
                                {errors.aadhaar_back && <p className="text-[10px] text-rose-600 mt-1">{errors.aadhaar_back}</p>}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Submitting Verification...' : isRejected ? 'Resubmit KYC Documents' : 'Submit KYC for Review'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}


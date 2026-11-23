import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { ShieldCheck, AlertCircle, UploadCloud, CheckCircle2, Clock } from 'lucide-react';

export default function ApplyToRetailer({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        avatar: null,
        aadhar_card: user?.aadhar_card || '',
        aadhar_front: null,
        aadhar_back: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/apply-to-retailer', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const isSubmitted = user?.apply_status === 'PENDING' || user?.apply_status === 'SUBMITTED';
    const isVerified = user?.apply_status === 'VERIFIED';
    const isRejected = user?.apply_status === 'REJECTED';

    return (
        <AppLayout title="Apply to Retailer" subtitle="Submit your KYC documents to become a verified Newbie retailer">
            <Head title="Retailer Verification - Newbie Service" />

            <div className="space-y-4 max-w-2xl">
                {/* Status Banners */}
                {isVerified && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-bold text-xs">Congratulations! Your Retailer account is verified.</p>
                            <p className="text-[11px] text-emerald-700 mt-0.5">You can now access the Retailer Portal and fulfill orders.</p>
                        </div>
                    </div>
                )}

                {isSubmitted && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            <p className="font-bold text-xs">Application Under Review</p>
                            <p className="text-[11px] text-amber-700 mt-0.5">
                                Our admin team is currently reviewing your uploaded Aadhar details. We'll update your status shortly.
                            </p>
                        </div>
                    </div>
                )}

                {isRejected && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <div>
                            <p className="font-bold text-xs">KYC Rejected</p>
                            <p className="text-[11px] text-rose-700 mt-0.5">
                                Reason: {user?.kyc_reject_reason || 'Please upload valid and clear documents.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Form */}
                {(!isVerified || isRejected) && (
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Aadhar Card Number (12 Digits)
                                </label>
                                <input
                                    type="text"
                                    value={data.aadhar_card}
                                    onChange={(e) => setData('aadhar_card', e.target.value)}
                                    placeholder="XXXX XXXX XXXX"
                                    maxLength="12"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
                                    required
                                />
                                {errors.aadhar_card && <p className="text-[10px] text-rose-600 mt-1">{errors.aadhar_card}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Aadhar Front Side Photo
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setData('aadhar_front', e.target.files[0])}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        required
                                    />
                                    {errors.aadhar_front && <p className="text-[10px] text-rose-600 mt-1">{errors.aadhar_front}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Aadhar Back Side Photo
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setData('aadhar_back', e.target.files[0])}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        required
                                    />
                                    {errors.aadhar_back && <p className="text-[10px] text-rose-600 mt-1">{errors.aadhar_back}</p>}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition shadow-xs"
                                >
                                    {isSubmitted ? 'Resubmit Verification' : 'Submit KYC Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

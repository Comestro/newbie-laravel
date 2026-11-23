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

            <div className="space-y-6 max-w-2xl">
                {/* Status Banners */}
                {isVerified && (
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">Congratulations! Your Retailer account is verified.</p>
                            <p className="text-xs text-emerald-700 mt-0.5">You can now access the Retailer Portal and fulfill orders.</p>
                        </div>
                    </div>
                )}

                {isSubmitted && (
                    <div className="p-5 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-center gap-3">
                        <Clock className="w-6 h-6 text-yellow-600 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">Application Under Review</p>
                            <p className="text-xs text-yellow-700 mt-0.5">
                                Our admin team is currently reviewing your uploaded Aadhar details. We'll update your status shortly.
                            </p>
                        </div>
                    </div>
                )}

                {isRejected && (
                    <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">Application Rejected</p>
                            <p className="text-xs text-red-700 mt-0.5">
                                Reason: {user?.rejection_reason || 'Incomplete or unreadable documents.'} You can resubmit below.
                            </p>
                        </div>
                    </div>
                )}

                {/* Form (only shown if not verified or if rejected) */}
                {!isVerified && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Owner Photo / Store Avatar (Max 2MB)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('avatar', e.target.files[0])}
                                    className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                                    required={!user?.avatar_url}
                                />
                                {errors.avatar && <p className="text-xs text-red-600 mt-1">{errors.avatar}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Aadhar Card Number (12 Digits)
                                </label>
                                <input
                                    type="text"
                                    maxLength="12"
                                    value={data.aadhar_card}
                                    onChange={(e) => setData('aadhar_card', e.target.value)}
                                    placeholder="e.g. 123456789012"
                                    className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5 font-mono"
                                    required
                                />
                                {errors.aadhar_card && <p className="text-xs text-red-600 mt-1">{errors.aadhar_card}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Aadhar Front Photo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('aadhar_front', e.target.files[0])}
                                        className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                                        required={!user?.aadhar_card_front}
                                    />
                                    {errors.aadhar_front && <p className="text-xs text-red-600 mt-1">{errors.aadhar_front}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Aadhar Back Photo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('aadhar_back', e.target.files[0])}
                                        className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                                        required={!user?.aadhar_card_back}
                                    />
                                    {errors.aadhar_back && <p className="text-xs text-red-600 mt-1">{errors.aadhar_back}</p>}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                                >
                                    {isSubmitted ? 'Update Application' : 'Submit KYC Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}


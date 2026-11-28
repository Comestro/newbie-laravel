import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import ConfirmModal from '../../Components/ConfirmModal';
import UserOrderHistory from '../../Components/Admin/UserOrderHistory';
import UserLoyaltyMembershipCard from '../../Components/Admin/UserLoyaltyMembershipCard';
import { resolveImageUrl } from '../../utils/media';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    Phone,
    ShieldAlert,
    ShieldCheck,
    User,
    XCircle,
} from 'lucide-react';

export default function ReviewRetailerShow({ applicant, orders = [], loyaltyTransactions = [] }) {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [confirmApprove, setConfirmApprove] = useState(false);
    const [loading, setLoading] = useState(false);

    const status = applicant?.apply_status || 'PENDING';

    const statusBadge = {
        VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
        PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    }[status] || 'bg-slate-100 text-slate-600 border-slate-200';

    const executeApprove = () => {
        setLoading(true);
        router.post(route('admin.reviewretailer.approve', applicant.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setLoading(false);
                setConfirmApprove(false);
            },
        });
    };

    const handleReject = (e) => {
        e.preventDefault();
        if (!rejectReason.trim()) return;

        setLoading(true);
        router.post(route('admin.reviewretailer.reject', applicant.id), {
            reject_reason: rejectReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectForm(false);
                setRejectReason('');
            },
            onFinish: () => setLoading(false),
        });
    };

    const documents = [
        { label: 'Shop Photo', url: resolveImageUrl(applicant.shop_image), empty: 'No shop photo uploaded' },
        { label: 'Aadhaar Front', url: resolveImageUrl(applicant.aadhaar_front), empty: 'No front image uploaded' },
        { label: 'Aadhaar Back', url: resolveImageUrl(applicant.aadhaar_back), empty: 'No back image uploaded' },
    ];

    return (
        <AdminLayout
            title={`Retailer KYC: ${applicant.name}`}
            subtitle="Review complete store credentials, GST details, and identity documents"
            action={
                <Link
                    href={route('admin.reviewretailer', { status })}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to KYC List</span>
                </Link>
            }
        >
            <Head title={`KYC: ${applicant.name} - Admin Console`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Details & Documents */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Applicant & Business Details */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                <span>Applicant &amp; Business Information</span>
                            </h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge}`}>
                                {status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <User className="w-3 h-3" /> Applicant Name
                                </span>
                                <p className="font-bold text-slate-900 mt-1">{applicant.name}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" /> Shop / Business Name
                                </span>
                                <p className="font-bold text-slate-900 mt-1">{applicant.shop_name || 'N/A'}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> Email Address
                                </span>
                                <p className="font-semibold text-slate-800 mt-1">{applicant.email}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> Phone Number
                                </span>
                                <p className="font-semibold text-slate-800 font-mono mt-1">{applicant.phone || 'Not provided'}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> GST Number (GSTIN)
                                </span>
                                <p className="font-bold text-slate-900 font-mono mt-1">
                                    {applicant.gst_number || <span className="text-slate-400 font-sans font-normal">Not Provided</span>}
                                </p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Aadhaar Number
                                </span>
                                <p className="font-bold text-slate-900 font-mono mt-1">{applicant.aadhaar_card || 'Not provided'}</p>
                            </div>

                            <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Shop Physical Address
                                </span>
                                <p className="font-semibold text-slate-800 mt-1">
                                    {applicant.shop_address || <span className="text-slate-400 font-normal">Not Provided</span>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Documents */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                            Uploaded Documents
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div key={doc.label} className="border border-slate-100 rounded-xl p-3 bg-slate-50/70 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            {doc.label}
                                        </span>
                                        {doc.url && (
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-0.5"
                                            >
                                                <span>Open</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    {doc.url ? (
                                        <a href={doc.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-slate-200 bg-white">
                                            <img
                                                src={doc.url}
                                                alt={doc.label}
                                                className="h-40 w-full object-contain hover:scale-105 transition duration-200"
                                            />
                                        </a>
                                    ) : (
                                        <div className="h-40 rounded-lg border border-dashed border-slate-200 bg-white flex items-center justify-center text-[11px] text-slate-400 text-center px-3">
                                            {doc.empty}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Membership & Loyalty Points */}
                    <UserLoyaltyMembershipCard user={applicant} transactions={loyaltyTransactions} />

                    {/* Retailer Order History */}
                    <UserOrderHistory orders={orders} />
                </div>

                {/* Right Column: Decision & Timeline */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
                    <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                        Verification Decision
                    </h2>

                    <div className="text-xs text-slate-500 space-y-1">
                        <p>
                            <strong className="text-slate-700">Applied On:</strong>{' '}
                            {applicant.created_at ? new Date(applicant.created_at).toLocaleString('en-IN') : '—'}
                        </p>
                        {applicant.approved_at && (
                            <p>
                                <strong className="text-slate-700">Approved On:</strong>{' '}
                                {new Date(applicant.approved_at).toLocaleString('en-IN')}
                            </p>
                        )}
                    </div>

                    {status === 'REJECTED' && applicant.rejection_reason && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                            <p className="font-bold flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-rose-600" />
                                Rejection Reason
                            </p>
                            <p>{applicant.rejection_reason}</p>
                        </div>
                    )}

                    {showRejectForm ? (
                        <form onSubmit={handleReject} className="space-y-3 pt-2 border-t border-slate-100">
                            <label className="block text-xs font-semibold text-slate-700">
                                {status === 'VERIFIED' ? 'Reason for revoking approval' : 'Reason for rejection'}
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                                required
                                minLength={5}
                                placeholder="e.g. Incomplete or invalid documents..."
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
                                >
                                    {status === 'VERIFIED' ? 'Confirm Revoke' : 'Confirm Rejection'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRejectForm(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : status === 'VERIFIED' ? (
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Retailer account is approved and verified.</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRejectForm(true)}
                                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Revoke Approval</span>
                            </button>
                        </div>
                    ) : status === 'REJECTED' ? (
                        <div className="pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setConfirmApprove(true)}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Re-approve Retailer</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2.5 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setConfirmApprove(true)}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve Retailer</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRejectForm(true)}
                                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Reject with Reason</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmApprove}
                title="Approve Retailer Application"
                message="Are you sure you want to approve this retailer account? They will be granted retailer pricing and catalog access."
                confirmText="Approve Application"
                confirmStyle="bg-emerald-600 hover:bg-emerald-700 text-white"
                onConfirm={executeApprove}
                onCancel={() => setConfirmApprove(false)}
                loading={loading}
            />
        </AdminLayout>
    );
}


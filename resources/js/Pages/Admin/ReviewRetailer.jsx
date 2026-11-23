import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { ShieldCheck, CheckCircle2, XCircle, Eye, X } from 'lucide-react';

export default function ReviewRetailer({ requests = [], currentStatus = 'PENDING' }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const handleFilter = (status) => {
        router.get('/admin/review-retailer', { status }, { preserveScroll: true });
    };

    const handleApprove = (userId) => {
        if (confirm('Approve this retailer application?')) {
            router.post(`/admin/review-retailer/${userId}/approve`, {}, {
                preserveScroll: true,
                onSuccess: () => setSelectedUser(null),
            });
        }
    };

    const handleReject = (e) => {
        e.preventDefault();
        if (!rejectReason) return;

        router.post(`/admin/review-retailer/${selectedUser.id}/reject`, {
            reject_reason: rejectReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedUser(null);
                setShowRejectForm(false);
                setRejectReason('');
            },
        });
    };

    return (
        <AdminLayout title="Retailer KYC Reviews" subtitle="Verify store credentials and identity documents">
            <Head title="Retailer KYC - Admin Console" />

            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleFilter('PENDING')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                            currentStatus === 'PENDING'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Pending Verification
                    </button>
                    <button
                        onClick={() => handleFilter('VERIFIED')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                            currentStatus === 'VERIFIED'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Approved Retailers
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                                <tr>
                                    <th className="py-3.5 px-6">Applicant</th>
                                    <th className="py-3.5 px-6">Aadhar Number</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6 text-right">Review Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-gray-400">
                                            No applications with {currentStatus} status.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-gray-700 dark:text-gray-300">
                                                {u.aadhar_card || 'N/A'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                                    u.apply_status === 'VERIFIED'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {u.apply_status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => setSelectedUser(u)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-xl text-xs font-bold transition"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Review Docs</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Document Inspection Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        Review Retailer: {selectedUser.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                                        Aadhar: {selectedUser.aadhar_card}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Images Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Aadhar Front</p>
                                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                        {selectedUser.aadhar_card_front ? (
                                            <img
                                                src={`/storage/${selectedUser.aadhar_card_front}`}
                                                alt="Front"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">No image</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Aadhar Back</p>
                                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                        {selectedUser.aadhar_card_back ? (
                                            <img
                                                src={`/storage/${selectedUser.aadhar_card_back}`}
                                                alt="Back"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">No image</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Rejection input */}
                            {showRejectForm ? (
                                <form onSubmit={handleReject} className="space-y-3 pt-2">
                                    <label className="text-xs font-semibold text-red-600">Rejection Reason</label>
                                    <textarea
                                        rows="2"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Explain why this application cannot be accepted..."
                                        className="w-full text-sm rounded-xl border border-red-200 bg-red-50/40 p-2.5 text-red-900"
                                        required
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectForm(false)}
                                            className="px-4 py-2 text-xs font-semibold text-gray-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                                        >
                                            Confirm Rejection
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectForm(true)}
                                        className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>Reject Application</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleApprove(selectedUser.id)}
                                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Approve Retailer</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}


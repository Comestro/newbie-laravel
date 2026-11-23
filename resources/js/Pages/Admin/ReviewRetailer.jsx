import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import ConfirmModal from '../../Components/ConfirmModal';
import { ShieldCheck, CheckCircle2, XCircle, Eye, X } from 'lucide-react';

export default function ReviewRetailer({ requests = [], currentStatus = 'PENDING' }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [confirmApprove, setConfirmApprove] = useState({
        isOpen: false,
        userId: null,
        loading: false,
    });

    const handleFilter = (status) => {
        router.get('/admin/review-retailer', { status }, { preserveScroll: true });
    };

    const handleApprove = (userId) => {
        setConfirmApprove({
            isOpen: true,
            userId,
            loading: false,
        });
    };

    const executeApprove = () => {
        if (!confirmApprove.userId) return;
        setConfirmApprove((prev) => ({ ...prev, loading: true }));
        router.post(`/admin/review-retailer/${confirmApprove.userId}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedUser(null);
                setConfirmApprove({ isOpen: false, userId: null, loading: false });
            },
            onError: () => {
                setConfirmApprove((prev) => ({ ...prev, loading: false }));
            },
        });
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

            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleFilter('PENDING')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            currentStatus === 'PENDING'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Pending Requests
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilter('VERIFIED')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            currentStatus === 'VERIFIED'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Approved Retailers
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilter('REJECTED')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            currentStatus === 'REJECTED'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Rejected
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                                <tr>
                                    <th className="py-3 px-4">Applicant</th>
                                    <th className="py-3 px-4">Email / Phone</th>
                                    <th className="py-3 px-4">Aadhaar Card</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-10 text-center text-slate-400">
                                            No {currentStatus.toLowerCase()} KYC submissions.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {u.name}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                <div>{u.email}</div>
                                                <div className="text-[10px] text-slate-400">{u.phone || 'No phone'}</div>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-700">
                                                {u.aadhaar_card || 'Not provided'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    u.apply_status === 'VERIFIED'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : u.apply_status === 'REJECTED'
                                                        ? 'bg-rose-50 text-rose-700'
                                                        : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {u.apply_status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedUser(u)}
                                                        className="px-2.5 py-1 text-xs font-semibold text-purple-600 hover:bg-purple-50 rounded"
                                                    >
                                                        Review
                                                    </button>
                                                    {u.apply_status !== 'VERIFIED' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(u.id)}
                                                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Review Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="font-bold text-sm text-slate-900">Review KYC: {selectedUser.name}</h3>
                                <button type="button" onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                                    &times;
                                </button>
                            </div>

                            <div className="text-xs space-y-1.5 text-slate-600">
                                <p><strong className="text-slate-900">Email:</strong> {selectedUser.email}</p>
                                <p><strong className="text-slate-900">Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                                <p><strong className="text-slate-900">Aadhaar:</strong> {selectedUser.aadhaar_card}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="border border-slate-100 rounded-xl p-2 text-center bg-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Aadhaar Front</p>
                                    {selectedUser.aadhaar_front ? (
                                        <img src={`/storage/${selectedUser.aadhaar_front}`} alt="Front" className="h-28 w-full object-cover rounded-lg" />
                                    ) : (
                                        <p className="text-xs text-slate-400 py-8">No front image</p>
                                    )}
                                </div>
                                <div className="border border-slate-100 rounded-xl p-2 text-center bg-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Aadhaar Back</p>
                                    {selectedUser.aadhaar_back ? (
                                        <img src={`/storage/${selectedUser.aadhaar_back}`} alt="Back" className="h-28 w-full object-cover rounded-lg" />
                                    ) : (
                                        <p className="text-xs text-slate-400 py-8">No back image</p>
                                    )}
                                </div>
                            </div>

                            {showRejectForm ? (
                                <form onSubmit={handleReject} className="space-y-2 pt-2 border-t border-slate-100">
                                    <label className="block text-xs font-semibold text-slate-700">Reason for rejection</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={2}
                                        placeholder="e.g. Aadhaar card photo is blurry or invalid..."
                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <button type="submit" className="px-3 py-1.5 bg-rose-600 text-white font-semibold text-xs rounded-lg">
                                            Confirm Rejection
                                        </button>
                                        <button type="button" onClick={() => setShowRejectForm(false)} className="px-3 py-1.5 border border-slate-200 text-xs rounded-lg">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => handleApprove(selectedUser.id)}
                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition"
                                    >
                                        Approve Retailer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectForm(true)}
                                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition"
                                    >
                                        Reject with Reason
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmApprove.isOpen}
                title="Approve Retailer Application"
                message="Are you sure you want to approve this retailer account? They will be granted retailer pricing and catalog access."
                confirmText="Approve Application"
                variant="primary"
                loading={confirmApprove.loading}
                onConfirm={executeApprove}
                onClose={() => setConfirmApprove({ isOpen: false, userId: null, loading: false })}
            />
        </AdminLayout>
    );
}

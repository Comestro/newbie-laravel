import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import ConfirmModal from '../../Components/ConfirmModal';
import SearchBar from '../../Components/SearchBar';
import { CheckCircle2, Eye } from 'lucide-react';

export default function ReviewRetailer({ requests = [], currentStatus = 'ALL', filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [confirmApprove, setConfirmApprove] = useState({
        isOpen: false,
        userId: null,
        loading: false,
    });

    const applyFilter = (nextStatus = currentStatus, nextSearch = search) => {
        const params = {};
        if (nextStatus && nextStatus !== 'ALL') params.status = nextStatus;
        if (nextSearch && nextSearch.trim()) params.search = nextSearch.trim();
        router.get(route('admin.reviewretailer'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleFilter = (status) => {
        applyFilter(status, search);
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
                setConfirmApprove({ isOpen: false, userId: null, loading: false });
            },
            onError: () => {
                setConfirmApprove((prev) => ({ ...prev, loading: false }));
            },
        });
    };

    return (
        <AdminLayout title="Retailer KYC Reviews" subtitle="Verify store credentials and identity documents">
            <Head title="Retailer KYC - Admin Console" />

            <div className="space-y-4">
                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            currentStatus === 'ALL'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilter('PENDING')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            currentStatus === 'REJECTED'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Rejected
                    </button>
                </div>

                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onSearch={(q) => applyFilter(currentStatus, q)}
                        placeholder="Search name, shop, email, phone or GST..."
                        className="w-full sm:w-80"
                        inputClassName="py-2 text-slate-800"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Applicant</th>
                                    <th className="py-3 px-4">Shop &amp; GSTIN</th>
                                    <th className="py-3 px-4">Email / Phone</th>
                                    <th className="py-3 px-4">Applied On</th>
                                    <th className="py-3 px-4">KYC Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-10 text-center text-slate-400">
                                            No {currentStatus.toLowerCase()} KYC submissions.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {u.name}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-slate-800">{u.shop_name || 'N/A'}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                    {u.gst_number ? `GSTIN: ${u.gst_number}` : 'No GSTIN'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                <div>{u.email}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{u.phone || 'No phone'}</div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                                {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                                                    <Link
                                                        href={route('admin.reviewretailer.show', u.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>View</span>
                                                    </Link>
                                                    {u.apply_status !== 'VERIFIED' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(u.id)}
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
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
            </div>

            <ConfirmModal
                isOpen={confirmApprove.isOpen}
                title="Approve Retailer Application"
                message="Are you sure you want to approve this retailer account? They will be granted retailer pricing and catalog access."
                confirmText="Approve Application"
                confirmStyle="bg-emerald-600 hover:bg-emerald-700 text-white"
                onConfirm={executeApprove}
                onCancel={() => setConfirmApprove({ isOpen: false, userId: null, loading: false })}
                loading={confirmApprove.loading}
            />
        </AdminLayout>
    );
}

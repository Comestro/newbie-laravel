import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SearchBar from '../../../Components/SearchBar';
import ConfirmModal from '../../../Components/ConfirmModal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Index({ coupons, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (nextSearch) => {
        const query = nextSearch !== undefined ? nextSearch : search;
        router.get('/admin/coupons', query ? { search: query } : {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const toggleActive = (id) => {
        router.post(`/admin/coupons/${id}/toggle-active`, {}, { preserveScroll: true });
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/coupons/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <AdminLayout
            title="Coupons"
            subtitle="Create and manage discount promo codes for checkout"
            action={
                <Link
                    href="/admin/coupons/create"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Coupon</span>
                </Link>
            }
        >
            <Head title="Coupons - Admin Console" />

            <div className="space-y-4">
                {/* Search */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onSearch={handleSearch}
                        placeholder="Search coupon code..."
                        className="w-full sm:w-72"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                                <tr>
                                    <th className="py-3 px-4">Code</th>
                                    <th className="py-3 px-4">Discount</th>
                                    <th className="py-3 px-4">Min Order</th>
                                    <th className="py-3 px-4">Usage</th>
                                    <th className="py-3 px-4">Expires</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {coupons?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-10 text-center text-slate-400">
                                            No coupons found. Create your first promo code!
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.data.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3 px-4 font-mono font-bold text-purple-700">
                                                {coupon.code}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-800">
                                                {coupon.type === 'FIXED'
                                                    ? `₹${Number(coupon.value)}`
                                                    : `${Number(coupon.value)}%`}
                                                {coupon.max_discount_amount && coupon.type === 'PERCENT' && (
                                                    <span className="text-[10px] text-slate-400 ml-1">
                                                        (max ₹{Number(coupon.max_discount_amount)})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                ₹{Number(coupon.min_order_amount || 0)}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {coupon.used_count} / {coupon.usage_limit ?? '∞'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">
                                                {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleActive(coupon.id)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                                        coupon.is_active
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {coupon.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-1">
                                                <Link
                                                    href={`/admin/coupons/${coupon.id}/edit`}
                                                    className="inline-flex p-1.5 text-slate-500 hover:text-purple-600 rounded-md hover:bg-slate-100"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(coupon)}
                                                    className="inline-flex p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
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
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                title="Delete Coupon"
                message={`Are you sure you want to delete coupon "${deleteTarget?.code}"?`}
                confirmText="Delete"
                variant="danger"
            />
        </AdminLayout>
    );
}


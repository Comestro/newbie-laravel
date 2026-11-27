import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Search, Eye, Receipt, FilePlus2, RefreshCw } from 'lucide-react';

export default function Index({ orders, statuses = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const applyFilters = (newFilters = {}) => {
        const query = {
            search: newFilters.search !== undefined ? newFilters.search : search,
            status: newFilters.status !== undefined ? newFilters.status : status,
        };
        Object.keys(query).forEach((k) => !query[k] && delete query[k]);
        router.get('/admin/orders', query, { preserveScroll: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ search });
    };

    return (
        <AdminLayout title="Orders Management" subtitle="Review incoming purchases and dispatch customer deliveries">
            <Head title="Orders - Admin Console" />

            <div className="space-y-4">
                {/* Search & Status Filters */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Order ID or customer..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                            className="text-xs rounded-lg border border-slate-200/80 bg-white text-slate-900 py-1.5 px-2.5"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map((s) => (
                                <option key={s.value || s} value={s.value || s}>{s.value || s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                                <tr>
                                    <th className="py-3 px-4">Order #</th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Payment</th>
                                    <th className="py-3 px-4">Total</th>
                                    <th className="py-3 px-4">Invoice</th>
                                    <th className="py-3 px-4 text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-10 text-center text-slate-400">
                                            No orders match your query.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                #{ord.order_number}
                                            </td>
                                            <td className="py-3 px-4 text-slate-700">
                                                {ord.user?.name || 'Guest'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">
                                                {new Date(ord.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                                                    {ord.status?.value || ord.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {ord.payment_status?.value || ord.payment_status || 'Pending'}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                ₹{ord.total_amount}
                                            </td>
                                            <td className="py-3 px-4">
                                                {ord.invoice ? (
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <a
                                                            href={`/admin/orders/${ord.id}/invoice`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition"
                                                        >
                                                            <Receipt className="w-3 h-3" />
                                                            <span>{ord.invoice.invoice_number}</span>
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => router.post(`/admin/orders/${ord.id}/generate-invoice`, {}, { preserveScroll: true })}
                                                            title="Regenerate Invoice"
                                                            aria-label="Regenerate Invoice"
                                                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                                                        >
                                                            <RefreshCw className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/admin/orders/${ord.id}/generate-invoice`, {}, { preserveScroll: true })}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-semibold transition cursor-pointer"
                                                    >
                                                        <FilePlus2 className="w-3 h-3" />
                                                        <span>Generate</span>
                                                    </button>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    href={`/admin/orders/${ord.id}`}
                                                    className="inline-flex p-1.5 text-slate-500 hover:text-purple-600 rounded-md hover:bg-slate-100"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orders?.links && orders.links.length > 3 && (
                        <div className="p-3 border-t border-slate-100 flex justify-center gap-1">
                            {orders.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 text-xs rounded border ${
                                        link.active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200'
                                    } ${!link.url ? 'opacity-40' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Search, Eye, Filter } from 'lucide-react';

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

            <div className="space-y-6">
                {/* Search & Status Filters */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Order ID or customer name..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                            className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 px-3"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map((s) => (
                                <option key={s.value || s} value={s.value || s}>{s.value || s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                                <tr>
                                    <th className="py-3.5 px-6">Order</th>
                                    <th className="py-3.5 px-6">Customer</th>
                                    <th className="py-3.5 px-6">Date</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6">Total</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:border-gray-800">
                                {orders?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-400">
                                            No matching orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                            <td className="py-4 px-6 font-mono font-bold text-purple-600">
                                                #{ord.order_number}
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-900 dark:text-white">{ord.user?.name || 'Customer'}</p>
                                                <p className="text-xs text-gray-400">{ord.user?.email}</p>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-gray-500">
                                                {new Date(ord.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {ord.status?.value || ord.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                                                ₹{ord.total_amount}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Link
                                                    href={`/admin/orders/${ord.id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orders?.links && orders.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center gap-1">
                            {orders.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                        link.active
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

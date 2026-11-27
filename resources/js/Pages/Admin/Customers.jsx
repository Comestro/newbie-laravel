import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import SearchBar from '../../Components/SearchBar';

export default function Customers({ customers, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const applyFilters = (newFilters = {}) => {
        const query = {
            search: newFilters.search !== undefined ? newFilters.search : search,
        };
        Object.keys(query).forEach((k) => !query[k] && delete query[k]);
        router.get('/admin/customers', query, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleSearch = (nextSearch) => {
        applyFilters({ search: nextSearch !== undefined ? nextSearch : search });
    };

    const toggleActive = (id) => {
        router.post(`/admin/customers/${id}/toggle-active`, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Customers Directory" subtitle="Manage registered retail customers and accounts">
            <Head title="Customers - Admin Console" />

            <div className="space-y-4">
                {/* Search Bar */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onSearch={handleSearch}
                        placeholder="Search customer name, email, or phone..."
                        className="w-full sm:w-80"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                                <tr>
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Phone</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Toggle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customers?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-10 text-center text-slate-400">
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {user.name}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {user.email}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {user.phone || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                    user.is_active
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-rose-50 text-rose-700'
                                                }`}>
                                                    {user.is_active ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleActive(user.id)}
                                                    className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
                                                        user.is_active
                                                            ? 'text-rose-600 hover:bg-rose-50'
                                                            : 'text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                                >
                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {customers?.links && customers.links.length > 3 && (
                        <div className="p-3 border-t border-slate-100 flex justify-center gap-1">
                            {customers.links.map((link, i) => (
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

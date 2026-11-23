import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Search } from 'lucide-react';

export default function Customers({ customers, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');

    const applyFilters = (newFilters = {}) => {
        const query = {
            search: newFilters.search !== undefined ? newFilters.search : search,
            role: newFilters.role !== undefined ? newFilters.role : role,
        };
        Object.keys(query).forEach((k) => !query[k] && delete query[k]);
        router.get('/admin/customers', query, { preserveScroll: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const toggleActive = (id) => {
        router.post(`/admin/customers/${id}/toggle-active`, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Customers Directory" subtitle="Manage registered retail customers and accounts">
            <Head title="Customers - Admin Console" />

            <div className="space-y-4">
                {/* Search & Filters Bar */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search customer name or email..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value);
                                applyFilters({ role: e.target.value });
                            }}
                            className="text-xs rounded-lg border border-slate-200/80 bg-white text-slate-900 py-1.5 px-2.5"
                        >
                            <option value="">All Roles</option>
                            <option value="customer">Customers</option>
                            <option value="retailer">Retailers</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
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
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Toggle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customers?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-10 text-center text-slate-400">
                                            No accounts found.
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
                                                    user.is_admin
                                                        ? 'bg-purple-50 text-purple-700'
                                                        : user.is_retailer
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                    {user.is_admin ? 'Admin' : user.is_retailer ? 'Retailer' : 'Customer'}
                                                </span>
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

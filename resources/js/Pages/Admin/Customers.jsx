import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Search, UserCheck, UserX, Eye, X } from 'lucide-react';

export default function Customers({ customers, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const applyFilters = (newFilters = {}) => {
        const query = {
            search: newFilters.search !== undefined ? newFilters.search : search,
            role: newFilters.role !== undefined ? newFilters.role : role,
            status: newFilters.status !== undefined ? newFilters.status : status,
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

            <div className="space-y-6">
                {/* Search & Filters Bar */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, email, phone..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </form>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value);
                                applyFilters({ role: e.target.value });
                            }}
                            className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 px-3"
                        >
                            <option value="">All Roles</option>
                            <option value="USER">User / Customer</option>
                            <option value="RETAILER">Retailer</option>
                        </select>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                                <tr>
                                    <th className="py-3.5 px-6">Customer</th>
                                    <th className="py-3.5 px-6">Role</th>
                                    <th className="py-3.5 px-6">KYC Status</th>
                                    <th className="py-3.5 px-6">Active</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {customers?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-gray-400">
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                                                <p className="text-xs text-gray-400">{c.email} • {c.phone || 'No phone'}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                    c.role === 'RETAILER'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                    {c.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                    {c.apply_status || 'None'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => toggleActive(c.id)}
                                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                        c.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                    }`}
                                                >
                                                    {c.is_active ? 'Active' : 'Disabled'}
                                                </button>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => setSelectedCustomer(c)}
                                                    className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {customers?.links && customers.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center gap-1">
                            {customers.links.map((link, i) => (
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

                {/* Customer Details Modal */}
                {selectedCustomer && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                <h3 className="font-bold text-base text-gray-900 dark:text-white">Customer Profile</h3>
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-semibold">Name</span>
                                    <p className="font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-semibold">Email</span>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{selectedCustomer.email}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-semibold">Phone</span>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{selectedCustomer.phone || 'None'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-semibold">Role</span>
                                    <p className="font-bold text-purple-600">{selectedCustomer.role}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-semibold">Joined</span>
                                    <p className="text-xs text-gray-500">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}


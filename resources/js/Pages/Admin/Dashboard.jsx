import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { ShoppingBag, Users, DollarSign, ShieldAlert, ArrowRight, Package } from 'lucide-react';

export default function Dashboard({ totalOrders = 0, totalCustomer = 0, totalRevenue = 0, unVerifiedRetailer = 0, recentOrders = [] }) {
    const stats = [
        { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/40' },
        { label: 'Total Customers', value: totalCustomer, icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/40' },
        { label: 'Total Revenue', value: `₹${totalRevenue}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40' },
        { label: 'Pending KYC', value: unVerifiedRetailer, icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/40', href: '/admin/review-retailer' },
    ];

    return (
        <AdminLayout title="Admin Dashboard" subtitle="Store performance and pending tasks overview">
            <Head title="Admin Dashboard" />

            <div className="space-y-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((s, idx) => {
                        const Icon = s.icon;
                        const CardWrapper = s.href ? Link : 'div';
                        return (
                            <CardWrapper
                                key={idx}
                                href={s.href}
                                className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between hover:shadow-md transition"
                            >
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">{s.label}</span>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">{s.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </CardWrapper>
                        );
                    })}
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Latest purchase requests made across store</p>
                        </div>
                        <Link
                            href="/admin/orders"
                            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                            <span>All Orders</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center">No recent orders found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-bold uppercase text-gray-400">
                                        <th className="py-3 px-4">Order ID</th>
                                        <th className="py-3 px-4">Customer</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Total</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {recentOrders.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td className="py-3.5 px-4 font-mono font-bold text-purple-600">
                                                #{ord.order_number}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                                                {ord.user?.name || 'Guest'}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-gray-400">
                                                {new Date(ord.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {ord.status?.value || ord.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                                                ₹{ord.total_amount}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Link
                                                    href={`/admin/orders/${ord.id}`}
                                                    className="text-xs font-bold text-purple-600 hover:text-purple-700 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-lg"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}


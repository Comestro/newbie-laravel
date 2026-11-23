import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { ShoppingBag, Users, DollarSign, ShieldAlert, ArrowRight, Package } from 'lucide-react';

export default function Dashboard({ totalOrders = 0, totalCustomer = 0, totalRevenue = 0, unVerifiedRetailer = 0, recentOrders = [] }) {
    const stats = [
        { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
        { label: 'Total Customers', value: totalCustomer, icon: Users, color: 'text-purple-600 bg-purple-50' },
        { label: 'Total Revenue', value: `₹${totalRevenue}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Pending KYC', value: unVerifiedRetailer, icon: ShieldAlert, color: 'text-amber-600 bg-amber-50', href: '/admin/review-retailer' },
    ];

    return (
        <AdminLayout title="Admin Dashboard" subtitle="Store performance and pending tasks overview">
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, idx) => {
                        const Icon = s.icon;
                        const CardWrapper = s.href ? Link : 'div';
                        return (
                            <CardWrapper
                                key={idx}
                                href={s.href}
                                className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between hover:border-slate-200 transition"
                            >
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </CardWrapper>
                        );
                    })}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Recent Orders</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Latest purchase requests made across store</p>
                        </div>
                        <Link
                            href="/admin/orders"
                            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                            <span>All Orders</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">No recent orders found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                                    <tr>
                                        <th className="py-2.5 px-3">Order</th>
                                        <th className="py-2.5 px-3">Customer</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3">Total</th>
                                        <th className="py-2.5 px-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentOrders.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                                #{ord.order_number}
                                            </td>
                                            <td className="py-3 px-3 text-slate-600">
                                                {ord.user?.name || 'Guest Customer'}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                                                    {ord.status?.value || ord.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-bold text-slate-900">
                                                ₹{ord.total_amount}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <Link
                                                    href={`/admin/orders/${ord.id}`}
                                                    className="text-purple-600 hover:text-purple-700 font-bold"
                                                >
                                                    Manage &rarr;
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

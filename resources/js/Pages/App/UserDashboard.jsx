import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { ShoppingBag, Heart, MapPin, Store } from 'lucide-react';

export default function UserDashboard({ totalOrders = 0, totalWishlist = 0, totalAddress = 0, recentOrders = [] }) {
    const getStatusBadge = (status) => {
        const val = (status?.value || status || '').toUpperCase();
        switch (val) {
            case 'DELIVERED':
            case 'COMPLETED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'PROCESSING':
            case 'SHIPPED':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    return (
        <AppLayout title="Dashboard" subtitle="Welcome back to your account dashboard">
            <Head title="My Dashboard" />

            <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <Link
                        href="/my-orders"
                        className="bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition shadow-xs group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 mt-2">{totalOrders}</p>
                    </Link>

                    <Link
                        href="/wishlist"
                        className="bg-white p-4 rounded-xl border border-slate-100 hover:border-pink-200 transition shadow-xs group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Wishlist Items</span>
                            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                                <Heart className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 mt-2">{totalWishlist}</p>
                    </Link>

                    <Link
                        href="/my-addresses"
                        className="bg-white p-4 rounded-xl border border-slate-100 hover:border-purple-200 transition shadow-xs group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saved Addresses</span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <MapPin className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 mt-2">{totalAddress}</p>
                    </Link>
                </div>

                {/* Retailer Banner */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Store className="w-4 h-4" />
                            <h3 className="text-sm font-bold">Sell with Newbie Service</h3>
                        </div>
                        <p className="text-xs text-purple-100 max-w-lg">
                            Apply for a retailer account to supply products and fulfill customer grocery requests.
                        </p>
                    </div>
                    <Link
                        href="/apply-to-retailer"
                        className="px-4 py-2 bg-white text-purple-700 hover:bg-purple-50 font-bold rounded-lg text-xs transition shadow-xs shrink-0"
                    >
                        Apply for KYC &rarr;
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
                        <Link href="/my-orders" className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                            View All &rarr;
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-xs text-slate-400">No orders yet.</p>
                            <Link href="/catalog" className="inline-block mt-2 text-xs font-bold text-purple-600">
                                Start shopping &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentOrders.map((ord) => (
                                <div key={ord.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-900">
                                                #{ord.order_number}
                                            </span>
                                            <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${getStatusBadge(ord.status)}`}>
                                                {ord.status?.value || ord.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {new Date(ord.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-slate-900 block">
                                            ₹{ord.total_amount}
                                        </span>
                                        <Link
                                            href={`/order-view/${ord.order_number}`}
                                            className="text-[11px] text-purple-600 hover:underline"
                                        >
                                            View details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { ShoppingBag, Heart, MapPin, ArrowRight, Clock, Store } from 'lucide-react';

export default function UserDashboard({ totalOrders = 0, totalWishlist = 0, totalAddress = 0, recentOrders = [] }) {
    return (
        <AppLayout title="Dashboard" subtitle="Welcome back to your account dashboard">
            <Head title="My Dashboard" />

            <div className="space-y-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href="/my-orders"
                        className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-xs hover:border-blue-300 transition"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase">Total Orders</span>
                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{totalOrders}</p>
                    </Link>

                    <Link
                        href="/wishlist"
                        className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-xs hover:border-pink-300 transition"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase">Wishlist Items</span>
                            <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-900/40 text-pink-600 flex items-center justify-center">
                                <Heart className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{totalWishlist}</p>
                    </Link>

                    <Link
                        href="/my-addresses"
                        className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-xs hover:border-purple-300 transition"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase">Saved Addresses</span>
                            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
                                <MapPin className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{totalAddress}</p>
                    </Link>
                </div>

                {/* Retailer Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Store className="w-5 h-5" />
                            <h3 className="text-lg font-bold">Sell with Newbie Service</h3>
                        </div>
                        <p className="text-sm text-blue-100 max-w-lg">
                            Apply for a retailer account to supply products and fulfill customer grocery requests.
                        </p>
                    </div>
                    <Link
                        href="/apply-to-retailer"
                        className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-sm transition shadow-sm"
                    >
                        Apply for KYC
                    </Link>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                        <Link href="/my-orders" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <span>View All</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-gray-500 py-6 text-center">No orders placed yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                            {recentOrders.map((ord) => (
                                <div key={ord.id} className="py-3.5 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white font-mono">
                                            #{ord.order_number}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(ord.created_at).toLocaleDateString()} • {ord.status?.value || ord.status}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-sm text-gray-900 dark:text-white">₹{ord.total_amount}</span>
                                        <Link
                                            href={`/order-view/${ord.order_number}`}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-xs font-semibold rounded-lg transition"
                                        >
                                            View
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


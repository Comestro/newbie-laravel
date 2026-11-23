import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { ShoppingBag, ArrowRight, Package } from 'lucide-react';

export default function UserMyOrder({ orders = [] }) {
    const getStatusBadge = (status) => {
        const val = (status?.value || status || '').toUpperCase();
        switch (val) {
            case 'DELIVERED':
            case 'COMPLETED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'CANCELLED':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'PROCESSING':
            case 'SHIPPED':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <AppLayout title="My Orders" subtitle="Track and manage all your past grocery orders">
            <Head title="My Orders - Newbie Service" />

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">No orders found</h3>
                        <p className="text-sm text-gray-500 mt-1">You haven't placed any orders yet.</p>
                        <Link
                            href="/catalog"
                            className="inline-block mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition"
                        >
                            Browse Groceries
                        </Link>
                    </div>
                ) : (
                    orders.map((ord) => (
                        <div
                            key={ord.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-base text-gray-900 dark:text-white">
                                        #{ord.order_number}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(ord.status)}`}>
                                        {ord.status?.value || ord.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Ordered on {new Date(ord.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    {ord.items?.length || 0} items • Payment: {ord.payment_status?.value || ord.payment_status || 'COD'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                                <div>
                                    <span className="text-xs text-gray-400 block sm:text-right">Total Amount</span>
                                    <span className="text-lg font-black text-gray-900 dark:text-white">
                                        ₹{ord.total_amount}
                                    </span>
                                </div>

                                <Link
                                    href={`/order-view/${ord.order_number}`}
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <span>Details</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AppLayout>
    );
}


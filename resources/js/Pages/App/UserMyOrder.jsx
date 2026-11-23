import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { ShoppingBag } from 'lucide-react';

export default function UserMyOrder({ orders = [] }) {
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
        <AppLayout title="My Orders" subtitle="Track and manage all your past grocery orders">
            <Head title="My Orders - Newbie Service" />

            <div className="space-y-3">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-xs">
                        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                        <h3 className="font-bold text-sm text-slate-800">No orders found</h3>
                        <p className="text-xs text-slate-400 mt-1">You haven't placed any orders yet.</p>
                        <Link
                            href="/catalog"
                            className="inline-block mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition"
                        >
                            Browse Groceries
                        </Link>
                    </div>
                ) : (
                    orders.map((ord) => (
                        <div
                            key={ord.id}
                            className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2.5">
                                    <span className="font-mono font-bold text-sm text-slate-900">
                                        #{ord.order_number}
                                    </span>
                                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${getStatusBadge(ord.status)}`}>
                                        {ord.status?.value || ord.status}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Ordered on {new Date(ord.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-50">
                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] text-slate-400 block uppercase">Total</span>
                                    <span className="text-sm font-extrabold text-slate-900">
                                        ₹{ord.total_amount}
                                    </span>
                                </div>
                                <Link
                                    href={`/order-view/${ord.order_number}`}
                                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AppLayout>
    );
}

import React from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderList({ orders = [], isRetailer = false }) {
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

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">No orders found</h3>
                <p className="text-xs text-slate-400 mt-1">
                    {isRetailer
                        ? "You haven't placed any wholesale bulk orders yet."
                        : "You haven't placed any grocery orders yet."}
                </p>
                <Link
                    href="/catalog"
                    className="inline-block mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
                >
                    {isRetailer ? 'Browse Wholesale Products' : 'Browse Groceries'}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map((ord) => (
                <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition"
                >
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-sm text-slate-900">
                                #{ord.order_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(ord.status)}`}>
                                {ord.status?.value || ord.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Placed on <span className="font-medium text-slate-700">{new Date(ord.created_at).toLocaleDateString()}</span>
                            {' '}&bull;{' '}
                            <span>{ord.items?.length || 0} item{(ord.items?.length || 0) === 1 ? '' : 's'}</span>
                        </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Amount</span>
                            <span className="text-sm font-black text-slate-900">₹{Number(ord.total_amount).toLocaleString()}</span>
                        </div>

                        <Link
                            href={`/order-view/${ord.order_number || ord.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-semibold border border-slate-200/80 transition"
                        >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}


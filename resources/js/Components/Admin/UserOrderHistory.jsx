import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Eye, FilePlus2, Receipt, ShoppingBag } from 'lucide-react';

const statusClass = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED') return 'bg-emerald-50 text-emerald-700';
    if (s === 'CANCELLED') return 'bg-rose-50 text-rose-700';
    if (s === 'SHIPPED') return 'bg-indigo-50 text-indigo-700';
    if (s === 'CONFIRMED') return 'bg-blue-50 text-blue-700';
    return 'bg-amber-50 text-amber-700';
};

export default function UserOrderHistory({ orders = [] }) {
    const totalSpent = orders
        .filter((o) => (o.status || '').toUpperCase() !== 'CANCELLED')
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-purple-600" />
                    <span>Order History ({orders.length})</span>
                </h2>
                {orders.length > 0 && (
                    <span className="text-xs font-semibold text-slate-500">
                        Total Spent:{' '}
                        <span className="font-bold text-slate-900">
                            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </span>
                )}
            </div>

            {orders.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                    No orders placed yet.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Order #</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4 text-center">Items</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Total</th>
                                <th className="py-3 px-4 text-center">Invoice</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition">
                                    <td className="py-3 px-4 font-bold font-mono text-slate-900">
                                        {order.order_number}
                                    </td>
                                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                        {order.created_at
                                            ? new Date(order.created_at).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })
                                            : '—'}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                            {order.items_count ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                                        ₹{Number(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {order.invoice ? (
                                            <Link
                                                href={route('admin.orders.invoice', order.id)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                                                title={order.invoice.invoice_number}
                                            >
                                                <Receipt className="w-3.5 h-3.5" />
                                                <span>Invoice</span>
                                            </Link>
                                        ) : (order.status || '').toUpperCase() !== 'CANCELLED' ? (
                                            <button
                                                type="button"
                                                onClick={() => router.post(route('admin.orders.generate-invoice', order.id), {}, { preserveScroll: true })}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                                            >
                                                <FilePlus2 className="w-3.5 h-3.5" />
                                                <span>Generate</span>
                                            </button>
                                        ) : (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Link
                                            href={route('admin.orders.show', order.id)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>View</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


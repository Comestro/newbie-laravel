import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Package, ArrowLeft } from 'lucide-react';

export default function UserOrderView({ order }) {
    const items = order.items || [];
    const address = order.address || {};

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
        <AppLayout title={`Order #${order.order_number}`} subtitle="Detailed view of your order and item invoice">
            <Head title={`Order #${order.order_number} - Newbie Service`} />

            <div className="space-y-4">
                <Link
                    href="/my-orders"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to My Orders</span>
                </Link>

                {/* Status Bar */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Status</span>
                        <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-bold border ${getStatusBadge(order.status)}`}>
                            {order.status?.value || order.status}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Placed On</span>
                        <span className="text-xs font-medium text-slate-700">
                            {new Date(order.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
                    <h3 className="font-bold text-sm text-slate-900 mb-3">Order Items</h3>
                    <div className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-base">
                                        📦
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900">
                                            {item.product_name}
                                        </h4>
                                        <p className="text-[11px] text-slate-400">
                                            Size: {item.unit_size} &bull; Qty: {item.quantity}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-bold text-xs text-slate-900">
                                    ₹{item.price * item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Address & Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Delivery Address */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs">
                        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Delivery Address</h3>
                        <p className="font-bold text-xs text-slate-900">{address.label || 'Home'}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                            {address.line1}{address.line2 ? `, ${address.line2}` : ''}
                        </p>
                        <p className="text-xs text-slate-600">
                            {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">📞 {address.phone}</p>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs">
                        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Payment Details</h3>
                        <div className="space-y-1.5 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-slate-900">₹{order.subtotal_amount || order.total_amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className="font-medium text-slate-900">₹{order.delivery_fee || 0}</span>
                            </div>
                            <div className="pt-2 flex justify-between font-bold text-sm text-slate-900 border-t border-slate-100">
                                <span>Total Paid</span>
                                <span>₹{order.total_amount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, Check } from 'lucide-react';

export default function Show({ order, statuses = [], paymentStatuses = [] }) {
    const [selectedStatus, setSelectedStatus] = useState(order.status?.value || order.status);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.payment_status?.value || order.payment_status);

    const handleUpdateStatus = () => {
        router.post(`/admin/orders/${order.id}/status`, { status: selectedStatus }, { preserveScroll: true });
    };

    const handleUpdatePaymentStatus = () => {
        router.post(`/admin/orders/${order.id}/payment-status`, { payment_status: selectedPaymentStatus }, { preserveScroll: true });
    };

    const address = order.address || {};
    const items = order.items || [];

    return (
        <AdminLayout
            title={`Order #${order.order_number}`}
            subtitle="Order invoice, customer items, and delivery status controls"
            action={
                <Link
                    href="/admin/orders"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Orders</span>
                </Link>
            }
        >
            <Head title={`Order #${order.order_number} - Admin Console`} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Items breakdown */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                    <h3 className="font-bold text-sm text-slate-900">Purchased Products</h3>

                    <div className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <div key={item.id} className="py-3 flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-xs text-slate-900">
                                        {item.product_name}
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                        Variant: {item.variant_name} &bull; {item.quantity} × ₹{item.price}
                                    </p>
                                </div>
                                <span className="font-bold text-xs text-slate-900">
                                    ₹{item.total || item.price * item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal_amount || order.total_amount}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Delivery Fee</span>
                            <span>₹{order.delivery_fee || 0}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm text-slate-900">
                            <span>Total Bill</span>
                            <span>₹{order.total_amount}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Controls & Customer */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Status updater */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs space-y-3">
                        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Update Order Status</h4>
                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full text-xs rounded-lg border border-slate-200/80 bg-white text-slate-900 px-2.5 py-1.5"
                            >
                                {statuses.map((s) => (
                                    <option key={s.value || s} value={s.value || s}>{s.value || s}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleUpdateStatus}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition"
                        >
                            Save Status
                        </button>
                    </div>

                    {/* Payment status */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs space-y-3">
                        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Payment Status</h4>
                        <div>
                            <select
                                value={selectedPaymentStatus}
                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                className="w-full text-xs rounded-lg border border-slate-200/80 bg-white text-slate-900 px-2.5 py-1.5"
                            >
                                {paymentStatuses.map((p) => (
                                    <option key={p.value || p} value={p.value || p}>{p.value || p}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleUpdatePaymentStatus}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition"
                        >
                            Save Payment Status
                        </button>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs text-xs space-y-1">
                        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">Customer & Address</h4>
                        <p className="font-bold text-slate-900">{order.user?.name || 'Customer'}</p>
                        <p className="text-slate-600">{order.user?.email}</p>
                        <div className="pt-2 border-t border-slate-100 mt-2 text-slate-600">
                            <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                            <p>{address.city}, {address.state} - {address.pincode}</p>
                            <p className="text-slate-400 mt-1">📞 {address.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

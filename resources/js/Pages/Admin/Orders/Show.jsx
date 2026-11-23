import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, Clock, MapPin, DollarSign, Check } from 'lucide-react';

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
            subtitle="Full order invoice, customer items, and delivery lifecycle controls"
            action={
                <Link
                    href="/admin/orders"
                    className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Orders</span>
                </Link>
            }
        >
            <Head title={`Order #${order.order_number} - Admin Console`} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Items breakdown */}
                <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-xs space-y-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Purchased Products</h3>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {items.map((item) => (
                            <div key={item.id} className="py-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                        {item.product_name}
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        Variant: {item.variant_name} • {item.quantity} × ₹{item.price}
                                    </p>
                                </div>
                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    ₹{item.total || item.price * item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1.5 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Delivery Fee</span>
                            <span>₹{order.delivery_fee}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                            <span>Grand Total</span>
                            <span className="text-purple-600">₹{order.total_amount}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Controls & Details */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Status updater */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs space-y-4">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Delivery Lifecycle</h4>

                        <div>
                            <label className="text-xs text-gray-500 font-semibold uppercase">Order Status</label>
                            <div className="flex gap-2 mt-1.5">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="flex-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2"
                                >
                                    {statuses.map((s) => (
                                        <option key={s.value || s} value={s.value || s}>{s.value || s}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleUpdateStatus}
                                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 font-semibold uppercase">Payment Status</label>
                            <div className="flex gap-2 mt-1.5">
                                <select
                                    value={selectedPaymentStatus}
                                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                    className="flex-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2"
                                >
                                    {paymentStatuses.map((p) => (
                                        <option key={p.value || p} value={p.value || p}>{p.value || p}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleUpdatePaymentStatus}
                                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping info */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs space-y-3">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span>Destination</span>
                        </h4>
                        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            <p className="font-semibold text-gray-900 dark:text-white">{order.user?.name}</p>
                            <p>{address.line1}</p>
                            {address.line2 && <p>{address.line2}</p>}
                            <p>{address.city}, {address.state} - {address.pincode}</p>
                            {address.phone && <p className="text-gray-400">Phone: {address.phone}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

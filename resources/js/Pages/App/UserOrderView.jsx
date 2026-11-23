import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { ArrowLeft, MapPin, Package, CheckCircle2, Clock } from 'lucide-react';

export default function UserOrderView({ order }) {
    const address = order.address || {};
    const items = order.items || [];

    return (
        <AppLayout title={`Order #${order.order_number}`} subtitle="Detailed view of your order items and delivery status">
            <Head title={`Order #${order.order_number} - Details`} />

            <div className="space-y-6">
                <Link href="/my-orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to all orders</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Items list */}
                    <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Items in this order</h3>

                        <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                            {items.map((item) => (
                                <div key={item.id} className="py-4 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                            {item.product_name}
                                        </h4>
                                        <p className="text-xs text-gray-400">
                                            Variant: {item.variant_name} • Qty: {item.quantity} × ₹{item.price}
                                        </p>
                                    </div>
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                                        ₹{item.total || item.price * item.quantity}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery Fee</span>
                                <span>₹{order.delivery_fee}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span>Total Paid / Payable</span>
                                <span className="text-blue-600">₹{order.total_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Address & Status */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-3">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Status</h3>
                            <div className="p-3.5 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Order Status</p>
                                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                        {order.status?.value || order.status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <h3 className="font-bold text-sm">Shipping Address</h3>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 leading-relaxed">
                                <p className="font-semibold text-gray-900 dark:text-white">{address.label || 'Customer Address'}</p>
                                <p>{address.line1}</p>
                                {address.line2 && <p>{address.line2}</p>}
                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                {address.phone && <p className="pt-1 text-gray-400">Phone: {address.phone}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


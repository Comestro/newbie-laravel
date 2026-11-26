import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Receipt, Package } from 'lucide-react';

export default function OrderDetail({ order, backUrl = '/my-orders' }) {
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
        <div className="space-y-4">
            <Link
                href={backUrl}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Orders</span>
            </Link>

            {/* Status Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center justify-between">
                <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Status</span>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
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

            {/* Admin Note */}
            {order.admin_notes && (
                <div className="bg-amber-50/80 rounded-2xl border border-amber-200/80 p-4 text-xs text-amber-900">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block mb-0.5">
                        Note from Store
                    </span>
                    <p className="leading-relaxed">{order.admin_notes}</p>
                </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Order Items ({items.length})</span>
                </h3>
                <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                        <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold text-slate-900">{item.product_name}</p>
                                <p className="text-[11px] text-slate-400">
                                    Variant: {item.variant_name} &bull; Qty: {item.quantity} &times; ₹{Number(item.price).toLocaleString()}
                                </p>
                            </div>
                            <span className="text-xs font-bold text-slate-900">
                                ₹{Number(item.total).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-100 mt-4 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>₹{Number(order.subtotal || order.total_amount).toLocaleString()}</span>
                    </div>
                    {order.coupon_discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                            <span>Coupon Discount ({order.coupon_code})</span>
                            <span>-₹{Number(order.coupon_discount).toLocaleString()}</span>
                        </div>
                    )}
                    {(order.discount - (order.coupon_discount || 0)) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                            <span>Loyalty Discount {order.points_used > 0 ? `(${order.points_used.toLocaleString()} pts)` : ''}</span>
                            <span>-₹{Number(order.discount - (order.coupon_discount || 0)).toLocaleString()}</span>
                        </div>
                    )}
                    {order.delivery_fee > 0 && (
                        <div className="flex justify-between text-slate-500">
                            <span>Delivery Fee</span>
                            <span>₹{Number(order.delivery_fee).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                        <span>Total Paid</span>
                        <span>₹{Number(order.total_amount).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Delivery Details */}
            {address && (address.line1 || address.city) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                    <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>Delivery Address</span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        {address.label && <span className="font-semibold text-slate-800">[{address.label}] </span>}
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}
                        {address.city ? `, ${address.city}` : ''}
                        {address.state ? `, ${address.state}` : ''}
                        {address.pincode ? ` - ${address.pincode}` : ''}
                    </p>
                    {address.phone && (
                        <p className="text-xs text-slate-500 mt-1">Phone: {address.phone}</p>
                    )}
                </div>
            )}
        </div>
    );
}


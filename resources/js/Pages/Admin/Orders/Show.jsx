import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, Check, Pencil, Trash2, X, XCircle } from 'lucide-react';

export default function Show({ order, statuses = [], paymentStatuses = [] }) {
    const currentStatus = order.status?.value || order.status;
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.payment_status?.value || order.payment_status);

    const isEditable = !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(currentStatus);
    const [isEditing, setIsEditing] = useState(false);
    const [editableItems, setEditableItems] = useState(order.items || []);
    const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setSelectedStatus(order.status?.value || order.status);
        setSelectedPaymentStatus(order.payment_status?.value || order.payment_status);
        setEditableItems(order.items || []);
        setAdminNotes(order.admin_notes || '');
    }, [order]);

    const handleUpdateStatus = (statusOverride = null) => {
        const statusToSave = typeof statusOverride === 'string' ? statusOverride : selectedStatus;
        router.post(`/admin/orders/${order.id}/status`, { status: statusToSave }, { preserveScroll: true });
    };

    const handleUpdatePaymentStatus = () => {
        router.post(`/admin/orders/${order.id}/payment-status`, { payment_status: selectedPaymentStatus }, { preserveScroll: true });
    };

    const updateQuantity = (itemId, qty) => {
        const parsed = Math.max(1, parseInt(qty, 10) || 1);
        setEditableItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, quantity: parsed } : item))
        );
    };

    const removeItem = (itemId) => {
        if (editableItems.length <= 1) return;
        setEditableItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    const handleCancelEdit = () => {
        setEditableItems(order.items || []);
        setAdminNotes(order.admin_notes || '');
        setIsEditing(false);
    };

    const handleSaveOrder = () => {
        if (editableItems.length === 0) return;
        setSaving(true);
        router.put(
            `/admin/orders/${order.id}`,
            {
                items: editableItems.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                })),
                admin_notes: adminNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => setIsEditing(false),
                onFinish: () => setSaving(false),
            }
        );
    };

    const displayItems = isEditing ? editableItems : order.items || [];
    const liveSubtotal = displayItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const deliveryFee = Number(order.delivery_fee || 0);
    const discount = Number(order.discount || 0);
    const liveTotal = isEditing
        ? Math.max(0, liveSubtotal - discount + deliveryFee)
        : Number(order.total_amount);

    const address = order.address || {};

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
                {/* Left: Items breakdown & Editor */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <h3 className="font-bold text-sm text-slate-900">Purchased Products</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                                {currentStatus}
                            </span>
                        </div>

                        {isEditable && !isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition cursor-pointer"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit Order</span>
                            </button>
                        )}

                        {isEditing && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveOrder}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 rounded-lg transition cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="divide-y divide-slate-100">
                        {displayItems.map((item) => (
                            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-xs text-slate-900">
                                        {item.product_name}
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                        Variant: {item.variant_name} &bull; ₹{item.price} each
                                    </p>
                                </div>

                                {isEditing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.id, e.target.value)}
                                                className="w-12 text-center text-xs font-semibold text-slate-900 py-1 border-x border-slate-200 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <span className="font-bold text-xs text-slate-900 w-20 text-right">
                                            ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            disabled={displayItems.length <= 1}
                                            title={displayItems.length <= 1 ? 'Order must have at least 1 item. Use Cancel Order instead.' : 'Remove item'}
                                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                                        <span className="font-bold text-xs text-slate-900">
                                            ₹{item.total || (Number(item.price) * Number(item.quantity)).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <div className="pt-2">
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Admin Notes (optional)
                            </label>
                            <textarea
                                rows="2"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Reason for quantity change or item removal..."
                                className="w-full text-xs rounded-lg border border-slate-200/80 px-3 py-2 text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                    )}

                    {!isEditing && order.admin_notes && (
                        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 text-xs text-amber-900">
                            <span className="font-semibold">Admin Note: </span>
                            {order.admin_notes}
                        </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>₹{(isEditing ? liveSubtotal : Number(order.subtotal ?? order.total_amount)).toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                                <span>Discount</span>
                                <span>-₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-slate-500">
                            <span>Delivery Fee</span>
                            <span>₹{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm text-slate-900">
                            <span>Total Bill</span>
                            <span>₹{liveTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Controls & Customer */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Quick Pending Actions */}
                    {currentStatus === 'PENDING' && (
                        <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-xs space-y-2.5">
                            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Pending Order Action</h4>
                            <p className="text-[11px] text-slate-500">
                                Review or edit order items first, then confirm or cancel this order.
                            </p>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleUpdateStatus('CONFIRMED')}
                                    disabled={isEditing}
                                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Confirm</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleUpdateStatus('CANCELLED')}
                                    disabled={isEditing}
                                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-50 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    )}

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
                            onClick={() => handleUpdateStatus()}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
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
                            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
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

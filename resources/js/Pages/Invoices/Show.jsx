import React from 'react';
import { Head } from '@inertiajs/react';
import { Printer, X } from 'lucide-react';

export default function Show({ invoice }) {
    const data = invoice?.snapshot || {};
    const customer = data.customer || {};
    const addr = data.address || {};
    const items = data.items || [];
    const totals = data.totals || {};
    const invoiceNumber = data.invoice_number || invoice?.invoice_number || '-';

    const formatMoney = (value) =>
        Number(value || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const formatDate = (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 py-8 px-4 print:bg-white print:p-0">
            <Head title={`Invoice ${invoiceNumber} - Newbie Service`} />

            {/* Top Action Bar (hidden when printing) */}
            <div className="max-w-3xl mx-auto mb-4 flex items-center justify-end gap-2.5 print:hidden">
                <button
                    type="button"
                    onClick={() => window.close()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                    <X className="w-3.5 h-3.5" />
                    <span>Close</span>
                </button>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                </button>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 print:shadow-none print:border-0 print:p-0 print:max-w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 mb-6 border-b-2 border-slate-100">
                    <div>
                        <div className="text-2xl font-black tracking-tight text-purple-600">NEWBIE SERVICE</div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Premium Grocery &amp; Wholesale Delivery<br />
                            support@newbieservice.com
                        </p>
                    </div>
                    <div className="sm:text-right">
                        <h1 className="text-xl font-extrabold text-slate-900">TAX INVOICE</h1>
                        <div className="text-xs text-slate-500 mt-1.5 space-y-0.5 leading-relaxed">
                            <p><strong className="text-slate-700">Invoice #:</strong> {invoiceNumber}</p>
                            <p><strong className="text-slate-700">Order #:</strong> #{data.order_number}</p>
                            <p><strong className="text-slate-700">Invoice Date:</strong> {formatDate(data.issued_at || invoice?.issued_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Billing & Order Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Billed To</h4>
                        <p className="text-xs font-bold text-slate-900">{customer.name || 'Customer'}</p>
                        {customer.shop_name && (
                            <p className="text-xs text-slate-700 mt-0.5">Shop: {customer.shop_name}</p>
                        )}
                        {customer.gst_number && (
                            <p className="text-xs text-slate-700 mt-0.5">GSTIN: {customer.gst_number}</p>
                        )}
                        {customer.email && (
                            <p className="text-xs text-slate-600 mt-0.5">{customer.email}</p>
                        )}
                        {(addr.line1 || addr.city) && (
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                                {addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.pincode ? ` - ${addr.pincode}` : ''}
                                {addr.phone && (<><br />Phone: {addr.phone}</>)}
                            </p>
                        )}
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Order &amp; Payment Info</h4>
                        <div className="text-xs text-slate-700 space-y-1">
                            <p><strong>Order Status:</strong> {data.status}</p>
                            <p><strong>Payment Method:</strong> {data.payment_method}</p>
                            <p><strong>Payment Status:</strong> {data.payment_status}</p>
                            <p><strong>Order Date:</strong> {formatDate(data.order_created_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="py-2.5 px-3">#</th>
                                <th className="py-2.5 px-3">Item</th>
                                <th className="py-2.5 px-3">Variant</th>
                                <th className="py-2.5 px-3 text-right">Qty</th>
                                <th className="py-2.5 px-3 text-right">Unit Price</th>
                                <th className="py-2.5 px-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {items.map((item, idx) => (
                                <tr key={item.id || idx}>
                                    <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                                    <td className="py-3 px-3 font-semibold text-slate-900">{item.product_name}</td>
                                    <td className="py-3 px-3 text-slate-600">{item.variant_name}</td>
                                    <td className="py-3 px-3 text-right">{item.quantity}</td>
                                    <td className="py-3 px-3 text-right">₹{formatMoney(item.price)}</td>
                                    <td className="py-3 px-3 text-right font-bold text-slate-900">₹{formatMoney(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="w-full sm:w-72 ml-auto text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>₹{formatMoney(totals.subtotal)}</span>
                    </div>
                    {Number(totals.coupon_discount || 0) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                            <span>Coupon ({totals.coupon_code})</span>
                            <span>-₹{formatMoney(totals.coupon_discount)}</span>
                        </div>
                    )}
                    {Number(totals.loyalty_discount || 0) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                            <span>Loyalty Discount</span>
                            <span>-₹{formatMoney(totals.loyalty_discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                        <span>Delivery Fee</span>
                        <span>₹{formatMoney(totals.delivery_fee)}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2.5 mt-2 border-t-2 border-slate-200">
                        <span>Grand Total</span>
                        <span>₹{formatMoney(totals.total_amount)}</span>
                    </div>
                </div>

                <div className="mt-9 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
                    Thank you for shopping with Newbie Service! This is a computer-generated invoice.
                </div>
            </div>
        </div>
    );
}

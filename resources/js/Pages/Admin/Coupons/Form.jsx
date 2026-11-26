import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function Form({ coupon = null }) {
    const isEditing = Boolean(coupon);

    const { data, setData, post, put, processing, errors } = useForm({
        code: coupon?.code || '',
        type: coupon?.type || 'PERCENT',
        value: coupon?.value || '',
        min_order_amount: coupon?.min_order_amount ?? 0,
        max_discount_amount: coupon?.max_discount_amount || '',
        usage_limit: coupon?.usage_limit || '',
        expires_at: coupon?.expires_at ? coupon.expires_at.slice(0, 10) : '',
        is_active: coupon?.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/coupons/${coupon.id}`);
        } else {
            post('/admin/coupons');
        }
    };

    return (
        <AdminLayout
            title={isEditing ? `Edit Coupon: ${coupon.code}` : 'Create Coupon'}
            subtitle="Configure promo code discount, minimum order, and usage limits"
            action={
                <Link
                    href="/admin/coupons"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Coupons</span>
                </Link>
            }
        >
            <Head title={`${isEditing ? 'Edit' : 'Create'} Coupon - Admin Console`} />

            <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Coupon Code *</label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            placeholder="e.g. SAVE20"
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono uppercase text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Discount Type *</label>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        >
                            <option value="PERCENT">Percentage (%)</option>
                            <option value="FIXED">Flat Amount (₹)</option>
                        </select>
                        {errors.type && <p className="text-xs text-rose-500 mt-1">{errors.type}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {data.type === 'FIXED' ? 'Discount Amount (₹) *' : 'Discount Percentage (%) *'}
                        </label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={data.value}
                            onChange={(e) => setData('value', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        {errors.value && <p className="text-xs text-rose-500 mt-1">{errors.value}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Minimum Order Subtotal (₹)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.min_order_amount}
                            onChange={(e) => setData('min_order_amount', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        {errors.min_order_amount && <p className="text-xs text-rose-500 mt-1">{errors.min_order_amount}</p>}
                    </div>

                    {data.type === 'PERCENT' && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Max Discount Cap (₹, optional)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.max_discount_amount}
                                onChange={(e) => setData('max_discount_amount', e.target.value)}
                                placeholder="No limit"
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            {errors.max_discount_amount && <p className="text-xs text-rose-500 mt-1">{errors.max_discount_amount}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Usage Limit (optional)</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={data.usage_limit}
                            onChange={(e) => setData('usage_limit', e.target.value)}
                            placeholder="Unlimited"
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        {errors.usage_limit && <p className="text-xs text-rose-500 mt-1">{errors.usage_limit}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expiry Date (optional)</label>
                        <input
                            type="date"
                            value={data.expires_at}
                            onChange={(e) => setData('expires_at', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        {errors.expires_at && <p className="text-xs text-rose-500 mt-1">{errors.expires_at}</p>}
                    </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="rounded accent-purple-600"
                    />
                    <span className="text-xs font-semibold text-slate-700">Coupon is active</span>
                </label>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        <span>{processing ? 'Saving...' : isEditing ? 'Update Coupon' : 'Create Coupon'}</span>
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}


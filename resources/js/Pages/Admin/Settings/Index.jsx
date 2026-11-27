import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Coins, Save, ShieldCheck } from 'lucide-react';

export default function Index({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        membership_fee: settings.membership_fee ?? 49,
        membership_bonus_points: settings.membership_bonus_points ?? 5000,
        points_per_rupee: settings.points_per_rupee ?? 100,
        require_membership_for_order: Boolean(settings.require_membership_for_order),
        earn_points_on_order: Boolean(settings.earn_points_on_order ?? true),
        points_per_100_rupees: settings.points_per_100_rupees ?? 1,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/settings', { preserveScroll: true });
    };

    const pointsPerRupee = Math.max(1, Number(data.points_per_rupee) || 100);
    const bonusWorth = (Number(data.membership_bonus_points || 0) / pointsPerRupee).toFixed(2);

    return (
        <AdminLayout
            title="Membership & Loyalty Settings"
            subtitle="Configure membership pricing, bonus points, point conversion rate, and order rules"
        >
            <Head title="Membership & Loyalty Settings - Admin Console" />

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {/* Membership Plan Configuration */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Membership Plan & Order Access</h2>
                            <p className="text-[11px] text-slate-400">Control membership pricing and whether non-members can place orders</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Membership Fee (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.membership_fee}
                                onChange={(e) => setData('membership_fee', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            {errors.membership_fee && <p className="text-xs text-rose-500 mt-1">{errors.membership_fee}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Bonus Loyalty Points on Join
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={data.membership_bonus_points}
                                onChange={(e) => setData('membership_bonus_points', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            {errors.membership_bonus_points && <p className="text-xs text-rose-500 mt-1">{errors.membership_bonus_points}</p>}
                        </div>
                    </div>

                    <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.require_membership_for_order}
                            onChange={(e) => setData('require_membership_for_order', e.target.checked)}
                            className="mt-0.5 rounded accent-purple-600"
                        />
                        <div>
                            <span className="text-xs font-bold text-slate-900 block">
                                Require Membership Plan to Place Orders
                            </span>
                            <span className="text-[11px] text-slate-500">
                                When enabled, new customers and retailers must purchase the membership plan before placing an order. Disable to allow orders without membership.
                            </span>
                        </div>
                    </label>
                </div>

                {/* Loyalty Point Value Configuration */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Coins className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Loyalty Points Conversion Rate</h2>
                            <p className="text-[11px] text-slate-400">Set how many loyalty points equal ₹1 during checkout &amp; top-ups</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Points Required per ₹1 (Redeem / Top-up)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={data.points_per_rupee}
                                onChange={(e) => setData('points_per_rupee', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            {errors.points_per_rupee && <p className="text-xs text-rose-500 mt-1">{errors.points_per_rupee}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Points Earned per ₹100 Spent
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                disabled={!data.earn_points_on_order}
                                value={data.points_per_100_rupees}
                                onChange={(e) => setData('points_per_100_rupees', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                            {errors.points_per_100_rupees && <p className="text-xs text-rose-500 mt-1">{errors.points_per_100_rupees}</p>}
                        </div>
                    </div>

                    <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.earn_points_on_order}
                            onChange={(e) => setData('earn_points_on_order', e.target.checked)}
                            className="mt-0.5 rounded accent-purple-600"
                        />
                        <div>
                            <span className="text-xs font-bold text-slate-900 block">
                                Award Loyalty Points on Order Placement
                            </span>
                            <span className="text-[11px] text-slate-500">
                                When enabled, customers earn {Number(data.points_per_100_rupees || 0)} point(s) for every ₹100 spent on an order.
                            </span>
                        </div>
                    </label>

                    <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-1">
                        <p className="font-bold">Live Preview:</p>
                        <p>&bull; Conversion rate: <span className="font-bold">{pointsPerRupee} Points = ₹1.00</span></p>
                        <p>&bull; New member pays <span className="font-bold">₹{data.membership_fee || 0}</span> and receives <span className="font-bold">{Number(data.membership_bonus_points || 0).toLocaleString()} Points</span> (worth <span className="font-bold">₹{bonusWorth}</span>)</p>
                        <p>&bull; Direct top-up of ₹100 gives <span className="font-bold">{(100 * pointsPerRupee).toLocaleString()} Points</span></p>
                        <p>
                            &bull; Order reward:{' '}
                            {data.earn_points_on_order ? (
                                <span className="font-bold">
                                    Earn {Number(data.points_per_100_rupees || 0)} point(s) per ₹100 spent (₹500 order = {5 * Number(data.points_per_100_rupees || 0)} points)
                                </span>
                            ) : (
                                <span className="font-bold text-slate-600">Disabled (0 points earned on orders)</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        <span>{processing ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}


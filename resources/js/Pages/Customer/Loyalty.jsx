import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomerLayout from '../../Layouts/CustomerLayout';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, Coins, Crown, PlusCircle, ShieldAlert } from 'lucide-react';

export default function Loyalty({ config, transactions = [], pendingPoints = 0 }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    const pointsPerRupee = Math.max(1, Number(config?.points_per_rupee) || 100);
    const membershipFee = Number(config?.membership_fee ?? 49);
    const bonusPoints = Number(config?.membership_bonus_points ?? 5000);
    const userPoints = Number(user.loyalty_points || 0);
    const pointsWorth = (userPoints / pointsPerRupee).toFixed(2);

    const [topupAmount, setTopupAmount] = useState(50);
    const [loadingMembership, setLoadingMembership] = useState(false);
    const [loadingTopup, setLoadingTopup] = useState(false);

    const handleBuyMembership = async () => {
        setLoadingMembership(true);
        try {
            const { data } = await axios.post('/loyalty/membership/razorpay-order');
            if (data.activated) {
                router.reload();
                setLoadingMembership(false);
                return;
            }

            await openRazorpayCheckout({
                orderData: data,
                description: 'Membership Plan Activation',
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                    contact: user.phone || '',
                },
                onDismiss: () => setLoadingMembership(false),
                onFailure: (msg) => {
                    toast.error(msg);
                    setLoadingMembership(false);
                },
                onSuccess: (response) => {
                    router.post('/loyalty/membership/verify', response, {
                        preserveScroll: true,
                        onFinish: () => setLoadingMembership(false),
                    });
                },
            });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Unable to start membership payment.');
            setLoadingMembership(false);
        }
    };

    const handleTopup = async (e) => {
        e.preventDefault();
        const amount = Number(topupAmount);
        if (!amount || amount < 1) {
            toast.error('Please enter a valid top-up amount (min ₹1).');
            return;
        }

        setLoadingTopup(true);
        try {
            const { data } = await axios.post('/loyalty/topup/razorpay-order', { amount });

            await openRazorpayCheckout({
                orderData: data,
                description: `Loyalty Points Top-Up (₹${amount})`,
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                    contact: user.phone || '',
                },
                onDismiss: () => setLoadingTopup(false),
                onFailure: (msg) => {
                    toast.error(msg);
                    setLoadingTopup(false);
                },
                onSuccess: (response) => {
                    router.post('/loyalty/topup/verify', {
                        amount,
                        ...response,
                    }, {
                        preserveScroll: true,
                        onFinish: () => setLoadingTopup(false),
                    });
                },
            });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Unable to start top-up payment.');
            setLoadingTopup(false);
        }
    };

    return (
        <CustomerLayout
            title="Membership & Loyalty Wallet"
            subtitle="Manage your membership plan, top up loyalty points, and redeem points on orders"
        >
            <Head title="Membership & Loyalty Wallet - Newbie Service" />

            <div className="space-y-6">
                {/* Summary Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Points Balance Card */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-100">
                                Loyalty Points Balance
                            </span>
                            <Coins className="w-5 h-5 text-amber-300" />
                        </div>
                        <p className="text-3xl font-black mt-2">{userPoints.toLocaleString()} pts</p>
                        <p className="text-xs text-purple-100 mt-1">
                            Worth <span className="font-bold text-white">₹{pointsWorth}</span> ({pointsPerRupee} points = ₹1)
                        </p>
                        {pendingPoints > 0 && (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-300/30 text-amber-100 text-[11px] font-semibold">
                                <Clock className="w-3.5 h-3.5 text-amber-300" />
                                <span>+{Number(pendingPoints).toLocaleString()} pts On the way (credited on delivery)</span>
                            </div>
                        )}
                    </div>

                    {/* Membership Status Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
                        {user.is_member ? (
                            <>
                                <div>
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="text-sm font-bold">Active Monthly Member</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Your monthly membership is active! You can place orders and redeem your loyalty points anytime at checkout.
                                    </p>
                                </div>
                                {user.membership_expires_at && (
                                    <p className="text-[11px] font-semibold text-emerald-700 mt-3 pt-3 border-t border-slate-100">
                                        Valid until{' '}
                                        {new Date(user.membership_expires_at).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="flex items-center gap-2 text-amber-600">
                                        {config?.require_membership_for_order ? (
                                            <ShieldAlert className="w-5 h-5" />
                                        ) : (
                                            <Crown className="w-5 h-5" />
                                        )}
                                        <span className="text-sm font-bold">
                                            {user.membership_paid_at
                                                ? 'Monthly Membership Expired'
                                                : config?.require_membership_for_order
                                                ? 'Monthly Membership Required to Order'
                                                : 'Become a Monthly Member'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1.5">
                                        {user.membership_paid_at ? (
                                            <>
                                                Renew for <span className="font-bold text-slate-900">₹{membershipFee}/month</span> and get{' '}
                                                <span className="font-bold text-purple-700">
                                                    {Math.round(membershipFee * pointsPerRupee).toLocaleString()} Loyalty Points
                                                </span>{' '}
                                                (worth ₹{membershipFee.toFixed(2)})!
                                            </>
                                        ) : (
                                            <>
                                                Pay <span className="font-bold text-slate-900">₹{membershipFee}/month</span> and get{' '}
                                                <span className="font-bold text-purple-700">{bonusPoints.toLocaleString()} Loyalty Points</span>{' '}
                                                on your first month ({Math.round(membershipFee * pointsPerRupee).toLocaleString()} pts/month on renewal)!
                                            </>
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleBuyMembership}
                                    disabled={loadingMembership}
                                    className="mt-4 w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                                >
                                    {loadingMembership
                                        ? 'Opening Razorpay...'
                                        : user.membership_paid_at
                                        ? `Renew Monthly Membership (Pay ₹${membershipFee})`
                                        : `Activate Monthly Membership (Pay ₹${membershipFee})`}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Direct Top-Up Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                        <PlusCircle className="w-5 h-5 text-purple-600" />
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Direct Loyalty Points Top-Up</h2>
                            <p className="text-[11px] text-slate-400">Add points to your wallet anytime ({pointsPerRupee} points per ₹1)</p>
                        </div>
                    </div>

                    <form onSubmit={handleTopup} className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {[10, 50, 100, 500].map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setTopupAmount(preset)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                        Number(topupAmount) === preset
                                            ? 'bg-purple-50 border-purple-400 text-purple-700'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    ₹{preset} ({(preset * pointsPerRupee).toLocaleString()} pts)
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                            <div className="flex-1 max-w-xs">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Custom Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50000"
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loadingTopup}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                                {loadingTopup
                                    ? 'Processing...'
                                    : `Add ${(Math.max(0, Number(topupAmount) || 0) * pointsPerRupee).toLocaleString()} Points (Pay ₹${topupAmount || 0})`}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                    <h2 className="text-sm font-bold text-slate-900 mb-4">Points History</h2>

                    {transactions.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">No loyalty point transactions yet.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {transactions.map((tx) => {
                                const isPending = tx.type === 'ORDER_EARN_PENDING';
                                const isCredit = tx.points >= 0;
                                return (
                                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                isPending
                                                    ? 'bg-amber-50 text-amber-600'
                                                    : isCredit
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : 'bg-rose-50 text-rose-600'
                                            }`}>
                                                {isPending ? <Clock className="w-4 h-4" /> : isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-semibold text-slate-900">{tx.description}</p>
                                                    {isPending && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                            On the way
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400">
                                                    {tx.type} &bull; {new Date(tx.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-extrabold ${
                                            isPending ? 'text-amber-600' : isCredit ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                            {isCredit ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} pts
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}


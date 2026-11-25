import React from 'react';
import { Head, Link } from '@inertiajs/react';
import RetailerLayout from '../../Layouts/RetailerLayout';
import { Store, ShoppingBag, Package, CheckCircle2, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard({ user = null, totalAssignedOrders = 0, fulfilledOrders = 0, recentOrders = [] }) {
    const isVerified = user?.is_kyc_approved || user?.apply_status === 'VERIFIED';
    const isPending = user?.apply_status === 'PENDING';
    const isRejected = user?.apply_status === 'REJECTED';

    const headerAction = (
        <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition shadow-xs w-fit cursor-pointer"
        >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Browse Wholesale Products</span>
        </Link>
    );

    return (
        <RetailerLayout
            title="Retailer Hub"
            subtitle="Wholesale bulk ordering, account fulfillment, and verification status"
            action={headerAction}
        >
            <Head title="Retailer Dashboard - Newbie Service" />

            <div className="space-y-6">
                {/* KYC Verification Status Banner */}
                {isVerified ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                                <p className="font-bold text-xs">Retailer Account Verified & Active</p>
                                <p className="text-[11px] text-emerald-700 mt-0.5">
                                    Your KYC documents are approved. You have full access to wholesale bulk pricing and order placement.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : isPending ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="font-bold text-xs">KYC Verification Under Review</p>
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                    You can view products and wholesale pricing. Placing orders will unlock once our admin team approves your documents.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/retailer/kyc"
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shrink-0 shadow-xs"
                        >
                            View Application
                        </Link>
                    </div>
                ) : isRejected ? (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <div>
                                <p className="font-bold text-xs">KYC Application Rejected</p>
                                <p className="text-[11px] text-rose-700 mt-0.5">
                                    Reason: {user?.kyc_reject_reason || 'Please upload valid documents'}. Please re-submit your KYC documents to place orders.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/retailer/kyc"
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shrink-0 shadow-xs"
                        >
                            Resubmit KYC
                        </Link>
                    </div>
                ) : (
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                            <Store className="w-5 h-5 text-purple-600 shrink-0" />
                            <div>
                                <p className="font-bold text-xs">Complete Retailer KYC Verification</p>
                                <p className="text-[11px] text-purple-700 mt-0.5">
                                    Upload your Aadhaar details to get verified and unlock retailer wholesale ordering.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/retailer/kyc"
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shrink-0 shadow-xs"
                        >
                            Submit KYC
                        </Link>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Package className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalAssignedOrders}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Orders</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{fulfilledOrders}</p>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3.5">
                        <h2 className="text-sm font-bold text-slate-900">Recent Wholesale Orders</h2>
                        <Link href="/retailer/orders" className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                            View All &rarr;
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-xs text-slate-400">No wholesale orders placed yet.</p>
                            <Link
                                href="/catalog"
                                className="inline-block mt-3 text-xs font-bold text-purple-600 hover:text-purple-700"
                            >
                                Start shopping &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentOrders.map((ord) => (
                                <div key={ord.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <span className="font-mono font-bold text-xs text-slate-900">
                                            #{ord.order_number}
                                        </span>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            ₹{Number(ord.total_amount).toLocaleString()} &bull; {new Date(ord.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                            {ord.status?.value || ord.status}
                                        </span>
                                        <Link
                                            href={`/order-view/${ord.order_number || ord.id}`}
                                            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                                        >
                                            View &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RetailerLayout>
    );
}

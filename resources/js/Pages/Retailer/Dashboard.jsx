import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { Store, ShoppingBag, Package, CheckCircle2, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard({ user = null, totalAssignedOrders = 0, fulfilledOrders = 0, recentOrders = [] }) {
    const isVerified = user?.is_kyc_approved || user?.apply_status === 'VERIFIED';
    const isPending = user?.apply_status === 'PENDING';
    const isRejected = user?.apply_status === 'REJECTED';

    return (
        <ShopLayout>
            <Head title="Retailer Dashboard - Newbie Service" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900">Retailer Hub</h1>
                            {isVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>KYC Verified</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3" />
                                    <span>KYC Pending</span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Manage wholesale orders, stock fulfillment, and view product catalog.</p>
                    </div>

                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition shadow-xs w-fit"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Browse Products</span>
                    </Link>
                </div>

                {/* KYC Verification Status Banner */}
                {isVerified ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
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
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="font-bold text-xs">KYC Verification Under Review</p>
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                    You can log in, view products, and see retailer pricing. Placing orders will be enabled once our admin team approves your documents.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/apply-to-retailer"
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition shrink-0"
                        >
                            View Application
                        </Link>
                    </div>
                ) : isRejected ? (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 shadow-xs">
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
                            href="/apply-to-retailer"
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition shrink-0"
                        >
                            Resubmit KYC
                        </Link>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                            <Store className="w-5 h-5 text-purple-600 shrink-0" />
                            <div>
                                <p className="font-bold text-xs">Complete Retailer KYC Verification</p>
                                <p className="text-[11px] text-purple-700 mt-0.5">
                                    Upload your Aadhaar details to get verified and unlock retailer order placement.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/apply-to-retailer"
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition shrink-0"
                        >
                            Submit KYC
                        </Link>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Package className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalAssignedOrders}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Fulfilled Orders</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{fulfilledOrders}</p>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
                    <h2 className="text-sm font-bold text-slate-900 mb-3">Wholesale Orders</h2>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-xs text-slate-400">No wholesale orders placed yet.</p>
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
                                            ₹{ord.total_amount} &bull; {new Date(ord.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                                        {ord.status?.value || ord.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}

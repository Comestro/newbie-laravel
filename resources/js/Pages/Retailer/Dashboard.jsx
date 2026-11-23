import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { Store, ShoppingBag, Package, CheckCircle2 } from 'lucide-react';

export default function Dashboard({ totalAssignedOrders = 0, fulfilledOrders = 0, recentOrders = [] }) {
    return (
        <ShopLayout>
            <Head title="Retailer Dashboard - Newbie Service" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Retailer Hub</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage stock fulfillment and dispatch incoming grocery orders.</p>
                </div>

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
                    <h2 className="text-sm font-bold text-slate-900 mb-3">Assigned Orders</h2>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-xs text-slate-400">No pending orders assigned to your retail hub.</p>
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
                                            {ord.customer_name} &bull; ₹{ord.total_amount}
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

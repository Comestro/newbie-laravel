import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccess({ orderNumber }) {
    return (
        <ShopLayout>
            <Head title="Order Confirmed - Newbie Service" />

            <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-8 text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <h1 className="text-xl font-bold text-slate-900 mb-1.5">
                        Order Confirmed 🎉
                    </h1>

                    <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                        Your order has been placed successfully. We’ll dispatch it right away.
                    </p>

                    {/* Order ID */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-5">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                            Order Reference ID
                        </p>
                        <p className="text-base font-extrabold text-purple-600 font-mono">
                            #{orderNumber}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <Link
                            href="/catalog"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-semibold text-xs transition"
                        >
                            Continue Shopping
                        </Link>

                        <Link
                            href="/my-orders"
                            className="flex-1 border border-slate-200 py-2.5 rounded-xl font-semibold text-xs text-slate-700 hover:bg-slate-50 transition"
                        >
                            View My Orders
                        </Link>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}

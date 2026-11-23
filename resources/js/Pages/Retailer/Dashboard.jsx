import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { Store, CheckCircle2, Package, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Dashboard({ user }) {
    return (
        <ShopLayout>
            <Head title="Retailer Hub - Newbie Service" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-emerald-600/20 mb-10">
                    <div className="flex items-center gap-2 mb-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                        <Store className="w-4 h-4" />
                        <span>Verified Retailer Partner</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold">Welcome, {user?.name}!</h1>
                    <p className="mt-2 text-emerald-100 max-w-xl text-base">
                        Your store KYC is approved. You have full access to supplier inventory and order fulfillment on the Newbie Network.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-xs">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Fulfillment Orders</h3>
                        <p className="text-sm text-gray-500 mb-4">Orders scheduled for store dispatch.</p>
                        <Link href="/my-orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            <span>View Store Orders</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-xs">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Catalog Sourcing</h3>
                        <p className="text-sm text-gray-500 mb-4">Explore dairy, beverages and supply prices.</p>
                        <Link href="/catalog" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            <span>Browse Catalog</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-xs">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Retailer Support</h3>
                        <p className="text-sm text-gray-500 mb-4">Need help with logistics or payout queries?</p>
                        <a href="mailto:support@newbie.com" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            <span>Contact Manager</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}


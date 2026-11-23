import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { User, ShoppingBag, Heart, MapPin, ShieldCheck, LogOut } from 'lucide-react';

export default function UserAccounts({ auth }) {
    const user = auth?.user || {};

    return (
        <ShopLayout>
            <Head title="My Account - Newbie Service" />

            <div className="max-w-xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-center mb-6">
                    <div className="w-14 h-14 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2.5">
                        {user.name?.charAt(0) || 'U'}
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{user.name}</h2>
                    <p className="text-xs text-slate-400">{user.email}</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-xs overflow-hidden">
                    <Link href="/dashboard" className="flex items-center justify-between p-4 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                        <span>Dashboard</span>
                        <span>&rarr;</span>
                    </Link>
                    <Link href="/my-orders" className="flex items-center justify-between p-4 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                        <span>My Orders</span>
                        <span>&rarr;</span>
                    </Link>
                    <Link href="/wishlist" className="flex items-center justify-between p-4 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                        <span>Wishlist</span>
                        <span>&rarr;</span>
                    </Link>
                    <Link href="/my-addresses" className="flex items-center justify-between p-4 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                        <span>Saved Addresses</span>
                        <span>&rarr;</span>
                    </Link>
                    <Link href="/profile" className="flex items-center justify-between p-4 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                        <span>Profile Settings</span>
                        <span>&rarr;</span>
                    </Link>
                    <Link href="/apply-to-retailer" className="flex items-center justify-between p-4 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                        <span>Retailer KYC</span>
                        <span>&rarr;</span>
                    </Link>
                </div>
            </div>
        </ShopLayout>
    );
}

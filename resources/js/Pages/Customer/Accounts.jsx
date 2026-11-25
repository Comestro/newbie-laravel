import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import { ShoppingBag, Heart, MapPin, ShieldCheck, User } from 'lucide-react';

export default function Accounts({ auth }) {
    const user = auth?.user || {};

    const items = [
        { label: 'My Orders', href: '/my-orders', icon: ShoppingBag, desc: 'Track, view, and re-order previous items' },
        { label: 'My Wishlist', href: '/wishlist', icon: Heart, desc: 'Saved favorite items for later' },
        { label: 'Saved Addresses', href: '/my-addresses', icon: MapPin, desc: 'Manage your delivery and home locations' },
        { label: 'Profile Settings', href: '/profile', icon: User, desc: 'Update contact info, name, and password' },
        { label: 'Apply for Retailer', href: '/apply-to-retailer', icon: ShieldCheck, desc: 'Become a wholesale B2B partner' },
    ];

    return (
        <CustomerLayout title="My Account" subtitle="Manage your Newbie account settings and shortcuts">
            <Head title="My Account - Newbie Service" />

            <div className="space-y-4 max-w-xl">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-700 font-bold text-lg flex items-center justify-center shrink-0">
                        {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 truncate">{user.name}</h2>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-xs overflow-hidden">
                    {items.map((it) => {
                        const Icon = it.icon;
                        return (
                            <Link
                                key={it.href}
                                href={it.href}
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-purple-50 text-slate-500 group-hover:text-purple-600 flex items-center justify-center transition">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{it.label}</p>
                                        <p className="text-[11px] text-slate-400">{it.desc}</p>
                                    </div>
                                </div>
                                <span className="text-slate-300 group-hover:text-purple-600 text-xs font-bold">&rarr;</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </CustomerLayout>
    );
}


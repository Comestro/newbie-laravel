import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    MapPin,
    User,
    Store,
    LogOut,
    ChevronRight
} from 'lucide-react';

export default function UserAccounts() {
    const handleLogout = () => {
        router.post('/logout');
    };

    const links = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'My Orders', href: '/my-orders', icon: ShoppingBag },
        { label: 'Wishlist', href: '/wishlist', icon: Heart },
        { label: 'My Addresses', href: '/my-addresses', icon: MapPin },
        { label: 'Profile Information', href: '/profile', icon: User },
        { label: 'Apply to Retailer', href: '/apply-to-retailer', icon: Store },
    ];

    return (
        <ShopLayout>
            <Head title="Account Menu - Newbie Service" />

            <div className="max-w-md mx-auto px-4 py-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account</h1>
                    <p className="text-sm text-gray-500">Manage your orders and settings</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden shadow-sm">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                        {link.label}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </Link>
                        );
                    })}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-sm font-semibold"
                    >
                        <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </ShopLayout>
    );
}


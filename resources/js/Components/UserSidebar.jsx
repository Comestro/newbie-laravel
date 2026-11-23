import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    MapPin,
    User,
    ShieldCheck,
    LogOut
} from 'lucide-react';

export default function UserSidebar() {
    const { url } = usePage();

    const isActive = (path) => (path === '/dashboard' ? url === '/dashboard' : url.startsWith(path));

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const links = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            activeColor: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
            iconBoxActive: 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400',
            iconBoxDefault: 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 group-hover:text-blue-600',
        },
        {
            label: 'Orders',
            href: '/my-orders',
            icon: ShoppingBag,
            activeColor: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
            iconBoxActive: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400',
            iconBoxDefault: 'bg-gray-100 dark:bg-gray-700 group-hover:bg-indigo-100 group-hover:text-indigo-600',
        },
        {
            label: 'Wishlist',
            href: '/wishlist',
            icon: Heart,
            activeColor: 'bg-pink-50 dark:bg-pink-900/40 text-pink-500',
            iconBoxActive: 'bg-pink-100 dark:bg-pink-900/60 text-pink-500',
            iconBoxDefault: 'bg-gray-100 dark:bg-gray-700 group-hover:bg-pink-100 group-hover:text-pink-500',
        },
        {
            label: 'Addresses',
            href: '/my-addresses',
            icon: MapPin,
            activeColor: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
            iconBoxActive: 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400',
            iconBoxDefault: 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 group-hover:text-blue-600',
        },
        {
            label: 'Kyc Document',
            href: '/apply-to-retailer',
            icon: ShieldCheck,
            activeColor: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
            iconBoxActive: 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400',
            iconBoxDefault: 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 group-hover:text-blue-600',
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: User,
            activeColor: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
            iconBoxActive: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400',
            iconBoxDefault: 'bg-gray-100 dark:bg-gray-700 group-hover:bg-emerald-100 group-hover:text-emerald-600',
        },
    ];

    return (
        <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sticky top-24 flex flex-col">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 px-2">
                    Account
                </p>

                <nav className="space-y-1 text-sm font-medium flex-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                                    active
                                        ? link.activeColor
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                                        active ? link.iconBoxActive : link.iconBoxDefault
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                </span>
                                <span
                                    className={
                                        active
                                            ? 'font-semibold'
                                            : 'text-gray-700 dark:text-gray-200'
                                    }
                                >
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* LOGOUT */}
                <div className="pt-4 mt-4 border-t dark:border-gray-700">
                    <form onSubmit={handleLogout}>
                        <button
                            type="submit"
                            className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition text-sm font-semibold"
                        >
                            <span className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-500">
                                <LogOut className="w-4 h-4" />
                            </span>
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}

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

export default function CustomerSidebar() {
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
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-purple-600',
        },
        {
            label: 'My Orders',
            href: '/my-orders',
            icon: ShoppingBag,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-indigo-600',
        },
        {
            label: 'Wishlist',
            href: '/wishlist',
            icon: Heart,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-pink-500',
        },
        {
            label: 'Saved Addresses',
            href: '/my-addresses',
            icon: MapPin,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Apply for Retailer',
            href: '/apply-to-retailer',
            icon: ShieldCheck,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Profile Settings',
            href: '/profile',
            icon: User,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-slate-600',
        },
    ];

    return (
        <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-3 sticky top-20 flex flex-col shadow-xs">
                <div className="px-3 py-2 mb-1 border-b border-slate-100">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Customer Portal
                    </p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">My Account</p>
                </div>

                <nav className="space-y-1 text-xs font-medium flex-1 pt-2">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                                    active
                                        ? link.activeColor
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? '' : link.iconColor}`} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-2 mt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}


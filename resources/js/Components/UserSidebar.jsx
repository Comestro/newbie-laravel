import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    MapPin,
    User,
    ShieldCheck,
    Store,
    LogOut
} from 'lucide-react';

export default function UserSidebar() {
    const { url, props } = usePage();
    const isRetailer = Boolean(props.auth?.user?.is_retailer);

    const isActive = (path) => (path === '/dashboard' ? url === '/dashboard' : url.startsWith(path));

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const links = [
        ...(isRetailer
            ? [
                  {
                      label: 'Retailer Hub',
                      href: '/retailer/dashboard',
                      icon: Store,
                      activeColor: 'bg-emerald-50 text-emerald-700 font-semibold',
                      iconColor: 'text-emerald-600',
                  },
              ]
            : []),
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-purple-600',
        },
        {
            label: 'Orders',
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
            label: 'Addresses',
            href: '/my-addresses',
            icon: MapPin,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-blue-600',
        },
        {
            label: isRetailer ? 'KYC Document' : 'Apply for Retailer',
            href: '/apply-to-retailer',
            icon: ShieldCheck,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: User,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-slate-600',
        },
    ];

    return (
        <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-xl border border-slate-100 p-3 sticky top-20 flex flex-col">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-2 py-1 mb-1">
                    Account
                </p>

                <nav className="space-y-0.5 text-xs font-medium flex-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                                    active
                                        ? link.activeColor
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? 'text-purple-600' : link.iconColor}`} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* LOGOUT */}
                <div className="pt-3 mt-3 border-t border-slate-100">
                    <form onSubmit={handleLogout}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition text-xs font-medium"
                        >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}

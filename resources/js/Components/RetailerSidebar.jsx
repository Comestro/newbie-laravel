import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Store,
    ShoppingBag,
    Package,
    Heart,
    MapPin,
    User,
    ShieldCheck,
    Clock,
    LogOut
} from 'lucide-react';

export default function RetailerSidebar() {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const isKycApproved = Boolean(user?.is_kyc_approved);

    const isActive = (path) => {
        if (path === '/retailer/dashboard') return url === '/retailer/dashboard';
        return url.startsWith(path);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const links = [
        {
            label: 'Retailer Hub',
            href: '/retailer/dashboard',
            icon: Store,
            activeColor: 'bg-emerald-50 text-emerald-800 font-bold',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Wholesale Catalog',
            href: '/catalog',
            icon: ShoppingBag,
            activeColor: 'bg-purple-50 text-purple-700 font-semibold',
            iconColor: 'text-purple-600',
        },
        {
            label: 'Wholesale Orders',
            href: '/retailer/orders',
            icon: Package,
            activeColor: 'bg-emerald-50 text-emerald-800 font-bold',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Delivery Addresses',
            href: '/retailer/addresses',
            icon: MapPin,
            activeColor: 'bg-emerald-50 text-emerald-800 font-bold',
            iconColor: 'text-blue-600',
        },
        {
            label: 'KYC & Verification',
            href: '/retailer/kyc',
            icon: ShieldCheck,
            activeColor: 'bg-emerald-50 text-emerald-800 font-bold',
            iconColor: 'text-amber-600',
        },
        {
            label: 'Wishlist',
            href: '/retailer/wishlist',
            icon: Heart,
            activeColor: 'bg-emerald-50 text-emerald-800 font-bold',
            iconColor: 'text-pink-500',
        },
        {
            label: 'Profile Settings',
            href: '/retailer/profile',
            icon: User,
            activeColor: 'bg-emerald-50 text-emerald-800 font-bold',
            iconColor: 'text-slate-600',
        },
    ];

    return (
        <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-3.5 sticky top-20 flex flex-col shadow-xs">
                {/* Retailer Header Card */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100/80 mb-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-extrabold flex items-center gap-1">
                            <Store className="w-3.5 h-3.5" />
                            <span>Retailer B2B Hub</span>
                        </span>
                        {isKycApproved ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>Verified</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                                <Clock className="w-2.5 h-2.5" />
                                <span>KYC Req.</span>
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <nav className="space-y-1 text-xs font-medium flex-1 pt-1">
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


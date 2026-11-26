import React from 'react';
import { usePage } from '@inertiajs/react';
import {
    Store,
    ShoppingBag,
    Package,
    Heart,
    MapPin,
    User,
    ShieldCheck,
    Clock,
} from 'lucide-react';
import PanelSidebar from './Portal/PanelSidebar';

export default function RetailerSidebar() {
    const { props } = usePage();
    const user = props.auth?.user;
    const isKycApproved = Boolean(user?.is_kyc_approved);

    const links = [
        { label: 'Retailer Hub', href: '/retailer/dashboard', icon: Store },
        { label: 'Wholesale Catalog', href: '/catalog', icon: ShoppingBag },
        { label: 'Wholesale Orders', href: '/retailer/orders', icon: Package },
        { label: 'Delivery Addresses', href: '/retailer/addresses', icon: MapPin },
        { label: 'KYC & Verification', href: '/retailer/kyc', icon: ShieldCheck },
        { label: 'Wishlist', href: '/retailer/wishlist', icon: Heart },
        { label: 'Profile Settings', href: '/retailer/profile', icon: User },
    ];

    const headerExtra = (
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                {isKycApproved ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white shrink-0">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>Verified</span>
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        <span>KYC Req.</span>
                    </span>
                )}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
        </div>
    );

    return (
        <PanelSidebar
            brandHref="/retailer/dashboard"
            badge="Retailer"
            badgeClassName="text-emerald-600"
            rootPath="/retailer/dashboard"
            links={links}
            accent="emerald"
            headerExtra={headerExtra}
        />
    );
}

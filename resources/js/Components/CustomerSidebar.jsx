import React from 'react';
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    MapPin,
    User,
    ShieldCheck,
} from 'lucide-react';
import PanelSidebar from './Portal/PanelSidebar';

export default function CustomerSidebar() {
    const links = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'My Orders', href: '/my-orders', icon: ShoppingBag },
        { label: 'Wishlist', href: '/wishlist', icon: Heart },
        { label: 'Saved Addresses', href: '/my-addresses', icon: MapPin },
        { label: 'Apply for Retailer', href: '/apply-to-retailer', icon: ShieldCheck },
        { label: 'Profile Settings', href: '/profile', icon: User },
    ];

    return (
        <PanelSidebar
            brandHref="/dashboard"
            rootPath="/dashboard"
            links={links}
            accent="purple"
        />
    );
}

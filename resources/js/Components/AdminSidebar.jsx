import React from 'react';
import {
    LayoutDashboard,
    Package,
    Layers,
    ShoppingBag,
    Users,
    ShieldCheck,
    Settings,
    Ticket,
    Image as ImageIcon,
} from 'lucide-react';
import PanelSidebar from './Portal/PanelSidebar';

export default function AdminSidebar() {
    const links = [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
        { label: 'Categories', href: '/admin/categories', icon: Layers },
        { label: 'Products', href: '/admin/products', icon: Package },
        { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'Retailer', href: '/admin/review-retailer', icon: ShieldCheck },
        { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
        { label: 'Loyalty Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <PanelSidebar
            brandHref="/admin/dashboard"
            badge="Admin"
            rootPath="/admin/dashboard"
            links={links}
            accent="purple"
        />
    );
}

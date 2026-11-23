import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    ShieldCheck,
    LogOut,
    ArrowLeft
} from 'lucide-react';

export default function AdminSidebar() {
    const { url } = usePage();

    const isActive = (path) => (path === '/admin/dashboard' ? url === '/admin/dashboard' : url.startsWith(path));

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const links = [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Products', href: '/admin/products', icon: Package },
        { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'Retailer KYC', href: '/admin/review-retailer', icon: ShieldCheck },
    ];

    return (
        <aside className="w-60 bg-white border-r border-slate-100 flex flex-col shrink-0 min-h-screen">
            {/* BRAND */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <img src="/logo.png" className="h-8 w-auto" alt="Admin" />
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Admin</span>
                </Link>
            </div>

            {/* NAV */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                active
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Store Link & LOGOUT */}
            <div className="border-t border-slate-100 p-3 space-y-1">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Store</span>
                </Link>
                <form onSubmit={handleLogout}>
                    <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition text-xs font-semibold"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}

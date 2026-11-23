import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function AdminSidebar() {
    const { url } = usePage();

    const isActive = (path) => (path === '/admin/dashboard' ? url === '/admin/dashboard' : url.startsWith(path));

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const links = [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Products', href: '/admin/products' },
        { label: 'Orders', href: '/admin/orders' },
        { label: 'Customers', href: '/admin/customers' },
        { label: 'Retailer KYC', href: '/admin/review-retailer' },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 min-h-screen">
            {/* BRAND */}
            <div className="h-16 flex items-center justify-between px-6 border-b dark:border-gray-700">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <img src="/logo.png" className="h-8 w-auto" alt="Admin" />
                </Link>
            </div>

            {/* NAV */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {links.map((link) => {
                    const active = isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                active
                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Store Link & LOGOUT */}
            <div className="border-t dark:border-gray-700 p-4 space-y-2">
                <Link
                    href="/"
                    className="block text-center px-4 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                    &larr; Back to Store
                </Link>
                <form onSubmit={handleLogout}>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm"
                    >
                        Logout
                    </button>
                </form>
            </div>
        </aside>
    );
}

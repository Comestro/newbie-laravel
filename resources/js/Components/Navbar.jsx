import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useCart } from '../Context/CartContext';

export default function Navbar() {
    const { auth } = usePage().props;
    const { itemCount, openCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/catalog', { search: searchQuery.trim() });
        }
    };

    return (
        <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <div className="shrink-0 flex items-center">
                            <Link href="/" className="flex items-center">
                                <img src="/logo.png" alt="Newbie" className="h-8 sm:h-9 w-auto" />
                            </Link>
                        </div>
                        <div className="hidden sm:flex items-center space-x-6">
                            <Link
                                href="/catalog"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                            >
                                Shop
                            </Link>
                            <Link
                                href="/catalog"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                            >
                                Categories
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative hidden md:block w-72 lg:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-9 pr-3 py-1.5 border border-slate-200/80 rounded-lg text-sm bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                                placeholder="Search 'milk'..."
                            />
                        </form>

                        {/* Cart */}
                        <button
                            type="button"
                            onClick={openCart}
                            className="relative p-2 text-slate-600 hover:text-purple-600 hover:bg-slate-50 rounded-lg transition"
                            aria-label="Open cart"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {/* Auth */}
                        {auth?.user ? (
                            <div className="flex items-center gap-2 sm:gap-3">
                                {auth.user.is_admin ? (
                                    <Link
                                        href="/admin/dashboard"
                                        className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                                    >
                                        Admin Panel
                                    </Link>
                                ) : auth.user.is_retailer ? (
                                    <Link
                                        href="/retailer/dashboard"
                                        className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1.5"
                                    >
                                        Retailer Hub
                                    </Link>
                                ) : (
                                    <Link
                                        href="/dashboard"
                                        className="text-sm font-medium text-slate-700 hover:text-purple-600 transition"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-slate-700 hover:text-purple-600 transition"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

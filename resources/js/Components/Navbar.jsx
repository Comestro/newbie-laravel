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
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="shrink-0 flex items-center">
                            <Link href="/" className="flex items-center gap-2">
                                <img src="/logo.png" alt="Newbie Service" className="h-10 w-auto" />
                                <span className="hidden md:block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                    Newbie
                                </span>
                            </Link>
                        </div>
                        <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <Link
                                href="/catalog"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition duration-150 ease-in-out"
                            >
                                Shop
                            </Link>
                            <Link
                                href="/catalog"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition duration-150 ease-in-out"
                            >
                                Categories
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative hidden md:block flex-1 max-w-lg mx-8">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-100 dark:border-gray-800 rounded-lg leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                placeholder="Search 'milk'"
                            />
                        </form>

                        {/* Cart */}
                        <button
                            type="button"
                            onClick={openCart}
                            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            aria-label="Open cart"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {/* Auth */}
                        {auth?.user ? (
                            <div className="flex items-center gap-3">
                                {auth.user.is_admin ? (
                                    <Link
                                        href="/admin/dashboard"
                                        className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300"
                                    >
                                        Admin
                                    </Link>
                                ) : auth.user.is_retailer ? (
                                    <Link
                                        href="/retailer/dashboard"
                                        className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    >
                                        Retailer
                                    </Link>
                                ) : null}
                                <Link
                                    href="/dashboard"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
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

import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useCart } from '../Context/CartContext';

export default function MobileBottomNav() {
    const { url, props } = usePage();
    const { auth } = props;
    const { itemCount, openCart } = useCart();

    const isCurrent = (path) => (path === '/' ? url === '/' : url.startsWith(path));

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center w-full h-full ${
                        isCurrent('/') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                    }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span className="text-xs mt-1 font-medium">Home</span>
                </Link>

                <Link
                    href="/catalog"
                    className={`flex flex-col items-center justify-center w-full h-full ${
                        isCurrent('/catalog') || isCurrent('/product') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                    }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                    <span className="text-xs mt-1 font-medium">Categories</span>
                </Link>

                <button
                    type="button"
                    onClick={openCart}
                    className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                    <div className="relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {itemCount}
                            </span>
                        )}
                    </div>
                    <span className="text-xs mt-1 font-medium">Cart</span>
                </button>

                <Link
                    href={auth?.user ? '/dashboard' : '/login'}
                    className={`flex flex-col items-center justify-center w-full h-full ${
                        isCurrent('/dashboard') || isCurrent('/profile') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                    }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span className="text-xs mt-1 font-medium">Account</span>
                </Link>
            </div>
        </div>
    );
}

import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Package } from 'lucide-react';

export default function MobileBottomNav() {
    const { url, props } = usePage();
    const { auth } = props;
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY || 0;
            if (currentY <= 20) {
                setIsVisible(true);
                lastScrollY.current = currentY;
                return;
            }

            const delta = currentY - lastScrollY.current;
            if (Math.abs(delta) < 8) return;

            if (delta > 0) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            lastScrollY.current = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isCurrent = (path) => (path === '/' ? url === '/' : url.startsWith(path));
    const ordersHref = auth?.user
        ? route(auth.user.is_retailer ? 'retailer.orders' : 'myorders')
        : route('login');
    const isOrdersActive = isCurrent('/my-orders') || isCurrent('/retailer/orders');

    return (
        <div
            className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-50 shadow-xs transition-all duration-300 ease-in-out ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
            }`}
        >
            <div className="flex justify-around items-center h-16">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center w-full h-full ${
                        isCurrent('/') ? 'text-purple-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span className="text-[11px] mt-1">Home</span>
                </Link>

                <Link
                    href="/catalog"
                    className={`flex flex-col items-center justify-center w-full h-full ${
                        isCurrent('/catalog') || isCurrent('/product') ? 'text-purple-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                    <span className="text-[11px] mt-1">Categories</span>
                </Link>

                <Link
                    href={ordersHref}
                    className={`flex flex-col items-center justify-center w-full h-full ${
                        isOrdersActive ? 'text-purple-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Package className="w-5 h-5" />
                    <span className="text-[11px] mt-1">Orders</span>
                </Link>

                <Link
                    href={auth?.user ? (auth.user.is_retailer ? '/retailer/profile' : '/profile') : '/login'}
                    className={`flex flex-col items-center justify-center w-full h-full ${
                        isCurrent('/profile') || isCurrent('/retailer/profile') ? 'text-purple-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span className="text-[11px] mt-1">Account</span>
                </Link>
            </div>
        </div>
    );
}

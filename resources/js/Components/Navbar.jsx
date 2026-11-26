import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useCart } from '../Context/CartContext';
import {
    ChevronDown,
    Heart,
    LayoutDashboard,
    Layers,
    LogOut,
    MapPin,
    Package,
    ShieldCheck,
    ShoppingBag,
    User,
    Users,
} from 'lucide-react';

export default function Navbar() {
    const { auth, wishlistProductIds = [] } = usePage().props;
    const { url } = usePage();
    const { itemCount, openCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const wishlistCount = Array.isArray(wishlistProductIds) ? wishlistProductIds.length : 0;
    const user = auth?.user;

    useEffect(() => {
        setMenuOpen(false);
    }, [url]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/catalog', { search: searchQuery.trim() });
        }
    };

    const handleLogout = () => {
        setMenuOpen(false);
        router.post('/logout');
    };

    const getMenuLinks = () => {
        if (!user) return [];

        if (user.is_admin) {
            return [
                { label: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
                { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
                { label: 'Products', href: '/admin/products', icon: Package },
                { label: 'Categories', href: '/admin/categories', icon: Layers },
                { label: 'Customers', href: '/admin/customers', icon: Users },
                { label: 'Retailer KYC', href: '/admin/review-retailer', icon: ShieldCheck },
            ];
        }

        if (user.is_retailer) {
            return [
                { label: 'Wholesale Orders', href: '/retailer/orders', icon: Package },
                { label: 'Delivery Addresses', href: '/retailer/addresses', icon: MapPin },
                { label: 'KYC & Verification', href: '/retailer/kyc', icon: ShieldCheck },
                { label: 'Wishlist', href: '/retailer/wishlist', icon: Heart },
                { label: 'Profile Settings', href: '/retailer/profile', icon: User },
            ];
        }

        return [
            { label: 'My Orders', href: '/my-orders', icon: ShoppingBag },
            { label: 'Wishlist', href: '/wishlist', icon: Heart },
            { label: 'Saved Addresses', href: '/my-addresses', icon: MapPin },
            { label: 'Apply for Retailer', href: '/apply-to-retailer', icon: ShieldCheck },
            { label: 'Profile Settings', href: '/profile', icon: User },
        ];
    };

    const menuLinks = getMenuLinks();

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

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative hidden md:block w-72 lg:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
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

                        {/* Wishlist */}
                        <Link
                            href={user?.is_retailer ? '/retailer/wishlist' : '/wishlist'}
                            className="relative p-2 text-slate-600 hover:text-rose-500 hover:bg-slate-50 rounded-lg transition"
                            aria-label="Wishlist"
                        >
                            <Heart className="w-5 h-5" />
                            {wishlistCount > 0 && (
                                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <button
                            type="button"
                            onClick={openCart}
                            className="relative p-2 text-slate-600 hover:text-purple-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                            aria-label="Open cart"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {/* Auth / Profile Dropdown */}
                        {user ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen((prev) => !prev)}
                                    className="flex items-center gap-1.5 p-1.5 pr-2 rounded-full border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                                    aria-label="Account menu"
                                >
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="w-7 h-7 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                            {user.name?.charAt(0)?.toUpperCase() || <User className="w-3.5 h-3.5" />}
                                        </div>
                                    )}
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-100 shadow-lg py-2 z-50">
                                        {/* User Info Header */}
                                        <div className="px-4 py-2.5 border-b border-slate-100">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                                                {user.is_retailer && (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                                        user.is_kyc_approved
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                        {user.is_kyc_approved ? 'Verified' : 'KYC Req.'}
                                                    </span>
                                                )}
                                                {user.is_admin && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 shrink-0">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                                        </div>

                                        {/* Menu Links */}
                                        <div className="py-1.5 px-1.5 space-y-0.5">
                                            {menuLinks.map((item) => {
                                                const Icon = item.icon;
                                                const active = url === item.href || (item.href !== '/admin/dashboard' && url.startsWith(item.href));
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setMenuOpen(false)}
                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                                                            active
                                                                ? 'bg-purple-50 text-purple-700'
                                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        <Icon className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                                                        <span>{item.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        {/* Logout */}
                                        <div className="pt-1.5 px-1.5 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
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

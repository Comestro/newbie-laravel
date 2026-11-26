import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { CartProvider } from '../Context/CartContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import CartDrawer from '../Components/CartDrawer';
import BottomCartButton from '../Components/BottomCartButton';
import MobileBottomNav from '../Components/MobileBottomNav';
import FlashMessages from '../Components/FlashMessages';

const getCategoryEmoji = (name) => {
    const c = (name || '').toUpperCase();
    if (c.includes('MILK') || c.includes('DAIRY')) return '🥛';
    if (c.includes('WATER')) return '💧';
    if (c.includes('BEVERAGE') || c.includes('JUICE') || c.includes('DRINK')) return '🍹';
    return '📦';
};

export default function ShopLayout({ children }) {
    const { url, props } = usePage();
    const categories = props.categories || [];

    const queryString = url.includes('?') ? url.split('?')[1] : '';
    const activeCategory = new URLSearchParams(queryString).get('category');
    const isCatalog = url.startsWith('/catalog');

    return (
        <CartProvider>
            <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 font-sans">
                <FlashMessages />
                <Navbar />

                {/* Category Navigation Bar */}
                {categories.length > 0 && (
                    <div className="bg-white border-b border-slate-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
                            <Link
                                href="/catalog"
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                                    isCatalog && !activeCategory
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <span>🛒</span>
                                <span>All Products</span>
                            </Link>

                            {categories.map((cat) => {
                                const slug = cat.slug || cat.name?.toLowerCase();
                                const isSelected =
                                    activeCategory?.toLowerCase() === slug?.toLowerCase() ||
                                    activeCategory?.toLowerCase() === cat.name?.toLowerCase();

                                return (
                                    <Link
                                        key={cat.id || slug}
                                        href={`/catalog?category=${slug}`}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                                            isSelected
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                                : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                    >
                                        <span>{cat.icon || getCategoryEmoji(cat.name)}</span>
                                        <span>{cat.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                <CartDrawer />
                <BottomCartButton />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
                <MobileBottomNav />
            </div>
        </CartProvider>
    );
}

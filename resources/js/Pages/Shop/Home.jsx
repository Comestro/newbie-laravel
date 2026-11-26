import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import ProductCard from '../../Components/ProductCard';

export default function Home({ groupedProducts = {}, categories = [] }) {
    const getCategoryDisplayTitle = (cat) => {
        const found = categories.find(
            (c) => c.name?.toLowerCase() === cat?.toLowerCase() || c.slug?.toLowerCase() === cat?.toLowerCase()
        );
        if (found) return found.name;
        const c = (cat || '').toUpperCase();
        if (c === 'MILK') return 'Milk & Dairy';
        if (c === 'WATER') return 'Water & Hydration';
        if (c === 'BEVERAGES') return 'Beverages & Soft Drinks';
        return cat;
    };

    return (
        <ShopLayout>
            <Head title="Premium Grocery Delivery" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
                {/* Categories Row */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Shop by Category
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {categories.length > 0 ? (
                            categories.map((cat) => {
                                const slug = cat.slug || cat.name?.toLowerCase();
                                return (
                                    <Link
                                        key={cat.id || slug}
                                        href={`/catalog?category=${slug}`}
                                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition shadow-xs group"
                                    >
                                        <span className="text-3xl mb-1.5">{cat.icon || '📦'}</span>
                                        <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700 text-center truncate max-w-full">
                                            {cat.name}
                                        </span>
                                    </Link>
                                );
                            })
                        ) : (
                            <>
                                <Link
                                    href="/catalog?category=milk"
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition shadow-xs group"
                                >
                                    <span className="text-3xl mb-1.5">🥛</span>
                                    <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">Milk</span>
                                </Link>
                                <Link
                                    href="/catalog?category=water"
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition shadow-xs group"
                                >
                                    <span className="text-3xl mb-1.5">💧</span>
                                    <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">Water</span>
                                </Link>
                                <Link
                                    href="/catalog?category=beverages"
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition shadow-xs group"
                                >
                                    <span className="text-3xl mb-1.5">🍹</span>
                                    <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">Beverages</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Promo Banners */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Banner 1 */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white flex flex-col justify-between h-36 shadow-xs">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                                Farm Fresh
                            </span>
                            <h3 className="font-bold text-base mt-1.5">Fresh Milk Delivered</h3>
                            <p className="text-blue-100 text-xs mt-0.5">Pure dairy at your doorstep</p>
                        </div>
                        <Link
                            href="/catalog?category=milk"
                            className="inline-block px-3.5 py-1.5 bg-white text-blue-700 text-xs font-bold rounded-lg w-fit hover:bg-blue-50 transition"
                        >
                            Order Now &rarr;
                        </Link>
                    </div>

                    {/* Banner 2 */}
                    <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-5 text-white flex flex-col justify-between h-36 shadow-xs">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                                Pure Water
                            </span>
                            <h3 className="font-bold text-base mt-1.5">Natural Mineral Water</h3>
                            <p className="text-cyan-100 text-xs mt-0.5">Safe, pure drinking water</p>
                        </div>
                        <Link
                            href="/catalog?category=water"
                            className="inline-block px-3.5 py-1.5 bg-white text-teal-700 text-xs font-bold rounded-lg w-fit hover:bg-cyan-50 transition"
                        >
                            Order Now &rarr;
                        </Link>
                    </div>

                    {/* Banner 3 */}
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white flex flex-col justify-between h-36 shadow-xs">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                                Daily Sips
                            </span>
                            <h3 className="font-bold text-base mt-1.5">Refreshing Drinks</h3>
                            <p className="text-amber-100 text-xs mt-0.5">Juices, sodas & beverages</p>
                        </div>
                        <Link
                            href="/catalog?category=beverages"
                            className="inline-block px-3.5 py-1.5 bg-white text-orange-700 text-xs font-bold rounded-lg w-fit hover:bg-orange-50 transition"
                        >
                            Order Now &rarr;
                        </Link>
                    </div>
                </div>

                {/* Grouped Product Rows */}
                <div className="space-y-10">
                    {Object.entries(groupedProducts).map(([category, products]) => (
                        <div key={category} id={`category-${category.toLowerCase()}`}>
                            <div className="flex items-center justify-between mb-3.5">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span>{getCategoryDisplayTitle(category)}</span>
                                </h2>
                                <Link
                                    href={`/catalog?category=${category.toLowerCase()}`}
                                    className="text-purple-600 hover:text-purple-700 font-bold text-xs uppercase tracking-wider transition"
                                >
                                    See all &rarr;
                                </Link>
                            </div>

                            {/* Horizontal Scroll */}
                            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 space-x-3.5 scrollbar-none">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        categoryName={category}
                                        className="min-w-48 w-[195px] shrink-0"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ShopLayout>
    );
}

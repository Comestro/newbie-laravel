import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import ProductCard from '../../Components/ProductCard';
import CategoryIcon from '../../Components/CategoryIcon';

export default function Home({ groupedProducts = {}, categories = [] }) {
    const getCategorySlug = (cat, productsList = []) => {
        const firstSlug = productsList[0]?.category?.slug;
        if (firstSlug) return firstSlug;
        const found = categories.find(
            (c) => c.name?.toLowerCase() === cat?.toLowerCase() || c.slug?.toLowerCase() === cat?.toLowerCase()
        );
        return found?.slug || encodeURIComponent(cat.toLowerCase());
    };

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

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-7 sm:space-y-10">
                {/* Categories Row */}
                <div>
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mb-2.5 sm:mb-3">
                        Shop by Category
                    </h2>
                    <div className="flex gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none pb-1">
                        {categories.length > 0 ? (
                            categories.map((cat) => {
                                const slug = cat.slug || cat.name?.toLowerCase();
                                return (
                                    <Link
                                        key={cat.id || slug}
                                        href={`/catalog?category=${slug}`}
                                        className="shrink-0 w-24 sm:w-36 md:w-44 flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition shadow-xs group"
                                    >
                                        <CategoryIcon icon={cat.icon} name={cat.name} className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5" textClassName="text-2xl sm:text-3xl mb-1.5" />
                                        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 group-hover:text-purple-700 text-center truncate max-w-full">
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
                <div className="flex md:grid md:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x pb-1">
                    {/* Banner 1 */}
                    <div className="shrink-0 w-[82%] sm:w-[58%] md:w-auto snap-start bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-between h-32 sm:h-36 shadow-xs">
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
                    <div className="shrink-0 w-[82%] sm:w-[58%] md:w-auto snap-start bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-between h-32 sm:h-36 shadow-xs">
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
                    <div className="shrink-0 w-[82%] sm:w-[58%] md:w-auto snap-start bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-between h-32 sm:h-36 shadow-xs">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                                Daily Sips
                            </span>
                            <h3 className="font-bold text-base mt-1.5">Refreshing Drinks</h3>
                            <p className="text-amber-100 text-xs mt-0.5">Juices, sodas & beverages</p>
                        </div>
                        <Link
                            href="/catalog?category=lassi-and-beverages"
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
                                    href={`/catalog?category=${getCategorySlug(category, products)}`}
                                    className="text-purple-600 hover:text-purple-700 font-bold text-xs uppercase tracking-wider transition"
                                >
                                    See all &rarr;
                                </Link>
                            </div>

                            {/* Horizontal Scroll */}
                            <div className="flex overflow-x-auto pb-3 -mx-3 px-3 sm:-mx-4 sm:px-4 space-x-2.5 sm:space-x-3.5 scrollbar-none">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        categoryName={category}
                                        className="min-w-[162px] w-[162px] sm:min-w-48 sm:w-[195px] shrink-0"
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

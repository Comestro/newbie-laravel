import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Context/CartContext';
import { Heart } from 'lucide-react';

function ProductCard({ product, categoryName }) {
    const { auth } = usePage().props;
    const isRetailer = Boolean(auth?.user?.is_retailer);
    const getVariantPrice = (v) => (isRetailer && v?.bulk_price !== undefined && v?.bulk_price !== null ? Number(v.bulk_price) : Number(v?.retail_price || 0));

    const { addToCart } = useCart();
    const variants = product.variants || [];
    const firstVariant = variants[0] || {};

    const [selectedVariantId, setSelectedVariantId] = useState(firstVariant.id);
    const [price, setPrice] = useState(getVariantPrice(firstVariant));
    const [unit, setUnit] = useState(firstVariant.unit_size || '');
    const [image, setImage] = useState(firstVariant.image_url || '');

    const handleSelectVariant = (v) => {
        setSelectedVariantId(v.id);
        setPrice(getVariantPrice(v));
        setUnit(v.unit_size);
        if (v.image_url) {
            setImage(v.image_url);
        }
    };

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(`/wishlist/${product.id}/toggle`, {}, { preserveScroll: true });
    };

    const getEmojiPlaceholder = (cat) => {
        const c = (cat || '').toUpperCase();
        if (c === 'MILK') return '🥛';
        if (c === 'WATER') return '💧';
        return '🍹';
    };

    return (
        <div className="min-w-48 w-[190px] bg-white rounded-2xl p-3 border border-slate-100 hover:border-purple-200 transition-all duration-200 relative group shrink-0 shadow-xs flex flex-col justify-between">
            {/* Discount Badge */}
            <div className="absolute top-2.5 left-2.5 z-10">
                <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                    13% OFF
                </span>
            </div>

            {/* Wishlist Button */}
            <button
                type="button"
                onClick={toggleWishlist}
                className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition shadow-xs"
            >
                <Heart className="w-3.5 h-3.5" />
            </button>

            <div>
                {/* Image Area */}
                <div className="h-32 w-full flex items-center justify-center mb-2.5 rounded-xl bg-slate-50 overflow-hidden">
                    {image ? (
                        <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <span className="text-4xl filter grayscale opacity-60">
                            {getEmojiPlaceholder(categoryName)}
                        </span>
                    )}
                </div>

                {/* Product Info */}
                <Link
                    href={`/product/${product.slug || product.id}`}
                    className="block group-hover:text-purple-600 transition-colors"
                >
                    <h3 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 min-h-[2.4em]">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-[11px] text-slate-400 mt-0.5">{unit}</p>
            </div>

            {/* Price & Add */}
            <div className="mt-2.5 pt-2 border-t border-slate-50">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-slate-400 line-through block leading-none">
                            ₹{Math.round(Number(price) * 1.2)}
                        </span>
                        <span className="text-sm font-bold text-slate-900 leading-tight">
                            ₹{price}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => addToCart(selectedVariantId, 1)}
                        className="px-3.5 py-1 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-[11px] uppercase transition shadow-xs"
                    >
                        ADD
                    </button>
                </div>

                {/* Variant Selection Mini Pills */}
                {variants.length > 1 && (
                    <div className="flex items-center gap-1 mt-2 overflow-x-auto scrollbar-none py-0.5">
                        {variants.map((v) => (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => handleSelectVariant(v)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap transition cursor-pointer border ${
                                    selectedVariantId === v.id
                                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                }`}
                            >
                                {v.unit_size}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

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

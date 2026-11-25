import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Context/CartContext';
import { Heart, Search } from 'lucide-react';

function CatalogProductCard({ product }) {
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

    const getCategoryEmoji = (cat) => {
        const c = (cat?.name || cat?.value || cat || '').toUpperCase();
        if (c === 'MILK') return '🥛';
        if (c === 'WATER') return '💧';
        return '🍹';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col justify-between hover:border-purple-200 transition-all duration-200 relative group shadow-xs">
            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                    13% OFF
                </span>
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                    10 MINS
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

            {/* Image Area */}
            <div className="h-40 w-full flex items-center justify-center relative bg-slate-50 overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <span className="text-4xl filter grayscale opacity-60 transition duration-300 group-hover:scale-110">
                        {getCategoryEmoji(product.category)}
                    </span>
                )}
            </div>

            {/* Product Info */}
            <div className="p-3.5 flex flex-col flex-1">
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">
                    {product.brand}
                </span>
                <Link
                    href={`/product/${product.slug || product.id}`}
                    className="block group-hover:text-purple-600 transition-colors"
                >
                    <h3 className="text-xs font-bold text-slate-900 leading-snug mb-2 line-clamp-2 min-h-[2.4em]">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto pt-2 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-slate-400 line-through block leading-none">
                                ₹{Math.round(Number(price) * 1.15)}
                            </span>
                            <span className="text-sm font-extrabold text-slate-900">
                                ₹{price}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => addToCart(selectedVariantId, 1)}
                            className="px-3.5 py-1 bg-purple-50/70 border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white font-bold text-[11px] rounded-lg transition uppercase tracking-wide shadow-xs active:scale-95"
                        >
                            Add
                        </button>
                    </div>

                    {variants.length > 1 ? (
                        <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-none py-0.5">
                            {variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() => handleSelectVariant(variant)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap transition border ${
                                        selectedVariantId === variant.id
                                            ? 'bg-purple-50 border-purple-300 text-purple-700'
                                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                    }`}
                                >
                                    {variant.unit_size}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-2 h-5 flex items-center">
                            <span className="text-[10px] font-medium bg-slate-50 border border-slate-100 text-slate-500 px-1.5 py-0.2 rounded">
                                {firstVariant.unit_size}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Catalog({ products, filters = {}, categories = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const currentCategory = filters.category || null;

    const handleSelectCategory = (cat) => {
        router.get('/catalog', {
            category: cat || undefined,
            search: search || undefined,
        }, { preserveScroll: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/catalog', {
            category: currentCategory || undefined,
            search: search || undefined,
        }, { preserveScroll: true });
    };

    const productList = products?.data || (Array.isArray(products) ? products : []);

    return (
        <ShopLayout>
            <Head title="Catalog - Newbie Service" />

            <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 flex">
                {/* Desktop Sidebar */}
                <div className="w-60 bg-white border-r border-slate-100 shrink-0 hidden md:block overflow-y-auto h-[calc(100vh-64px)] sticky top-16 p-4">
                    <button
                        type="button"
                        onClick={() => handleSelectCategory(null)}
                        className={`flex flex-col items-center justify-center w-full aspect-square border rounded-2xl mb-4 transition-all ${
                            !currentCategory
                                ? 'border-purple-500 bg-purple-50/70 text-purple-700'
                                : 'border-slate-100 text-slate-500 hover:border-slate-200'
                        }`}
                    >
                        <span className="text-2xl mb-1">🛒</span>
                        <span className="text-xs font-bold uppercase tracking-wider">All Products</span>
                    </button>

                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 px-1">
                        Select Category
                    </div>

                    <div className="space-y-1">
                        {categories.map((cat) => {
                            const catVal = cat.name || cat.value || '';
                            const catSlug = cat.slug || catVal.toLowerCase();
                            const isSelected =
                                currentCategory?.toLowerCase() === catSlug.toLowerCase() ||
                                currentCategory?.toLowerCase() === catVal.toLowerCase();
                            const emoji = cat.icon || (catVal.toUpperCase() === 'MILK' ? '🥛' : catVal.toUpperCase() === 'WATER' ? '💧' : '🍹');
                            return (
                                <button
                                    key={cat.id || catVal}
                                    type="button"
                                    onClick={() => handleSelectCategory(catSlug)}
                                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold transition ${
                                        isSelected
                                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                    }`}
                                >
                                    <span className="truncate mr-2">{catVal}</span>
                                    <span>{emoji}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    {/* Mobile Category Nav */}
                    <div className="md:hidden mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => handleSelectCategory(null)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                                    !currentCategory
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white border-slate-200 text-slate-600'
                                }`}
                            >
                                All
                            </button>

                            {categories.map((cat) => {
                                const catVal = cat.name || cat.value || '';
                                const catSlug = cat.slug || catVal.toLowerCase();
                                const isSelected =
                                    currentCategory?.toLowerCase() === catSlug.toLowerCase() ||
                                    currentCategory?.toLowerCase() === catVal.toLowerCase();
                                const emoji = cat.icon || (catVal.toUpperCase() === 'MILK' ? '🥛' : catVal.toUpperCase() === 'WATER' ? '💧' : '🍹');
                                return (
                                    <button
                                        key={cat.id || catVal}
                                        type="button"
                                        onClick={() => handleSelectCategory(catSlug)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border flex items-center gap-1.5 transition ${
                                            isSelected
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'bg-white border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <span>{emoji}</span>
                                        <span>{catVal}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {filters.search ? (
                                    `Search results for "${filters.search}"`
                                ) : currentCategory ? (
                                    currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)
                                ) : (
                                    'All Products'
                                )}
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Showing {productList.length} items
                            </p>
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200/80 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </form>
                    </div>

                    {/* Products Grid */}
                    {productList.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                            <p className="text-base font-bold text-slate-800">No products found</p>
                            <p className="text-xs text-slate-400 mt-1">Try selecting a different category or clearing your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                            {productList.map((product) => (
                                <CatalogProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {products?.links && products.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-1">
                            {products.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
                                        link.active
                                            ? 'bg-purple-600 text-white border-purple-600'
                                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}

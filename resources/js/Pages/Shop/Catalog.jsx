import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Context/CartContext';
import { Heart, Search } from 'lucide-react';

function CatalogProductCard({ product }) {
    const { addToCart } = useCart();
    const variants = product.variants || [];
    const firstVariant = variants[0] || {};

    const [selectedVariantId, setSelectedVariantId] = useState(firstVariant.id);
    const [price, setPrice] = useState(firstVariant.retail_price || 0);
    const [unit, setUnit] = useState(firstVariant.unit_size || '');
    const [image, setImage] = useState(firstVariant.image_url || '');

    const handleSelectVariant = (v) => {
        setSelectedVariantId(v.id);
        setPrice(v.retail_price);
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
        const c = (cat?.value || cat || '').toUpperCase();
        if (c === 'MILK') return '🥛';
        if (c === 'WATER') return '💧';
        return '🍹';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 relative group">
            {/* Top Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    13% OFF
                </span>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    10 MINS
                </span>
            </div>

            {/* Wishlist Button */}
            <button
                type="button"
                onClick={toggleWishlist}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white text-gray-400 hover:text-red-500 transition shadow-xs"
            >
                <Heart className="w-4 h-4" />
            </button>

            {/* Image Area */}
            <div className="h-44 w-full flex items-center justify-center relative bg-gray-50 dark:bg-gray-700/40 overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <span className="text-5xl filter grayscale opacity-50 transition duration-300 group-hover:scale-110 group-hover:filter-none group-hover:opacity-100">
                        {getCategoryEmoji(product.category)}
                    </span>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-1">
                <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">
                    {product.brand}
                </div>
                <Link
                    href={`/product/${product.slug || product.id}`}
                    className="block group-hover:text-purple-600 transition-colors"
                >
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2 min-h-[2.5em]">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto">
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <div>
                            <span className="text-[10px] text-gray-400 line-through block">
                                ₹{Math.round(Number(price) * 1.15)}
                            </span>
                            <span className="text-base font-extrabold text-gray-900 dark:text-white">
                                ₹{price}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => addToCart(selectedVariantId, 1)}
                            className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition uppercase tracking-wide shadow-sm hover:shadow active:scale-95"
                        >
                            Add
                        </button>
                    </div>

                    {variants.length > 1 ? (
                        <div className="flex gap-1 mt-3 overflow-x-auto scrollbar-hide py-1">
                            {variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() => handleSelectVariant(variant)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition ${
                                        selectedVariantId === variant.id
                                            ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {variant.unit_size}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-3 h-6 flex items-center">
                            <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded">
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

            <div className="min-h-[calc(100vh-64px)] bg-gray-50/50 dark:bg-gray-900 flex">
                {/* Desktop Sidebar */}
                <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-800 shrink-0 hidden md:block overflow-y-auto h-[calc(100vh-64px)] sticky top-16">
                    <div className="p-6">
                        <button
                            type="button"
                            onClick={() => handleSelectCategory(null)}
                            className={`flex flex-col items-center justify-center w-full aspect-square border-2 rounded-xl mb-4 transition-all ${
                                !currentCategory
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                            }`}
                        >
                            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wide">All Products</span>
                        </button>

                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4 text-center">
                            Select Category
                        </div>

                        <div className="space-y-4">
                            {categories.map((cat) => {
                                const isSelected = currentCategory?.toLowerCase() === cat.value.toLowerCase();
                                const emoji = cat.value === 'MILK' ? '🥛' : cat.value === 'WATER' ? '💧' : '🍹';
                                return (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => handleSelectCategory(cat.value.toLowerCase())}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-colors ${
                                            isSelected
                                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        <span className="font-bold text-sm">
                                            {cat.value.charAt(0).toUpperCase() + cat.value.slice(1).toLowerCase()}
                                        </span>
                                        <span className="text-lg">{emoji}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-8">
                    {/* Mobile Category Nav */}
                    <div className="md:hidden mb-6 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => handleSelectCategory(null)}
                                className="flex flex-col items-center min-w-[60px] group"
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 transition-colors border ${
                                        !currentCategory
                                            ? 'bg-purple-50 border-purple-200 text-purple-600'
                                            : 'bg-white border-gray-100 text-gray-400'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"></path>
                                    </svg>
                                </div>
                                <span className={`text-[10px] font-bold ${!currentCategory ? 'text-purple-700' : 'text-gray-500'}`}>
                                    All
                                </span>
                            </button>

                            {categories.map((cat) => {
                                const isSelected = currentCategory?.toLowerCase() === cat.value.toLowerCase();
                                const emoji = cat.value === 'MILK' ? '🥛' : cat.value === 'WATER' ? '💧' : '🍹';
                                return (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => handleSelectCategory(cat.value.toLowerCase())}
                                        className="flex flex-col items-center min-w-[60px] group"
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 transition-colors border ${
                                                isSelected
                                                    ? 'bg-purple-50 border-purple-200'
                                                    : 'bg-white border-gray-100 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-xl">{emoji}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold ${isSelected ? 'text-purple-700' : 'text-gray-500'}`}>
                                            {cat.value.charAt(0).toUpperCase() + cat.value.slice(1).toLowerCase()}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                {filters.search ? (
                                    <span className="flex items-center gap-2">
                                        Search results for "{filters.search}"
                                    </span>
                                ) : currentCategory ? (
                                    currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)
                                ) : (
                                    'All Products'
                                )}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing {productList.length} products
                            </p>
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        </form>
                    </div>

                    {/* Products Grid */}
                    {productList.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">No products found</p>
                            <p className="text-sm text-gray-400 mt-1">Try selecting a different category or clearing search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {productList.map((product) => (
                                <CatalogProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination if present */}
                    {products?.links && products.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-1">
                            {products.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                                        link.active
                                            ? 'bg-purple-600 text-white border-purple-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
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

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Context/CartContext';
import { Heart } from 'lucide-react';

function ProductCard({ product, categoryName }) {
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

    const getEmojiPlaceholder = (cat) => {
        const c = (cat || '').toUpperCase();
        if (c === 'MILK') return '🥛';
        if (c === 'WATER') return '💧';
        return '🍹';
    };

    return (
        <div className="min-w-50 w-[200px] bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-50 dark:border-gray-700 relative group shrink-0">
            {/* Discount Badge */}
            <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-xl z-10 shadow-sm">
                13% OFF
            </div>

            <div className="flex flex-col h-full">
                {/* Image Area */}
                <div className="group h-32 w-full flex items-center justify-center mb-3 relative rounded-lg bg-gray-50 dark:bg-gray-700/50 overflow-hidden">
                    {/* Wishlist Button */}
                    <button
                        type="button"
                        onClick={toggleWishlist}
                        className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition shadow-xs"
                    >
                        <Heart className="w-4 h-4" />
                    </button>

                    {/* Image / Placeholder */}
                    {image ? (
                        <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 transform group-hover:scale-105"
                        />
                    ) : (
                        <span className="text-4xl filter grayscale opacity-50">
                            {getEmojiPlaceholder(categoryName)}
                        </span>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-grow">
                    <Link
                        href={`/product/${product.slug || product.id}`}
                        className="block group-hover:text-purple-600 transition-colors"
                    >
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1 line-clamp-2 h-10">
                            {product.name}
                        </h3>
                    </Link>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>{unit}</span>
                    </div>

                    {/* Variants / Price */}
                    <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 line-through font-medium">
                                    ₹{Math.round(Number(price) * 1.2)}
                                </span>
                                <span className="text-base font-bold text-gray-900 dark:text-white">
                                    ₹{price}
                                </span>
                            </div>

                            {/* Add Button */}
                            <button
                                type="button"
                                onClick={() => addToCart(selectedVariantId, 1)}
                                className="px-5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase hover:bg-purple-50 dark:hover:bg-purple-900/30 transition shadow-sm bg-white dark:bg-gray-800"
                            >
                                ADD
                            </button>
                        </div>

                        {/* Variant Selection (Mini Pills) */}
                        {variants.length > 1 && (
                            <div className="flex items-center space-x-1 mt-3 overflow-x-auto scrollbar-hide">
                                {variants.map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => handleSelectVariant(v)}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap transition cursor-pointer ${
                                            selectedVariantId === v.id
                                                ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <span>{v.unit_size}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home({ groupedProducts = {} }) {
    const getCategoryDisplayTitle = (cat) => {
        const c = (cat || '').toUpperCase();
        if (c === 'MILK') return 'Milk & Dairy';
        if (c === 'WATER') return 'Water';
        return 'Beverages & Water';
    };

    return (
        <ShopLayout>
            <Head title="Premium Grocery Delivery" />

            <div>
                {/* Hero Section */}

                {/* Categories */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Shop by category</h2>
                    <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                        {/* Milk */}
                        <Link href="/catalog?category=milk" className="flex flex-col items-center group min-w-20">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 transition-colors bg-gray-100 group-hover:bg-purple-50 dark:bg-gray-800">
                                <span className="text-3xl">🥛</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-purple-700">Milk</span>
                        </Link>

                        {/* Water */}
                        <Link href="/catalog?category=water" className="flex flex-col items-center group min-w-20">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 transition-colors bg-gray-100 group-hover:bg-purple-50 dark:bg-gray-800">
                                <span className="text-3xl">💧</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-purple-700">Water</span>
                        </Link>

                        {/* Beverages */}
                        <Link href="/catalog?category=beverages" className="flex flex-col items-center group min-w-20">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 transition-colors bg-gray-100 group-hover:bg-purple-50 dark:bg-gray-800">
                                <span className="text-3xl">☕</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-purple-700">Beverages</span>
                        </Link>
                    </div>
                </div>

                {/* Promo Banners */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Banner 1 */}
                        <div className="bg-[#3B82F6] rounded-xl p-6 text-white relative overflow-hidden h-40 flex flex-col justify-center">
                            <h3 className="font-bold text-lg mb-1 relative z-10">Fresh Milk Delivered</h3>
                            <p className="text-blue-100 text-xs mb-4 relative z-10">Farm fresh goodness everyday</p>
                            <Link
                                href="/catalog?category=milk"
                                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-lg w-fit transition relative z-10 backdrop-blur-sm"
                            >
                                Order Now
                            </Link>
                        </div>

                        {/* Banner 2 */}
                        <div className="bg-[#06B6D4] rounded-xl p-6 text-white relative overflow-hidden h-40 flex flex-col justify-center">
                            <h3 className="font-bold text-lg mb-1 relative z-10">Pure Natural Water</h3>
                            <p className="text-cyan-100 text-xs mb-4 relative z-10">Stay hydrated with us</p>
                            <Link
                                href="/catalog?category=water"
                                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-lg w-fit transition relative z-10 backdrop-blur-sm"
                            >
                                Order Now
                            </Link>
                        </div>

                        {/* Banner 3 */}
                        <div className="bg-[#F97316] rounded-xl p-6 text-white relative overflow-hidden h-40 flex flex-col justify-center">
                            <h3 className="font-bold text-lg mb-1 relative z-10">Refreshing Beverages</h3>
                            <p className="text-orange-100 text-xs mb-4 relative z-10">Juices, sodas & energy drinks</p>
                            <Link
                                href="/catalog?category=beverages"
                                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-lg w-fit transition relative z-10 backdrop-blur-sm"
                            >
                                Order Now
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Grouped Sections */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                    {Object.entries(groupedProducts).map(([category, products]) => (
                        <div key={category} id={`category-${category.toLowerCase()}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                    {getCategoryDisplayTitle(category)}
                                </h2>
                                <Link
                                    href={`/catalog?category=${category.toLowerCase()}`}
                                    className="text-purple-600 font-bold text-xs uppercase tracking-wide hover:text-purple-700"
                                >
                                    see all
                                </Link>
                            </div>

                            {/* Horizontal Scroll Container */}
                            <div className="flex overflow-x-auto pb-8 -mx-4 px-4 space-x-4 scrollbar-hide">
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

                {/* Bottom Spacer for Mobile Nav */}
                <div className="h-20 md:hidden"></div>
            </div>
        </ShopLayout>
    );
}

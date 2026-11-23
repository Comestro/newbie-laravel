import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Context/CartContext';

export default function ProductShow({ product }) {
    const { addToCart } = useCart();
    const variants = product.variants || [];
    const firstVariant = variants[0] || {};

    const [selectedVariantId, setSelectedVariantId] = useState(firstVariant.id);
    const selectedVariant = variants.find((v) => v.id === selectedVariantId) || firstVariant;

    const price = Number(selectedVariant.retail_price || 0);

    const getCategoryEmoji = (cat) => {
        const c = (cat?.value || cat || '').toUpperCase();
        if (c === 'MILK') return '🥛';
        if (c === 'WATER') return '💧';
        return '🍹';
    };

    return (
        <ShopLayout>
            <Head title={`${product.name} - Newbie Service`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                    {/* Image Gallery */}
                    <div className="product-image-gallery flex flex-col-reverse lg:flex-row gap-4">
                        {/* Thumbnails */}
                        <div className="hidden lg:flex flex-col gap-4 w-20">
                            {variants.map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => setSelectedVariantId(v.id)}
                                    className={`w-full aspect-square rounded-lg border-2 p-1 overflow-hidden flex items-center justify-center transition ${
                                        selectedVariantId === v.id
                                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                    }`}
                                >
                                    {v.image_url ? (
                                        <img src={v.image_url} className="w-full h-full object-cover rounded-md" alt="" />
                                    ) : (
                                        <span className="text-xl">{getCategoryEmoji(product.category)}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="w-full aspect-square rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 flex items-center justify-center relative overflow-hidden shadow-sm">
                            {selectedVariant?.image_url ? (
                                <img
                                    src={selectedVariant.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-9xl filter drop-shadow-lg opacity-80 animate-pulse-slow">
                                    {getCategoryEmoji(product.category)}
                                </span>
                            )}

                            <div className="absolute top-4 left-4">
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                    In Stock
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            {product.name}
                        </h1>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <div className="flex items-baseline gap-4">
                                <p className="text-3xl text-gray-900 dark:text-white font-bold">
                                    ₹{price.toLocaleString()}
                                </p>
                                <p className="text-lg text-gray-500 line-through">
                                    ₹{Math.round(price * 1.15).toLocaleString()}
                                </p>
                                <span className="text-green-600 font-bold text-sm bg-green-100 dark:bg-green-950/40 px-2 py-0.5 rounded">
                                    15% OFF
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 font-medium">Inclusive of all taxes</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 dark:text-gray-300 space-y-6">
                                <p>{product.description}</p>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Brand:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {product.brand}
                                </span>
                            </div>

                            <div className="mt-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Available Sizes</h3>
                                </div>

                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                                    {variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            type="button"
                                            onClick={() => setSelectedVariantId(variant.id)}
                                            className={`border rounded-lg py-3 px-3 flex items-center justify-center text-sm font-medium uppercase sm:flex-1 cursor-pointer focus:outline-none transition-all ${
                                                selectedVariantId === variant.id
                                                    ? 'ring-2 ring-purple-600 border-transparent bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <span>{variant.unit_size}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-10 flex sm:flex-col1">
                                <button
                                    type="button"
                                    onClick={() => addToCart(selectedVariantId, 1)}
                                    className="w-full bg-[#A855F7] border border-transparent rounded-xl py-4 flex items-center justify-center text-base font-bold text-white hover:bg-[#9333EA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg shadow-purple-200 dark:shadow-none transition transform active:scale-[0.99]"
                                >
                                    Add to Cart - ₹{price.toLocaleString()}
                                </button>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>Authentic Products</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>Fast Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}

import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Context/CartContext';
import { CheckCircle2, Clock } from 'lucide-react';

export default function ProductShow({ product }) {
    const { addToCart } = useCart();
    const variants = product.variants || [];
    const firstVariant = variants[0] || {};

    const [selectedVariantId, setSelectedVariantId] = useState(firstVariant.id);
    const selectedVariant = variants.find((v) => v.id === selectedVariantId) || firstVariant;

    const price = Number(selectedVariant.retail_price || 0);

    const getCategoryEmoji = (cat) => {
        const c = (cat?.value || cat || '').toUpperCase();
        if (c.includes('MILK') || c.includes('DAIRY')) return '🥛';
        if (c.includes('WATER')) return '💧';
        if (c.includes('BEVERAGE') || c.includes('JUICE') || c.includes('DRINK')) return '🍹';
        if (c.includes('BAKER') || c.includes('BREAD')) return '🥖';
        if (c.includes('FRUIT') || c.includes('APPLE')) return '🍎';
        if (c.includes('VEG')) return '🥦';
        if (c.includes('SNACK')) return '🍪';
        return '📦';
    };

    return (
        <ShopLayout>
            <Head title={`${product.name} - Newbie Service`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 items-start">
                    {/* Image Gallery */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        {/* Thumbnails */}
                        {variants.length > 1 && (
                            <div className="flex sm:flex-col gap-2.5 sm:w-16 overflow-x-auto">
                                {variants.map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => setSelectedVariantId(v.id)}
                                        className={`w-14 sm:w-full aspect-square rounded-xl border p-1 overflow-hidden flex items-center justify-center transition shrink-0 ${
                                            selectedVariantId === v.id
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-slate-100 bg-white hover:border-slate-200'
                                        }`}
                                    >
                                        {v.image_url ? (
                                            <img src={v.image_url} className="w-full h-full object-cover rounded-lg" alt="" />
                                        ) : (
                                            <span className="text-base">{getCategoryEmoji(product.category)}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Image */}
                        <div className="flex-1 aspect-square rounded-2xl bg-white border border-slate-100 flex items-center justify-center relative overflow-hidden shadow-xs">
                            {selectedVariant?.image_url ? (
                                <img
                                    src={selectedVariant.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-8xl filter opacity-80">
                                    {getCategoryEmoji(product.category)}
                                </span>
                            )}

                            <div className="absolute top-3.5 left-3.5">
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                                    In Stock
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="mt-8 lg:mt-0 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 mb-2">
                            {product.brand}
                        </span>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {product.name}
                        </h1>

                        <div className="mt-3 flex items-baseline gap-3">
                            <p className="text-2xl font-black text-slate-900">
                                ₹{price.toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-400 line-through">
                                ₹{Math.round(price * 1.15).toLocaleString()}
                            </p>
                            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md">
                                15% OFF
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Inclusive of all taxes</p>

                        {product.description && (
                            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                                <p>{product.description}</p>
                            </div>
                        )}

                        {/* Available Sizes */}
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                                Available Sizes
                            </h3>

                            <div className="grid grid-cols-3 gap-2">
                                {variants.map((variant) => (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        onClick={() => setSelectedVariantId(variant.id)}
                                        className={`border rounded-xl py-2 px-3 flex items-center justify-center text-xs font-semibold uppercase transition ${
                                            selectedVariantId === variant.id
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-slate-200/80 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>{variant.unit_size}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => addToCart(selectedVariantId, 1)}
                                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm transition shadow-xs"
                            >
                                Add to Cart - ₹{price.toLocaleString()}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Authentic Products</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span>Fast Delivery (30 mins)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}

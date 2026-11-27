import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useCart } from '../Context/CartContext';
import { Heart } from 'lucide-react';

export default function ProductCard({ product, className = '', categoryName = '' }) {
    if (!product || !product.id || !product.variants?.length) return null;

    const { auth, wishlistProductIds = [] } = usePage().props;
    const isWishlisted = Array.isArray(wishlistProductIds) ? wishlistProductIds.includes(product.id) : false;
    const isRetailer = Boolean(auth?.user?.is_retailer);
    const getVariantPrice = (v) => (
        isRetailer && v?.bulk_price !== undefined && v?.bulk_price !== null
            ? Number(v.bulk_price)
            : Number(v?.retail_price || 0)
    );

    const { addToCart } = useCart();
    const variants = product.variants || [];
    const firstVariant = variants.find((v) => v.is_default) || variants[0] || {};

    const [selectedVariantId, setSelectedVariantId] = useState(firstVariant.id);
    const [selectedVariant, setSelectedVariant] = useState(firstVariant);
    const [price, setPrice] = useState(getVariantPrice(firstVariant));
    const [unit, setUnit] = useState(firstVariant.unit_size || '');
    const [image, setImage] = useState(firstVariant.image_url || '');

    const handleSelectVariant = (v) => {
        setSelectedVariantId(v.id);
        setSelectedVariant(v);
        setPrice(getVariantPrice(v));
        setUnit(v.unit_size);
        if (v.image_url) {
            setImage(v.image_url);
        }
    };

    const mrp = selectedVariant?.mrp ? Number(selectedVariant.mrp) : null;
    const hasDiscount = Boolean(mrp && mrp > price);
    const discountPercent = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(route('wishlist.toggle', product.id), {}, { preserveScroll: true });
    };

    const getCategoryEmoji = (cat) => {
        const c = (cat?.name || cat?.value || cat || categoryName || '').toUpperCase();
        if (c.includes('MILK') || c.includes('DAIRY')) return '🥛';
        if (c.includes('WATER')) return '💧';
        if (c.includes('BEVERAGE') || c.includes('JUICE') || c.includes('DRINK')) return '🍹';
        return '📦';
    };

    return (
        <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col justify-between hover:border-purple-200 transition-all duration-200 relative group shadow-xs ${className}`}>
            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                {hasDiscount && discountPercent > 0 && (
                    <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                        {discountPercent}% OFF
                    </span>
                )}
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                    10 MINS
                </span>
            </div>

            {/* Wishlist Button */}
            <button
                type="button"
                onClick={toggleWishlist}
                className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full border flex items-center justify-center transition shadow-xs cursor-pointer ${
                    isWishlisted
                        ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                        : 'bg-white/90 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-slate-200'
                }`}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Image Area */}
            <Link
                href={route('product.show', product.slug || product.id)}
                className="h-40 w-full flex items-center justify-center relative bg-slate-50 overflow-hidden"
            >
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                        onError={() => setImage('')}
                    />
                ) : (
                    <span className="text-4xl filter grayscale opacity-60 transition duration-300 group-hover:scale-110">
                        {getCategoryEmoji(product.category)}
                    </span>
                )}
            </Link>

            {/* Product Info */}
            <div className="p-3.5 flex flex-col flex-1">
                {product.brand && (
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">
                        {product.brand}
                    </span>
                )}
                <Link
                    href={route('product.show', product.slug || product.id)}
                    className="block group-hover:text-purple-600 transition-colors"
                >
                    <h3 className="text-xs font-bold text-slate-900 leading-snug mb-2 line-clamp-2 min-h-[2.4em]">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto pt-2 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            {hasDiscount && (
                                <span className="text-[10px] text-slate-400 line-through block leading-none">
                                    ₹{mrp}
                                </span>
                            )}
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-extrabold text-slate-900">
                                    ₹{price}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const minQty = isRetailer ? Math.max(1, parseInt(selectedVariant.min_bulk_qty, 10) || 1) : 1;
                                addToCart(selectedVariantId, minQty);
                            }}
                            className="px-3.5 py-1 bg-purple-50/70 border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white font-bold text-[11px] rounded-lg transition uppercase tracking-wide shadow-xs active:scale-95 cursor-pointer"
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
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap transition cursor-pointer border ${
                                        selectedVariantId === variant.id
                                            ? 'bg-purple-50 border-purple-300 text-purple-700'
                                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                    }`}
                                >
                                    {variant.unit_size}
                                </button>
                            ))}
                        </div>
                    ) : firstVariant.unit_size ? (
                        <div className="mt-2 h-5 flex items-center">
                            <span className="text-[10px] font-medium bg-slate-50 border border-slate-100 text-slate-500 px-1.5 py-0.2 rounded">
                                {firstVariant.unit_size}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}


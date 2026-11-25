import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useCart } from '../../Context/CartContext';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';

export default function WishlistGrid({ wishlist = [] }) {
    const { addToCart } = useCart();
    const { auth } = usePage().props;
    const isRetailer = Boolean(auth?.user?.is_retailer);

    const removeFromWishlist = (productId) => {
        router.post(`/wishlist/${productId}/toggle`, {}, { preserveScroll: true });
    };

    if (wishlist.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">Your wishlist is empty</h3>
                <p className="text-xs text-slate-400 mt-1">Explore our catalog and tap the heart icon to save favorite items.</p>
                <Link
                    href="/catalog"
                    className="inline-block mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
                >
                    Browse Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map((item) => {
                const product = item.product || item;
                const defaultVariant = product.variants?.[0];
                const displayPrice = isRetailer && defaultVariant?.bulk_price != null
                    ? defaultVariant.bulk_price
                    : defaultVariant?.retail_price;

                return (
                    <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-xs hover:border-purple-200 transition flex flex-col justify-between relative group"
                    >
                        <button
                            type="button"
                            onClick={() => removeFromWishlist(product.id)}
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-2xs transition cursor-pointer"
                            title="Remove from wishlist"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div>
                            <div className="h-32 w-full rounded-xl bg-slate-50 flex items-center justify-center mb-2.5 overflow-hidden">
                                {defaultVariant?.image_url ? (
                                    <img
                                        src={defaultVariant.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                ) : (
                                    <span className="text-3xl">📦</span>
                                )}
                            </div>

                            {isRetailer && (
                                <span className="inline-block text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded mb-1">
                                    Wholesale Price
                                </span>
                            )}

                            <h4 className="font-bold text-xs text-slate-900 truncate">
                                {product.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 mb-2 truncate">
                                {defaultVariant?.unit_size || 'Standard'}
                            </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                                <span className="text-xs font-black text-slate-900">
                                    ₹{Number(displayPrice || 0).toLocaleString()}
                                </span>
                                {defaultVariant?.mrp && (
                                    <span className="text-[10px] text-slate-400 line-through ml-1">
                                        ₹{Number(defaultVariant.mrp).toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {defaultVariant && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const minQty = isRetailer ? Math.max(1, parseInt(defaultVariant.min_bulk_qty, 10) || 1) : 1;
                                        addToCart(defaultVariant.id, minQty);
                                    }}
                                    className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white transition cursor-pointer"
                                    title="Add to cart"
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


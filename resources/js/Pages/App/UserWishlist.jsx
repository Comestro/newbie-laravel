import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { useCart } from '../../Context/CartContext';
import { Heart, Trash2 } from 'lucide-react';

export default function UserWishlist({ wishlist = [] }) {
    const { addToCart } = useCart();

    const removeFromWishlist = (productId) => {
        router.post(`/wishlist/${productId}/toggle`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout title="My Wishlist" subtitle="Saved products you'd like to purchase later">
            <Head title="My Wishlist - Newbie Service" />

            {wishlist.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-xs">
                    <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="font-bold text-sm text-slate-800">Your wishlist is empty</h3>
                    <p className="text-xs text-slate-400 mt-1">Explore our products and tap the heart icon to save favorites.</p>
                    <Link
                        href="/catalog"
                        className="inline-block mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition shadow-xs"
                    >
                        Browse Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {wishlist.map((item) => {
                        const product = item.product || item;
                        const defaultVariant = product.variants?.[0];
                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl border border-slate-100 p-3 shadow-xs hover:border-purple-200 transition flex flex-col justify-between relative group"
                            >
                                <button
                                    type="button"
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-xs transition"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>

                                <div>
                                    <div className="h-32 w-full rounded-lg bg-slate-50 flex items-center justify-center mb-2 overflow-hidden">
                                        {defaultVariant?.image_url ? (
                                            <img
                                                src={defaultVariant.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl">📦</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                        {product.brand}
                                    </span>
                                    <Link href={`/product/${product.slug || product.id}`} className="block">
                                        <h4 className="font-semibold text-xs text-slate-900 line-clamp-1 group-hover:text-purple-600 transition">
                                            {product.name}
                                        </h4>
                                    </Link>
                                    <p className="text-xs font-bold text-slate-900 mt-1">
                                        ₹{defaultVariant?.retail_price || 0}
                                    </p>
                                </div>

                                {defaultVariant && (
                                    <button
                                        type="button"
                                        onClick={() => addToCart(defaultVariant.id, 1)}
                                        className="w-full mt-2.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-semibold transition"
                                    >
                                        Add to Cart
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}

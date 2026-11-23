import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { useCart } from '../../Context/CartContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function UserWishlist({ wishlists = [] }) {
    const { addToCart } = useCart();

    const handleRemove = (productId) => {
        router.delete(`/wishlist/${productId}`, { preserveScroll: true });
    };

    return (
        <AppLayout title="My Wishlist" subtitle="Saved items you want to buy later">
            <Head title="My Wishlist - Newbie Service" />

            {wishlists.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-12 text-center">
                    <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Your wishlist is empty</h3>
                    <p className="text-sm text-gray-500 mt-1">Explore our products and tap the heart icon to save favorites.</p>
                    <Link
                        href="/catalog"
                        className="inline-block mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlists.map((w) => {
                        const product = w.product;
                        if (!product) return null;
                        const defaultVariant = product.variants?.[0];

                        return (
                            <div
                                key={w.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="aspect-square bg-gray-50 dark:bg-gray-700/40 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                                        {defaultVariant?.image_url ? (
                                            <img src={defaultVariant.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-600 uppercase">{product.brand}</span>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.name}</h4>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">₹{defaultVariant?.retail_price || 0}</p>
                                </div>

                                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <button
                                        onClick={() => defaultVariant && addToCart(defaultVariant.id, 1)}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition"
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => handleRemove(product.id)}
                                        className="text-gray-400 hover:text-red-600 p-1"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}


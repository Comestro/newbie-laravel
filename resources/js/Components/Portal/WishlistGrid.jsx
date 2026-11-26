import React from 'react';
import { Link } from '@inertiajs/react';
import ProductCard from '../ProductCard';
import { Heart } from 'lucide-react';

export default function WishlistGrid({ wishlist = [] }) {
    if (!wishlist || wishlist.length === 0) {
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
                if (!item) return null;
                const product = item.product || item;
                if (!product || !product.id) return null;

                return <ProductCard key={item.id || product.id} product={product} />;
            })}
        </div>
    );
}

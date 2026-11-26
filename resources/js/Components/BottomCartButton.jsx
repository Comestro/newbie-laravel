import React from 'react';
import { usePage } from '@inertiajs/react';
import { useCart } from '../Context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function BottomCartButton() {
    const { url } = usePage();
    const { itemCount, subtotal, openCart, isCartOpen } = useCart();

    // Hide if no items, drawer already open, or on checkout page
    if (!itemCount || itemCount <= 0 || isCartOpen || url.startsWith('/checkout')) {
        return null;
    }

    return (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
            <button
                type="button"
                onClick={openCart}
                className="flex items-center gap-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white pl-4 pr-5 py-2.5 rounded-full shadow-2xl shadow-purple-900/40 transition-all duration-200 cursor-pointer border border-purple-400/30 backdrop-blur-xs group"
                aria-label={`View Cart: ${itemCount} items, total ₹${subtotal}`}
            >
                <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
                    <div className="text-left">
                        <div className="text-xs font-bold leading-tight">
                            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                        </div>
                        <div className="text-[11px] font-semibold text-purple-100 leading-tight">
                            ₹{Number(subtotal).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="h-4 w-px bg-purple-400/50" />

                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    <span>View Cart</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
            </button>
        </div>
    );
}


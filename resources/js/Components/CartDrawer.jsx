import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useCart } from '../Context/CartContext';

export default function CartDrawer() {
    const { auth } = usePage().props;
    const {
        isCartOpen,
        closeCart,
        cart,
        items,
        subtotal,
        updateQuantity,
    } = useCart();

    const [tip, setTip] = useState(0);

    const deliveryCharge = subtotal > 199 || subtotal === 0 ? 0 : 25;
    const grandTotal = subtotal + deliveryCharge + tip;

    if (!isCartOpen) return null;

    return (
        <div
            className="relative z-50"
            aria-labelledby="slide-over-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                onClick={closeCart}
                className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-[2px]"
            />

            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
                        <div className="pointer-events-auto w-screen sm:max-w-md">
                            <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-2xl font-sans">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 relative z-10">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100" id="slide-over-title">
                                        My Cart
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={closeCart}
                                        className="relative rounded-md text-gray-400 hover:text-gray-500 text-2xl leading-none p-2 -mr-2"
                                    >
                                        &times;
                                    </button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black/20">
                                    {items.length === 0 ? (
                                        <div className="text-center py-20 px-6">
                                            <div className="text-5xl mb-3">🛒</div>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                                Your cart is empty
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1 mb-6">
                                                Add items to start ordering fresh groceries.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={closeCart}
                                                className="px-6 py-2.5 bg-[#A855F7] text-white font-bold rounded-xl text-sm hover:bg-[#9333EA] transition shadow-md shadow-purple-200 dark:shadow-none"
                                            >
                                                Browse Products
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Items List */}
                                            <div className="px-4 py-4 bg-white dark:bg-gray-900 mb-2 shadow-sm">
                                                <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {items.map((item) => (
                                                        <li key={item.id} className="flex py-4">
                                                            {/* Image */}
                                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                                {item.image_url ? (
                                                                    <img
                                                                        src={item.image_url}
                                                                        alt={item.name}
                                                                        className="h-full w-full object-cover object-center"
                                                                    />
                                                                ) : (
                                                                    <div className="text-2xl">📦</div>
                                                                )}
                                                            </div>

                                                            <div className="ml-4 flex flex-1 flex-col justify-between">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1 leading-snug">
                                                                            {item.name ? item.name.split(' - ')[0] : ''}
                                                                        </h3>
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide border border-gray-200 dark:border-gray-700">
                                                                            {item.unit_size}
                                                                        </span>
                                                                    </div>

                                                                    <div className="text-right">
                                                                        <div className="text-[10px] text-gray-400 line-through">
                                                                            ₹{Math.round(item.price * 1.2)}
                                                                        </div>
                                                                        <div className="font-extrabold text-gray-900 dark:text-white text-sm">
                                                                            ₹{item.price}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between mt-3">
                                                                    <span className="text-xs text-gray-400">Qty</span>
                                                                    {/* Stepper Button */}
                                                                    <div className="bg-[#A855F7] text-white rounded-lg flex items-center shadow-sm">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateQuantity(item.id, -1)}
                                                                            className="px-2.5 py-1 text-sm font-bold hover:bg-[#9333EA] rounded-l-lg transition"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateQuantity(item.id, 1)}
                                                                            className="px-2.5 py-1 text-sm font-bold hover:bg-[#9333EA] rounded-r-lg transition"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Delivery Partner Tip */}
                                            <div className="px-6 py-4 bg-white dark:bg-gray-900 mb-2 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                                                        <span>Delivery Partner Tip</span>
                                                        <span className="text-red-500 text-xs">❤️</span>
                                                    </h3>
                                                    {tip > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setTip(0)}
                                                            className="text-xs text-purple-600 font-bold"
                                                        >
                                                            Clear
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mb-3">
                                                    The entire amount goes directly to your delivery partner.
                                                </p>
                                                <div className="flex gap-2">
                                                    {[10, 20, 30, 50].map((amount) => (
                                                        <button
                                                            key={amount}
                                                            type="button"
                                                            onClick={() => setTip(tip === amount ? 0 : amount)}
                                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                                                                tip === amount
                                                                    ? 'bg-purple-100 border-purple-400 text-purple-700'
                                                                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                                                            }`}
                                                        >
                                                            ₹{amount}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Bill Details */}
                                            <div className="px-6 py-5 bg-white dark:bg-gray-900 mb-2 shadow-sm">
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">
                                                    Bill Details
                                                </h3>
                                                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                                                    <div className="flex justify-between">
                                                        <span>Items total</span>
                                                        <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <span>Delivery charge</span>
                                                            {deliveryCharge === 0 && (
                                                                <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.2 rounded">
                                                                    FREE
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium">
                                                            {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                                        </span>
                                                    </div>
                                                    {tip > 0 && (
                                                        <div className="flex justify-between text-purple-600 font-medium">
                                                            <span>Delivery Tip</span>
                                                            <span>₹{tip}</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-3 flex justify-between text-base font-extrabold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 mt-2">
                                                        <span>Grand total</span>
                                                        <span>₹{grandTotal.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cancellation Policy */}
                                            <div className="px-6 py-5 bg-white dark:bg-gray-900 shadow-sm">
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
                                                    Cancellation Policy
                                                </h3>
                                                <p className="text-[11px] text-gray-500 leading-relaxed dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                                    Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
                                                </p>
                                            </div>
                                            <div className="h-28"></div>
                                        </>
                                    )}
                                </div>

                                {items.length > 0 && (
                                    /* Footer Action */
                                    <div className="absolute bottom-0 w-full border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 z-20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
                                        <Link
                                            href={auth?.user ? '/checkout' : '/login'}
                                            onClick={closeCart}
                                            className="w-full flex items-center justify-between rounded-xl bg-[#A855F7] px-4 py-3 shadow-lg shadow-purple-200 dark:shadow-none hover:bg-[#9333EA] transition active:scale-[0.99] group"
                                        >
                                            <div className="flex flex-col items-start text-white pl-2">
                                                <span className="font-bold text-lg leading-none">
                                                    ₹{grandTotal.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-white/80 tracking-wide mt-0.5">
                                                    Total
                                                </span>
                                            </div>
                                            <div className="flex items-center font-bold text-white text-sm pr-2">
                                                {auth?.user ? 'Proceed' : 'Login to Proceed'}
                                                <svg
                                                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                                </svg>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

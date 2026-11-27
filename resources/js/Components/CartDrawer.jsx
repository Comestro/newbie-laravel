import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useCart } from '../Context/CartContext';

export default function CartDrawer() {
    const { auth } = usePage().props;
    const isRetailer = Boolean(auth?.user?.is_retailer || auth?.user?.role === 'retailer');
    const {
        isCartOpen,
        closeCart,
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
            className="relative z-[60] font-sans"
            aria-labelledby="slide-over-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Subtle backdrop */}
            <div
                onClick={closeCart}
                className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] transition-opacity"
            />

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
                        <div className="pointer-events-auto w-screen sm:max-w-md">
                            <div className="flex h-full flex-col bg-white border-l border-slate-100 shadow-sm">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                                    <h2 className="text-base font-bold text-slate-900" id="slide-over-title">
                                        My Cart
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={closeCart}
                                        className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 text-xl leading-none transition"
                                    >
                                        &times;
                                    </button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 space-y-3">
                                    {items.length === 0 ? (
                                        <div className="text-center py-20 px-6 bg-white rounded-xl border border-slate-100">
                                            <div className="text-4xl mb-3">🛒</div>
                                            <h3 className="text-base font-bold text-slate-800">
                                                Your cart is empty
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 mb-5">
                                                Add fresh milk, beverages, or daily essentials.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={closeCart}
                                                className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg text-xs hover:bg-purple-700 transition"
                                            >
                                                Browse Products
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Items List */}
                                            <div className="bg-white rounded-xl border border-slate-100 p-4">
                                                <ul role="list" className="divide-y divide-slate-100">
                                                    {items.map((item) => (
                                                        <li key={item.id} className="flex py-3.5 first:pt-0 last:pb-0">
                                                            {/* Image */}
                                                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center">
                                                                {item.image_url ? (
                                                                    <img
                                                                        src={item.image_url}
                                                                        alt={item.name}
                                                                        className="h-full w-full object-cover object-center"
                                                                    />
                                                                ) : (
                                                                    <div className="text-xl">📦</div>
                                                                )}
                                                            </div>

                                                            <div className="ml-3.5 flex flex-1 flex-col justify-between">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <div>
                                                                        <h3 className="font-semibold text-slate-900 text-xs leading-snug">
                                                                            {item.name ? item.name.split(' - ')[0] : ''}
                                                                        </h3>
                                                                        <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/70">
                                                                            {item.unit_size}
                                                                        </span>
                                                                    </div>

                                                                    <div className="text-right">
                                                                        <div className="text-[10px] text-slate-400 line-through">
                                                                            ₹{Math.round(item.price * 1.2)}
                                                                        </div>
                                                                        <div className="font-bold text-slate-900 text-xs">
                                                                            ₹{item.price}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                                                    <div>
                                                                        <span className="text-[11px] text-slate-400">Quantity</span>
                                                                        {isRetailer && item.min_bulk_qty > 1 && (
                                                                            <span className="block text-[9px] text-purple-600 font-medium">
                                                                                Min bulk: {item.min_bulk_qty} units
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* Stepper Button */}
                                                                    <div className="bg-purple-600 text-white rounded-lg flex items-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateQuantity(item.id, -1)}
                                                                            className="px-2 py-0.5 text-xs font-bold hover:bg-purple-700 rounded-l-lg transition cursor-pointer"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateQuantity(item.id, 1)}
                                                                            className="px-2 py-0.5 text-xs font-bold hover:bg-purple-700 rounded-r-lg transition cursor-pointer"
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
                                            <div className="bg-white rounded-xl border border-slate-100 p-4">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                                                        <span>Delivery Partner Tip</span>
                                                        <span className="text-rose-500 text-xs">❤️</span>
                                                    </h3>
                                                    {tip > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setTip(0)}
                                                            className="text-[11px] text-purple-600 font-semibold"
                                                        >
                                                            Clear
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 mb-2.5">
                                                    The entire tip goes directly to your delivery partner.
                                                </p>
                                                <div className="flex gap-2">
                                                    {[10, 20, 30, 50].map((amount) => (
                                                        <button
                                                            key={amount}
                                                            type="button"
                                                            onClick={() => setTip(tip === amount ? 0 : amount)}
                                                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                                                                tip === amount
                                                                    ? 'bg-purple-50 border-purple-300 text-purple-700 font-semibold'
                                                                    : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            ₹{amount}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Bill Details */}
                                            <div className="bg-white rounded-xl border border-slate-100 p-4">
                                                <h3 className="font-semibold text-slate-900 mb-2.5 text-xs uppercase tracking-wider text-slate-400">
                                                    Bill Details
                                                </h3>
                                                <div className="space-y-2 text-xs text-slate-600">
                                                    <div className="flex justify-between">
                                                        <span>Items total</span>
                                                        <span className="font-medium text-slate-900">₹{subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <span>Delivery charge</span>
                                                            {deliveryCharge === 0 && (
                                                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1 py-0.2 rounded">
                                                                    FREE
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-slate-900">
                                                            {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                                        </span>
                                                    </div>
                                                    {tip > 0 && (
                                                        <div className="flex justify-between text-purple-600 font-medium">
                                                            <span>Delivery Tip</span>
                                                            <span>₹{tip}</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-2.5 flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 mt-2">
                                                        <span>Grand total</span>
                                                        <span>₹{grandTotal.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Policy */}
                                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                                                Orders cannot be cancelled once packed for dispatch. In case of unexpected delays, a replacement or refund will be issued.
                                            </div>
                                            <div className="h-24"></div>
                                        </>
                                    )}
                                </div>

                                {items.length > 0 && (
                                    /* Footer Action */
                                    <div className="border-t border-slate-100 bg-white px-4 py-3 shadow-xs">
                                        {auth?.user?.is_retailer && !auth?.user?.is_kyc_approved && (
                                            <div className="mb-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-tight flex items-center justify-between">
                                                <span>⚠️ Retailer KYC pending — order placement is locked until approved.</span>
                                                <Link
                                                    href="/apply-to-retailer"
                                                    onClick={closeCart}
                                                    className="font-bold underline text-purple-700 ml-1.5 shrink-0"
                                                >
                                                    KYC &rarr;
                                                </Link>
                                            </div>
                                        )}
                                        <Link
                                            href={auth?.user ? '/checkout' : '/login'}
                                            onClick={closeCart}
                                            className="w-full flex items-center justify-between rounded-xl bg-purple-600 px-4 py-3 text-white hover:bg-purple-700 transition active:scale-[0.99] group"
                                        >
                                            <div className="flex flex-col items-start pl-1">
                                                <span className="font-bold text-base leading-none">
                                                    ₹{grandTotal.toLocaleString()}
                                                </span>
                                                <span className="text-[9px] uppercase font-semibold text-purple-200 mt-0.5">
                                                    Total to Pay
                                                </span>
                                            </div>
                                            <div className="flex items-center font-semibold text-sm pr-1">
                                                {auth?.user ? 'Proceed to Checkout' : 'Login to Proceed'}
                                                <svg
                                                    className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition"
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

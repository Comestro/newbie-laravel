import React, { useState } from 'react';
import { CartProvider } from '../Context/CartContext';
import FlashMessages from '../Components/FlashMessages';
import CartDrawer from '../Components/CartDrawer';
import BottomCartButton from '../Components/BottomCartButton';
import { Menu, X } from 'lucide-react';

export default function PanelLayout({ children, sidebar, title, subtitle, action, headerRight = null, showCart = false }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const content = (
        <div className="h-screen overflow-hidden flex bg-slate-50/70 text-slate-800 font-sans">
            <FlashMessages />
            {showCart && <CartDrawer />}
            {showCart && <BottomCartButton />}

            {/* Desktop Fixed Sidebar */}
            <div className="hidden lg:block h-full shrink-0">
                {sidebar}
            </div>

            {/* Mobile Slide-Over Sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative z-10 h-full flex">
                        {sidebar}
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            aria-label="Close menu"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {title && (
                    <header className="shrink-0 bg-white border-b border-slate-100 px-4 sm:px-8 py-4 sm:py-5">
                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(true)}
                                    className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0"
                                    aria-label="Open menu"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                <div className="min-w-0">
                                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">{title}</h1>
                                    {subtitle && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{subtitle}</p>}
                                </div>
                            </div>
                            {(action || headerRight) && (
                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                    {action}
                                    {headerRight}
                                </div>
                            )}
                        </div>
                    </header>
                )}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {children}
                </main>
            </div>
        </div>
    );

    if (showCart) {
        return <CartProvider>{content}</CartProvider>;
    }

    return content;
}


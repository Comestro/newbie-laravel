import React from 'react';
import { CartProvider } from '../Context/CartContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import CartDrawer from '../Components/CartDrawer';
import BottomCartButton from '../Components/BottomCartButton';
import MobileBottomNav from '../Components/MobileBottomNav';
import FlashMessages from '../Components/FlashMessages';

export default function ShopLayout({ children }) {
    return (
        <CartProvider>
            <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 font-sans">
                <FlashMessages />
                <Navbar />
                <CartDrawer />
                <BottomCartButton />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
                <MobileBottomNav />
            </div>
        </CartProvider>
    );
}

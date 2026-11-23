import React from 'react';
import { CartProvider } from '../Context/CartContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import CartDrawer from '../Components/CartDrawer';
import MobileBottomNav from '../Components/MobileBottomNav';
import FlashMessages from '../Components/FlashMessages';

export default function ShopLayout({ children }) {
    return (
        <CartProvider>
            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
                <FlashMessages />
                <Navbar />
                <CartDrawer />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
                <MobileBottomNav />
            </div>
        </CartProvider>
    );
}


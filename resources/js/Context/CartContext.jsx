import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

// Reactive store for cart drawer visibility across components
let isCartOpenState = false;
const listeners = new Set();

function emitChange() {
    for (const listener of listeners) {
        listener();
    }
}

const cartDrawerStore = {
    isOpen: () => isCartOpenState,
    setOpen: (open) => {
        if (isCartOpenState !== open) {
            isCartOpenState = open;
            emitChange();
        }
    },
    subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

const CartContext = createContext(null);

export function useCartState() {
    let pageProps = {};
    try {
        pageProps = usePage()?.props || {};
    } catch {
        pageProps = {};
    }

    const cart = pageProps.cart || {};
    const isCartOpen = useSyncExternalStore(
        cartDrawerStore.subscribe,
        cartDrawerStore.isOpen,
        () => false
    );

    const items = Object.values(cart || {});
    const itemCount = items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
    const subtotal = items.reduce((sum, item) => sum + ((Number(item?.price) || 0) * (Number(item?.quantity) || 1)), 0);

    const openCart = () => cartDrawerStore.setOpen(true);
    const closeCart = () => cartDrawerStore.setOpen(false);

    const addToCart = (variantId, quantity = 1) => {
        router.post('/cart/add', { variant_id: variantId, quantity }, {
            preserveScroll: true,
            onSuccess: () => {
                cartDrawerStore.setOpen(true);
                toast.success('Added to cart!');
            },
        });
    };

    const updateQuantity = (variantId, change) => {
        router.post('/cart/update', { variant_id: variantId, change }, {
            preserveScroll: true,
        });
    };

    const removeFromCart = (variantId) => {
        router.post('/cart/remove', { variant_id: variantId }, {
            preserveScroll: true,
        });
    };

    const clearCart = () => {
        router.post('/cart/clear', {}, {
            preserveScroll: true,
        });
    };

    return {
        cart,
        items,
        itemCount,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
    };
}

export function CartProvider({ children }) {
    const cartData = useCartState();
    return (
        <CartContext.Provider value={cartData}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    const directState = useCartState();
    return context || directState;
}



import React from 'react';
import { Head } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import WishlistGrid from '../../Components/Portal/WishlistGrid';

export default function Wishlist({ wishlists = [] }) {
    return (
        <CustomerLayout
            title="My Wishlist"
            subtitle="Saved products you would like to purchase later"
        >
            <Head title="My Wishlist - Newbie Service" />
            <WishlistGrid wishlist={wishlists} />
        </CustomerLayout>
    );
}


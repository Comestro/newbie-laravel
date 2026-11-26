import React from 'react';
import { Head } from '@inertiajs/react';
import RetailerLayout from '../../Layouts/RetailerLayout';
import WishlistGrid from '../../Components/Portal/WishlistGrid';

export default function Wishlist({ wishlists = [] }) {
    return (
        <RetailerLayout
            title="Saved Wholesale Products"
            subtitle="Products bookmarked for quick bulk inventory re-ordering"
        >
            <Head title="Wholesale Wishlist - Newbie Service" />
            <WishlistGrid wishlist={wishlists} />
        </RetailerLayout>
    );
}


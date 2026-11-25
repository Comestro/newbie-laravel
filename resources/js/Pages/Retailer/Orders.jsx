import React from 'react';
import { Head } from '@inertiajs/react';
import RetailerLayout from '../../Layouts/RetailerLayout';
import OrderList from '../../Components/Portal/OrderList';

export default function Orders({ orders = [] }) {
    return (
        <RetailerLayout
            title="Wholesale Orders"
            subtitle="Track and manage all your bulk inventory purchases"
        >
            <Head title="Wholesale Orders - Newbie Service" />
            <OrderList orders={orders} isRetailer={true} />
        </RetailerLayout>
    );
}


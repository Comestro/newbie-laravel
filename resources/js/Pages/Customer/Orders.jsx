import React from 'react';
import { Head } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import OrderList from '../../Components/Portal/OrderList';

export default function Orders({ orders = [] }) {
    return (
        <CustomerLayout
            title="My Orders"
            subtitle="Track and manage all your past grocery orders"
        >
            <Head title="My Orders - Newbie Service" />
            <OrderList orders={orders} isRetailer={false} />
        </CustomerLayout>
    );
}


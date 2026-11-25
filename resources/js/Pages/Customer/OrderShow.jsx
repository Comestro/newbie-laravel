import React from 'react';
import { Head } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import OrderDetail from '../../Components/Portal/OrderDetail';

export default function OrderShow({ order }) {
    return (
        <CustomerLayout
            title={`Order #${order.order_number}`}
            subtitle="Detailed view of your order and item invoice"
        >
            <Head title={`Order #${order.order_number} - Newbie Service`} />
            <OrderDetail order={order} backUrl="/my-orders" />
        </CustomerLayout>
    );
}


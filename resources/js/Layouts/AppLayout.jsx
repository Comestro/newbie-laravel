import React from 'react';
import { usePage } from '@inertiajs/react';
import CustomerLayout from './CustomerLayout';
import RetailerLayout from './RetailerLayout';

export default function AppLayout(props) {
    const { auth } = usePage().props;
    const isRetailer = Boolean(auth?.user?.is_retailer);

    if (isRetailer) {
        return <RetailerLayout {...props} />;
    }

    return <CustomerLayout {...props} />;
}

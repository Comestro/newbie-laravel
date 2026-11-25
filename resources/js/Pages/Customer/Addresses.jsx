import React from 'react';
import { Head } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import AddressManager from '../../Components/Portal/AddressManager';

export default function Addresses({ addresses = [] }) {
    return (
        <CustomerLayout
            title="Saved Addresses"
            subtitle="Manage your saved home and delivery locations"
        >
            <Head title="Saved Addresses - Newbie Service" />
            <AddressManager addresses={addresses} isRetailer={false} />
        </CustomerLayout>
    );
}


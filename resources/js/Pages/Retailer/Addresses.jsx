import React from 'react';
import { Head } from '@inertiajs/react';
import RetailerLayout from '../../Layouts/RetailerLayout';
import AddressManager from '../../Components/Portal/AddressManager';

export default function Addresses({ addresses = [] }) {
    return (
        <RetailerLayout
            title="Delivery Addresses"
            subtitle="Manage your shop and warehouse delivery receiving locations"
        >
            <Head title="Delivery Addresses - Newbie Service" />
            <AddressManager addresses={addresses} isRetailer={true} />
        </RetailerLayout>
    );
}


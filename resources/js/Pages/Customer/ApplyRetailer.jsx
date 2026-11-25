import React from 'react';
import { Head } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import KycManager from '../../Components/Portal/KycManager';

export default function ApplyRetailer({ user }) {
    return (
        <CustomerLayout
            title="Apply for Retailer Account"
            subtitle="Submit your business and KYC verification to become a certified Newbie retailer"
        >
            <Head title="Apply for Retailer - Newbie Service" />
            <KycManager user={user} isRetailer={false} />
        </CustomerLayout>
    );
}


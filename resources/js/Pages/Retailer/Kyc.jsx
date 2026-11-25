import React from 'react';
import { Head } from '@inertiajs/react';
import RetailerLayout from '../../Layouts/RetailerLayout';
import KycManager from '../../Components/Portal/KycManager';

export default function Kyc({ user }) {
    return (
        <RetailerLayout
            title="KYC Verification & Documents"
            subtitle="View verification status and upload updated government ID documents"
        >
            <Head title="KYC Verification - Newbie Service" />
            <KycManager user={user} isRetailer={true} />
        </RetailerLayout>
    );
}


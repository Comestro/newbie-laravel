import React from 'react';
import { Head } from '@inertiajs/react';
import RetailerLayout from '../../Layouts/RetailerLayout';
import ProfileEditor from '../../Components/Portal/ProfileEditor';

export default function Profile({ user }) {
    return (
        <RetailerLayout
            title="Profile Settings"
            subtitle="Manage your business contact information and login credentials"
        >
            <Head title="Retailer Profile - Newbie Service" />
            <ProfileEditor user={user} />
        </RetailerLayout>
    );
}


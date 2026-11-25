import React from 'react';
import { Head } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import ProfileEditor from '../../Components/Portal/ProfileEditor';

export default function Profile({ user }) {
    return (
        <CustomerLayout
            title="Profile Settings"
            subtitle="Update your personal account information and security credentials"
        >
            <Head title="Profile Settings - Newbie Service" />
            <ProfileEditor user={user} />
        </CustomerLayout>
    );
}


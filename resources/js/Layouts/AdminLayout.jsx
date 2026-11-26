import React from 'react';
import PanelLayout from './PanelLayout';
import AdminSidebar from '../Components/AdminSidebar';
import AdminNotificationBell from '../Components/AdminNotificationBell';

export default function AdminLayout({ children, title, subtitle, action }) {
    return (
        <PanelLayout
            sidebar={<AdminSidebar />}
            title={title}
            subtitle={subtitle}
            action={action}
            headerRight={<AdminNotificationBell />}
        >
            {children}
        </PanelLayout>
    );
}

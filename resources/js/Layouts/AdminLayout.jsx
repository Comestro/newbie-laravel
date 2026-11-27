import React from 'react';
import PanelLayout from './PanelLayout';
import AdminSidebar from '../Components/AdminSidebar';
import NotificationBell from '../Components/NotificationBell';

export default function AdminLayout({ children, title, subtitle, action }) {
    return (
        <PanelLayout
            sidebar={<AdminSidebar />}
            title={title}
            subtitle={subtitle}
            action={action}
            headerRight={<NotificationBell />}
        >
            {children}
        </PanelLayout>
    );
}

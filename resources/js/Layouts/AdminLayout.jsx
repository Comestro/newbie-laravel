import React from 'react';
import PanelLayout from './PanelLayout';
import AdminSidebar from '../Components/AdminSidebar';

export default function AdminLayout({ children, title, subtitle, action }) {
    return (
        <PanelLayout sidebar={<AdminSidebar />} title={title} subtitle={subtitle} action={action}>
            {children}
        </PanelLayout>
    );
}

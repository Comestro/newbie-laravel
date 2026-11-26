import React from 'react';
import PanelLayout from './PanelLayout';
import CustomerSidebar from '../Components/CustomerSidebar';

export default function CustomerLayout({ children, title, subtitle, action }) {
    return (
        <PanelLayout sidebar={<CustomerSidebar />} title={title} subtitle={subtitle} action={action} showCart>
            {children}
        </PanelLayout>
    );
}

import React from 'react';
import PanelLayout from './PanelLayout';
import RetailerSidebar from '../Components/RetailerSidebar';

export default function RetailerLayout({ children, title, subtitle, action }) {
    return (
        <PanelLayout sidebar={<RetailerSidebar />} title={title} subtitle={subtitle} action={action} showCart>
            {children}
        </PanelLayout>
    );
}

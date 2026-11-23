import React from 'react';
import ShopLayout from './ShopLayout';
import UserSidebar from '../Components/UserSidebar';

export default function AppLayout({ children, title, subtitle }) {
    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {title && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                )}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <UserSidebar />
                    <div className="flex-1 w-full min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}

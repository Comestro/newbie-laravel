import React from 'react';
import ShopLayout from './ShopLayout';
import UserSidebar from '../Components/UserSidebar';

export default function AppLayout({ children, title, subtitle }) {
    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {title && (
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
                    </div>
                )}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <UserSidebar />
                    <div className="flex-1 w-full min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}


import React from 'react';
import AdminSidebar from '../Components/AdminSidebar';
import FlashMessages from '../Components/FlashMessages';

export default function AdminLayout({ children, title, subtitle, action }) {
    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
            <FlashMessages />
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {title && (
                    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-8 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
                            </div>
                            {action && <div>{action}</div>}
                        </div>
                    </header>
                )}
                <main className="flex-1 p-6 sm:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}


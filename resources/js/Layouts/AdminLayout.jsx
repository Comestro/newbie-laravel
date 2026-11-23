import React from 'react';
import AdminSidebar from '../Components/AdminSidebar';
import FlashMessages from '../Components/FlashMessages';

export default function AdminLayout({ children, title, subtitle, action }) {
    return (
        <div className="min-h-screen flex bg-slate-50/70 text-slate-800 font-sans">
            <FlashMessages />
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {title && (
                    <header className="bg-white border-b border-slate-100 px-6 sm:px-8 py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
                                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
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

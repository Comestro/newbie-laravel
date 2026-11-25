import React from 'react';
import ShopLayout from './ShopLayout';
import RetailerSidebar from '../Components/RetailerSidebar';

export default function RetailerLayout({ children, title, subtitle, action }) {
    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {title && (
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                        </div>
                        {action && <div>{action}</div>}
                    </div>
                )}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <RetailerSidebar />
                    <div className="flex-1 w-full min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}


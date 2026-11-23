import React from 'react';
import { Link } from '@inertiajs/react';
import FlashMessages from '../Components/FlashMessages';

export default function GuestLayout({ children, title, description }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50/80 p-4 sm:p-6 font-sans">
            <FlashMessages />
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center mb-4">
                        <img src="/logo.png" alt="Newbie" className="h-10 w-auto" />
                    </Link>
                    {title && <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>}
                    {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}

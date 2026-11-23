import React from 'react';
import { Link } from '@inertiajs/react';
import FlashMessages from '../Components/FlashMessages';

export default function GuestLayout({ children, title, description }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 font-sans">
            <FlashMessages />
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                            N
                        </span>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Newbie
                        </span>
                    </Link>
                    {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>}
                    {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
                </div>

                <div className="bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}


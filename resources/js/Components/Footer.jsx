import React from 'react';
import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 py-10 mt-12 mb-16 md:mb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <Link href="/" className="inline-block">
                            <img src="/logo.png" alt="Newbie" className="h-8 w-auto" />
                        </Link>
                        <p className="mt-2 text-xs text-slate-500">Premium grocery delivery service.</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Newbie Service. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12 mt-12 mb-16 md:mb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Newbie Service" className="h-8 w-auto" />
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                Newbie Service
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Premium grocery delivery service.</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Newbie Service</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

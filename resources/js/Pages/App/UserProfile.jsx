import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { User, Lock, Mail, Phone } from 'lucide-react';

export default function UserProfile({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setData('password', '');
            },
        });
    };

    return (
        <AppLayout title="Profile Settings" subtitle="Update your personal account information and credentials">
            <Head title="Profile Settings - Newbie Service" />

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 shadow-sm max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                                required
                            />
                            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        </div>
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                        <div className="relative mt-1">
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                                required
                            />
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        </div>
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                                placeholder="+91..."
                            />
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        </div>
                        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>

                    <div className="pt-2">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">New Password (leave blank to keep current)</label>
                        <div className="relative mt-1">
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                                placeholder="••••••••"
                            />
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        </div>
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}


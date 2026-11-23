import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Lock, Mail, KeyRound } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <GuestLayout title="Choose New Password" description="Enter your email and chosen password to regain access">
            <Head title="Reset Password - Newbie Service" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                    <div className="relative mt-1">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                    <div className="relative mt-1">
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                        />
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Confirm Password</label>
                    <div className="relative mt-1">
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                        />
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition text-sm"
                >
                    <KeyRound className="w-4 h-4" />
                    <span>Reset Password</span>
                </button>
            </form>
        </GuestLayout>
    );
}


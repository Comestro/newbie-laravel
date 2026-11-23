import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Lock, ShieldCheck } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/user/confirm-password');
    };

    return (
        <GuestLayout title="Confirm Password" description="This is a secure area. Please confirm your password before continuing.">
            <Head title="Confirm Password - Newbie Service" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
                    <div className="relative mt-1">
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                            autoFocus
                        />
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition text-sm"
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Security Password</span>
                </button>
            </form>
        </GuestLayout>
    );
}


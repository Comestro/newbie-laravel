import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout title="Welcome Back" description="Log in to access your Newbie account">
            <Head title="Sign In - Newbie Service" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                    <div className="relative mt-1">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="admin@newbie.com"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                            autoFocus
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
                        <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            Forgot password?
                        </Link>
                    </div>
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

                <div className="flex items-center gap-2 pt-1">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="remember" className="text-xs text-gray-600 dark:text-gray-400">
                        Remember me for 30 days
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition text-sm"
                >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                </button>

                <p className="text-center text-xs text-gray-500 pt-3">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
                        Create an account
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}


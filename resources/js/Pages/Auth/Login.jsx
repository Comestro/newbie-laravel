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
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <div className="relative mt-1">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="admin@newbie.com"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
                            required
                            autoFocus
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">Password</label>
                        <Link href="/forgot-password" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative mt-1">
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
                            required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    <label htmlFor="remember" className="text-xs text-slate-600">
                        Remember me for 30 days
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm shadow-xs flex items-center justify-center gap-2 transition duration-150 disabled:opacity-50"
                >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                </button>

                <p className="text-center text-xs text-slate-500 pt-3">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-700">
                        Create an account
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}

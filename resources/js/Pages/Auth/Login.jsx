import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Mail, Lock, LogIn, ShieldCheck, Store, User } from 'lucide-react';

const DEMO_ACCOUNTS = [
    {
        label: 'Admin',
        email: 'admin@newbie.com',
        password: 'password',
        icon: ShieldCheck,
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100',
    },
    {
        label: 'Retailer',
        email: 'retailer@newbie.com',
        password: 'password',
        icon: Store,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100',
    },
    {
        label: 'Customer',
        email: 'user@newbie.com',
        password: 'password',
        icon: User,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100',
    },
];

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

    const handleDemoLogin = (account) => {
        setData({
            email: account.email,
            password: account.password,
            remember: false,
        });
        router.post('/login', {
            email: account.email,
            password: account.password,
            remember: false,
        });
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

            {/* Floating Quick Demo Login (Bottom-Right Corner) */}
            <div className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg rounded-2xl p-3 w-64">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Demo Login
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                    {DEMO_ACCOUNTS.map((account) => {
                        const Icon = account.icon;
                        return (
                            <button
                                key={account.email}
                                type="button"
                                disabled={processing}
                                onClick={() => handleDemoLogin(account)}
                                className={`py-2 px-1.5 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50 ${account.badgeClass}`}
                                title={`${account.email} / ${account.password}`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{account.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </GuestLayout>
    );
}

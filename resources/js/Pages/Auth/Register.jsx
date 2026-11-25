import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { User, Mail, Lock, UserPlus, Store, ShoppingBag } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'USER',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout title="Create Account" description="Join Newbie to order fresh milk and groceries">
            <Head title="Sign Up - Newbie Service" />

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Type Selection */}
                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Account Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setData('role', 'USER')}
                            className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition ${
                                data.role === 'USER'
                                    ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-1 ring-purple-600'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <ShoppingBag className={`w-4 h-4 mt-0.5 shrink-0 ${data.role === 'USER' ? 'text-purple-600' : 'text-slate-400'}`} />
                            <div>
                                <p className="text-xs font-bold leading-tight">Customer</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Personal shopping</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setData('role', 'RETAILER')}
                            className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition ${
                                data.role === 'RETAILER'
                                    ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-1 ring-purple-600'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <Store className={`w-4 h-4 mt-0.5 shrink-0 ${data.role === 'RETAILER' ? 'text-purple-600' : 'text-slate-400'}`} />
                            <div>
                                <p className="text-xs font-bold leading-tight">Retailer</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Wholesale & store pricing</p>
                            </div>
                        </button>
                    </div>
                    {data.role === 'RETAILER' && (
                        <p className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded-lg mt-2 font-medium">
                            ℹ️ Retailer accounts can browse wholesale catalog. KYC verification is required to place orders.
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <div className="relative mt-1">
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="John Doe"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
                            required
                            autoFocus
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <div className="relative mt-1">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="name@example.com"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
                            required
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700">Password</label>
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

                <div>
                    <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                    <div className="relative mt-1">
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
                            required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm shadow-xs flex items-center justify-center gap-2 transition duration-150 disabled:opacity-50 mt-2"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Free Account</span>
                </button>

                <p className="text-center text-xs text-slate-500 pt-3">
                    Already registered?{' '}
                    <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-700">
                        Sign In
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}

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
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <div className="relative mt-1">
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
                            required
                            autoFocus
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm shadow-xs flex items-center justify-center gap-2 transition duration-150 disabled:opacity-50"
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Security Password</span>
                </button>
            </form>
        </GuestLayout>
    );
}

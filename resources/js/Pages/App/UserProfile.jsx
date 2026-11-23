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

            <div className="bg-white rounded-xl border border-slate-100 p-6 max-w-xl shadow-xs">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-700">Full Name</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                required
                            />
                            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                        {errors.name && <p className="text-[10px] text-rose-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700">Email Address</label>
                        <div className="relative mt-1">
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                required
                            />
                            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                        {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                        <div className="relative mt-1">
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                        {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700">New Password (leave blank to keep)</label>
                        <div className="relative mt-1">
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                placeholder="••••••••"
                            />
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                        {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password}</p>}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition shadow-xs"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import React from 'react';
import { useForm } from '@inertiajs/react';
import { User, Lock, Mail, Phone, Check } from 'lucide-react';

export default function ProfileEditor({ user }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
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
        <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Account Credentials</h3>
            <p className="text-xs text-slate-400 mb-5">Update your personal contact details and security credentials.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <div className="relative mt-1">
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
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
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
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
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="10-digit mobile number"
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                <div className="pt-2 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-700">
                        New Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>
                    </label>
                    <div className="relative mt-1">
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                        {processing ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                    {recentlySuccessful && (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved successfully</span>
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}


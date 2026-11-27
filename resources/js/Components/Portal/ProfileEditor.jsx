import React, { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Building2,
    Camera,
    Check,
    Clock,
    Coins,
    Crown,
    Eye,
    EyeOff,
    Lock,
    Mail,
    MapPin,
    Package,
    Phone,
    ShieldCheck,
    User,
} from 'lucide-react';

export default function ProfileEditor({ user: propUser }) {
    const { auth } = usePage().props;
    const user = propUser || auth?.user || {};
    const isRetailer = Boolean(user?.is_retailer);
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        avatar: null,
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('avatar', file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('password', '');
                setData('avatar', null);
            },
        });
    };

    const existingAvatarSrc = user?.profile_pic
        ? (user.profile_pic.startsWith('http') || user.profile_pic.startsWith('/') ? user.profile_pic : `/storage/${user.profile_pic}`)
        : null;
    const displayAvatarSrc = avatarPreview || existingAvatarSrc;

    const initials = (user?.name || 'U')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    const kycStatus = (user?.kyc_status || 'UNSUBMITTED').toUpperCase();
    const kycBadge = {
        VERIFIED: { label: 'KYC Verified', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        APPROVED: { label: 'KYC Verified', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        PENDING: { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
        REJECTED: { label: 'KYC Rejected', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
        UNSUBMITTED: { label: 'Not Submitted', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    }[kycStatus] || { label: kycStatus, cls: 'bg-slate-100 text-slate-600 border-slate-200' };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Profile Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-2xl border border-purple-100 bg-purple-50 text-purple-700 flex items-center justify-center text-lg font-black overflow-hidden">
                            {displayAvatarSrc ? (
                                <img
                                    src={displayAvatarSrc}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{initials || 'U'}</span>
                            )}
                        </div>
                        <label
                            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-700 text-white border-2 border-white flex items-center justify-center shadow-xs cursor-pointer transition"
                            title="Change profile picture"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                                {isRetailer ? 'Retailer Partner' : 'Customer'}
                            </span>
                            {user?.is_member && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                    <Crown className="w-3 h-3" />
                                    Member
                                </span>
                            )}
                        </div>
                        <h2 className="text-base font-bold text-slate-900 truncate">{user?.name || 'User'}</h2>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        {user?.phone && (
                            <p className="text-xs text-slate-500 font-mono mt-0.5">+91 {user.phone}</p>
                        )}
                    </div>
                </div>

                <div>

                    {/* Account Highlights */}
                    <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                        <Link
                            href={route('loyalty.index')}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 hover:bg-purple-50 border border-purple-100 transition"
                        >
                            <span className="flex items-center gap-2 text-xs font-semibold text-purple-900">
                                <Coins className="w-4 h-4 text-purple-600" />
                                Loyalty Points
                            </span>
                            <span className="text-xs font-extrabold text-purple-700">
                                {Number(user?.loyalty_points || 0).toLocaleString()} pts
                            </span>
                        </Link>

                        {isRetailer && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                        Business KYC
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${kycBadge.cls}`}>
                                        {kycBadge.label}
                                    </span>
                                </div>
                                {user?.shop_name && (
                                    <p className="text-xs font-semibold text-slate-800 truncate">{user.shop_name}</p>
                                )}
                                {user?.gst_number && (
                                    <p className="text-[11px] text-slate-500 font-mono">GSTIN: {user.gst_number}</p>
                                )}
                                <Link
                                    href={route('applytoretailer')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700"
                                >
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    <span>View / Update KYC Details →</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Navigation */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                        <Link
                            href={route(isRetailer ? 'retailer.orders' : 'myorders')}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200/80 hover:border-purple-200 hover:bg-purple-50/40 text-xs font-semibold text-slate-700 transition"
                        >
                            <Package className="w-3.5 h-3.5 text-purple-600" />
                            <span>My Orders</span>
                        </Link>
                        <Link
                            href={route(isRetailer ? 'retailer.addresses' : 'myaddresses')}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200/80 hover:border-purple-200 hover:bg-purple-50/40 text-xs font-semibold text-slate-700 transition"
                        >
                            <MapPin className="w-3.5 h-3.5 text-purple-600" />
                            <span>Addresses</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Column: Account & Security Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Account Credentials</h3>
                        <p className="text-xs text-slate-400">
                            Update your personal contact details and login password.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border bg-white text-slate-900 outline-none transition ${
                                        errors.name
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                                            : 'border-slate-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                                    }`}
                                />
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                            {errors.name && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email"
                                    className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border bg-white text-slate-900 outline-none transition ${
                                        errors.email
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                                            : 'border-slate-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                                    }`}
                                />
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                            {errors.email && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border bg-white text-slate-900 outline-none font-mono transition ${
                                        errors.phone
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                                            : 'border-slate-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                                    }`}
                                />
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                            {errors.phone && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                            <label className="block text-xs font-semibold text-slate-700">
                                New Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="At least 6 characters"
                                    className={`w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border bg-white text-slate-900 outline-none transition ${
                                        errors.password
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                                            : 'border-slate-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                                    }`}
                                />
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password}</p>}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
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
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Changes apply immediately
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}

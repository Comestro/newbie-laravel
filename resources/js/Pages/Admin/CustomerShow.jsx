import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import UserOrderHistory from '../../Components/Admin/UserOrderHistory';
import UserLoyaltyMembershipCard from '../../Components/Admin/UserLoyaltyMembershipCard';
import { ArrowLeft, Coins, Crown, Mail, MapPin, Phone, User } from 'lucide-react';

export default function CustomerShow({ customer, orders = [], loyaltyTransactions = [] }) {
    const toggleActive = () => {
        router.post(route('admin.customers.toggle-active', customer.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout
            title={`Customer: ${customer.name}`}
            subtitle="View customer profile, saved addresses, and order history"
            action={
                <Link
                    href={route('admin.customers')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Customers</span>
                </Link>
            }
        >
            <Head title={`${customer.name} - Admin Console`} />

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Customer Details */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-600" />
                                <span>Customer Information</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                        customer.is_active
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-rose-50 text-rose-700'
                                    }`}
                                >
                                    {customer.is_active ? 'Active' : 'Disabled'}
                                </span>
                                <button
                                    type="button"
                                    onClick={toggleActive}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                                        customer.is_active
                                            ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                    }`}
                                >
                                    {customer.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <User className="w-3 h-3" /> Full Name
                                </span>
                                <p className="font-bold text-slate-900 mt-1">{customer.name}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> Email Address
                                </span>
                                <p className="font-semibold text-slate-800 mt-1">{customer.email}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> Phone Number
                                </span>
                                <p className="font-semibold text-slate-800 font-mono mt-1">{customer.phone || 'Not provided'}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                        <Coins className="w-3 h-3" /> Loyalty &amp; Membership
                                    </span>
                                    <p className="font-bold text-purple-700 mt-1">
                                        {Number(customer.loyalty_points || 0).toLocaleString()} pts
                                    </p>
                                </div>
                                {customer.is_member && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                        <Crown className="w-3 h-3" /> Member
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Saved Addresses */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-3">
                        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span>Saved Addresses ({customer.addresses?.length || 0})</span>
                        </h2>

                        {!customer.addresses || customer.addresses.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">No saved addresses.</p>
                        ) : (
                            <div className="space-y-2.5">
                                {customer.addresses.map((addr) => (
                                    <div key={addr.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs space-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-900">{addr.label || 'Address'}</span>
                                            {addr.is_default && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600">
                                            {addr.line1}
                                            {addr.line2 ? `, ${addr.line2}` : ''}
                                        </p>
                                        <p className="text-slate-500">
                                            {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Membership & Loyalty Points */}
                <UserLoyaltyMembershipCard user={customer} transactions={loyaltyTransactions} />

                {/* Order History */}
                <UserOrderHistory orders={orders} />
            </div>
        </AdminLayout>
    );
}


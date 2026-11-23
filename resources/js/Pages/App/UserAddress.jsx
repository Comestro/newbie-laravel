import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function UserAddress({ addresses = [] }) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: null,
        label: 'Home',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        is_default: false,
    });

    const openCreate = () => {
        reset();
        setIsEditing(true);
    };

    const openEdit = (addr) => {
        setData({
            id: addr.id,
            label: addr.label,
            line1: addr.line1,
            line2: addr.line2 || '',
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            phone: addr.phone,
            is_default: Boolean(addr.is_default),
        });
        setIsEditing(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/my-addresses', {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this address?')) {
            router.delete(`/my-addresses/${id}`, { preserveScroll: true });
        }
    };

    const handleSetDefault = (id) => {
        router.post(`/my-addresses/${id}/default`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout title="Saved Addresses" subtitle="Manage your delivery destinations">
            <Head title="My Addresses - Newbie Service" />

            <div className="space-y-6">
                {!isEditing && (
                    <div className="flex justify-end">
                        <button
                            onClick={openCreate}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Address</span>
                        </button>
                    </div>
                )}

                {isEditing ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm max-w-xl">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                            {data.id ? 'Edit Address' : 'New Address'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Label</label>
                                    <input
                                        type="text"
                                        value={data.label}
                                        onChange={(e) => setData('label', e.target.value)}
                                        placeholder="Home, Office, Shop..."
                                        className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Phone</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Address Line 1</label>
                                <input
                                    type="text"
                                    value={data.line1}
                                    onChange={(e) => setData('line1', e.target.value)}
                                    className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">City</label>
                                    <input
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">State</label>
                                    <input
                                        type="text"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Pincode</label>
                                    <input
                                        type="text"
                                        value={data.pincode}
                                        onChange={(e) => setData('pincode', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={data.is_default}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_default" className="text-xs text-gray-700 dark:text-gray-300">
                                    Set as default delivery address
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
                                >
                                    Save Address
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 shadow-xs flex flex-col justify-between"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md">
                                            {addr.label}
                                        </span>
                                        {addr.is_default && (
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white pt-2">
                                        {addr.line1}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                    <p className="text-xs text-gray-400 pt-1">Phone: {addr.phone}</p>
                                </div>

                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => openEdit(addr)}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {!addr.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(addr.id)}
                                            className="text-xs text-gray-500 hover:text-gray-800"
                                        >
                                            Set as Default
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}


import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import ConfirmModal from '../../Components/ConfirmModal';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export default function UserAddress({ addresses = [] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        label: '',
        loading: false,
    });

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

    const openDeleteModal = (id, label) => {
        setDeleteModal({
            isOpen: true,
            id,
            label,
            loading: false,
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.id) return;
        setDeleteModal((prev) => ({ ...prev, loading: true }));
        router.delete(`/my-addresses/${deleteModal.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteModal({ isOpen: false, id: null, label: '', loading: false });
            },
        });
    };

    return (
        <AppLayout title="My Addresses" subtitle="Manage your saved delivery locations">
            <Head title="Saved Addresses - Newbie Service" />

            <div className="space-y-4">
                <div className="flex justify-end">
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Address</span>
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 mb-3.5">
                            {data.id ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                    Label / Type
                                </label>
                                <select
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                >
                                    <option value="Home">Home</option>
                                    <option value="Office">Office</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="10 digit mobile"
                                    className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    required
                                />
                                {errors.phone && <p className="text-rose-500 text-[10px] mt-0.5">{errors.phone}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                    Flat / House / Floor
                                </label>
                                <input
                                    type="text"
                                    value={data.line1}
                                    onChange={(e) => setData('line1', e.target.value)}
                                    placeholder="House 42, Floor 2"
                                    className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    required
                                />
                                {errors.line1 && <p className="text-rose-500 text-[10px] mt-0.5">{errors.line1}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                    Landmark / Street (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.line2}
                                    onChange={(e) => setData('line2', e.target.value)}
                                    placeholder="Opposite City Mall"
                                    className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">City</label>
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">State</label>
                                <input
                                    type="text"
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                    className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pincode</label>
                                <input
                                    type="text"
                                    value={data.pincode}
                                    onChange={(e) => setData('pincode', e.target.value)}
                                    className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-5">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={data.is_default}
                                        onChange={(e) => setData('is_default', e.target.checked)}
                                        className="rounded accent-purple-600"
                                    />
                                    <span>Set as default address</span>
                                </label>
                            </div>

                            <div className="sm:col-span-2 flex gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition"
                                >
                                    {data.id ? 'Save Changes' : 'Create Address'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        reset();
                                    }}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {addresses.length === 0 ? (
                            <div className="sm:col-span-2 bg-white rounded-xl border border-slate-100 p-12 text-center shadow-xs">
                                <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <h3 className="font-bold text-sm text-slate-800">No addresses saved</h3>
                                <p className="text-xs text-slate-400 mt-1">Add a delivery address to place orders faster.</p>
                            </div>
                        ) : (
                            addresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                                <span>{addr.label}</span>
                                                {addr.is_default && (
                                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(addr)}
                                                    className="text-xs text-purple-600 hover:underline font-semibold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteModal(addr.id, addr.label)}
                                                    className="text-slate-400 hover:text-rose-600"
                                                    title="Delete Address"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600">
                                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">📞 {addr.phone}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Address"
                message={
                    <span>
                        Are you sure you want to delete <strong className="text-slate-800 font-semibold">"{deleteModal.label || 'this address'}"</strong>?
                    </span>
                }
                confirmText="Delete Address"
                variant="danger"
                loading={deleteModal.loading}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ isOpen: false, id: null, label: '', loading: false })}
            />
        </AppLayout>
    );
}

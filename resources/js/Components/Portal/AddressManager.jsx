import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import ConfirmModal from '../ConfirmModal';
import AddressFormFields from './AddressFormFields';
import { MapPin, Plus, Trash2, Edit3, Check, Store, Home } from 'lucide-react';

export default function AddressManager({ addresses = [], isRetailer = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        label: '',
        loading: false,
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        id: null,
        label: isRetailer ? 'Shop' : 'Home',
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

    const handleSetDefault = (id) => {
        router.post(`/my-addresses/${id}/default`, {}, { preserveScroll: true });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                {!isEditing && (
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Address</span>
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-3.5">
                        {data.id ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <form onSubmit={handleSubmit} noValidate className="space-y-3.5 max-w-xl">
                        <AddressFormFields
                            data={data}
                            setData={setData}
                            errors={errors}
                            showLabel={true}
                            showPhone={true}
                            isRetailer={isRetailer}
                        />

                        <div className="pt-1">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_default}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                    className="accent-purple-600 rounded"
                                />
                                <span>Set as default delivery address</span>
                            </label>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Saving...' : 'Save Address'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    reset();
                                }}
                                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            {/* Address Cards */}
            {addresses.length === 0 && !isEditing ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-800">No saved addresses</h3>
                    <p className="text-xs text-slate-400 mt-1">Add your shipping locations for faster checkout.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`p-4 rounded-2xl border bg-white shadow-xs transition space-y-2.5 relative flex flex-col justify-between ${
                                addr.is_default ? 'border-purple-300 ring-1 ring-purple-100' : 'border-slate-100 hover:border-slate-200'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="p-1 rounded-md bg-slate-50 border border-slate-100 text-slate-600">
                                            {addr.label === 'Shop' ? (
                                                <Store className="w-3.5 h-3.5 text-purple-600" />
                                            ) : addr.label === 'Home' ? (
                                                <Home className="w-3.5 h-3.5 text-blue-600" />
                                            ) : (
                                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                            )}
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">{addr.label}</span>
                                        {addr.is_default && (
                                            <span className="px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(addr)}
                                            className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                                            title="Edit address"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openDeleteModal(addr.id, addr.label)}
                                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                            title="Delete address"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {addr.line1}
                                    {addr.line2 ? `, ${addr.line2}` : ''}
                                    <br />
                                    {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                {addr.phone && (
                                    <p className="text-[11px] text-slate-400 mt-1">Phone: {addr.phone}</p>
                                )}
                            </div>

                            {!addr.is_default && (
                                <button
                                    type="button"
                                    onClick={() => handleSetDefault(addr.id)}
                                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 pt-2 border-t border-slate-100 cursor-pointer"
                                >
                                    <Check className="w-3 h-3" />
                                    <span>Set as Default</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, label: '', loading: false })}
                onConfirm={handleConfirmDelete}
                title="Delete Address"
                message={`Are you sure you want to delete "${deleteModal.label}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                loading={deleteModal.loading}
            />
        </div>
    );
}


import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Context/CartContext';

export default function Checkout({ addresses = [], deliveryCharge = 15 }) {
    const { auth } = usePage().props;
    const { items, subtotal } = useCart();
    const grandTotal = subtotal + deliveryCharge;

    const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];
    const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id || null);
    const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        label: 'Home',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: true,
    });

    const handleEditAddress = (addr) => {
        setEditingAddressId(addr.id);
        setData({
            label: addr.label || 'Home',
            phone: addr.phone || '',
            line1: addr.line1 || '',
            line2: addr.line2 || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            is_default: addr.is_default || false,
        });
        setShowAddressForm(true);
    };

    const handleAddNewAddress = () => {
        setEditingAddressId(null);
        reset();
        setShowAddressForm(true);
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        if (editingAddressId) {
            router.put(`/my-addresses/${editingAddressId}`, data, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAddressForm(false);
                    setEditingAddressId(null);
                    reset();
                },
            });
        } else {
            post('/my-addresses', {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAddressForm(false);
                    reset();
                },
            });
        }
    };

    const handlePlaceOrder = () => {
        if (!selectedAddressId) {
            alert('Please select or add a delivery address.');
            return;
        }

        router.post('/checkout', {
            address_id: selectedAddressId,
        });
    };

    return (
        <ShopLayout>
            <Head title="Checkout - Newbie Service" />

            <div className="min-h-screen bg-gray-50 dark:bg-black/40 py-8">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT SECTION */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Delivery Address</h2>
                            </div>

                            <div className="space-y-3">
                                {/* Address List */}
                                {!showAddressForm && (
                                    <>
                                        {addresses.length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                    No saved address found
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleAddNewAddress}
                                                    className="inline-flex items-center gap-2 text-sm font-bold text-[#A855F7] hover:underline"
                                                >
                                                    + Add New Address
                                                </button>
                                            </div>
                                        ) : (
                                            addresses.map((address) => (
                                                <div
                                                    key={address.id}
                                                    className={`group flex items-start justify-between gap-4 p-5 rounded-xl border transition ${
                                                        selectedAddressId === address.id
                                                            ? 'border-[#A855F7] bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/40 dark:hover:bg-purple-900/10'
                                                    }`}
                                                >
                                                    {/* LEFT */}
                                                    <label className="flex gap-4 cursor-pointer flex-1">
                                                        <input
                                                            type="radio"
                                                            name="delivery_address"
                                                            value={address.id}
                                                            checked={selectedAddressId === address.id}
                                                            onChange={() => setSelectedAddressId(address.id)}
                                                            className="mt-1 accent-[#A855F7]"
                                                        />

                                                        <div className="text-sm leading-relaxed">
                                                            <p className="font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                                {auth?.user?.name || 'Customer'}
                                                                {/* Home / Office badge */}
                                                                <span
                                                                    className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${
                                                                        address.label === 'Home'
                                                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                                    }`}
                                                                >
                                                                    {address.label}
                                                                </span>
                                                            </p>

                                                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                                {address.line1}
                                                                {address.line2 ? `, ${address.line2}` : ''}
                                                            </p>

                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                {address.city}, {address.state} - {address.pincode}
                                                            </p>

                                                            <p className="mt-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                                📞 {address.phone}
                                                            </p>
                                                        </div>
                                                    </label>

                                                    {/* RIGHT */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditAddress(address)}
                                                        className="text-xs font-extrabold text-[#A855F7] opacity-70 group-hover:opacity-100 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            ))
                                        )}

                                        {addresses.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleAddNewAddress}
                                                className="text-sm font-bold text-purple-600 hover:text-purple-700"
                                            >
                                                + Add New Address
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Add / Edit Form */}
                                {showAddressForm && (
                                    <form onSubmit={handleSaveAddress} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Address Type */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                Address Type
                                            </label>
                                            <select
                                                value={data.label}
                                                onChange={(e) => setData('label', e.target.value)}
                                                className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-[#A855F7] focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                                            >
                                                <option value="Home">Home</option>
                                                <option value="Office">Office</option>
                                            </select>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="10 digit mobile number"
                                                className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#A855F7] focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>

                                        {/* Address Line 1 */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                House / Flat / Block No.
                                            </label>
                                            <input
                                                type="text"
                                                value={data.line1}
                                                onChange={(e) => setData('line1', e.target.value)}
                                                placeholder="Flat 101, Galaxy Apartments"
                                                className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#A855F7] focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                                            />
                                            {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1}</p>}
                                        </div>

                                        {/* Address Line 2 */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                Landmark / Area (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.line2}
                                                onChange={(e) => setData('line2', e.target.value)}
                                                placeholder="Near Central Park"
                                                className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#A855F7] focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                                            />
                                        </div>

                                        {/* City */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                placeholder="City"
                                                className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#A855F7] focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                                            />
                                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                        </div>

                                        {/* State */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                                placeholder="State"
                                                className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#A855F7] focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                                            />
                                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                        </div>

                                        {/* Pincode */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                Pincode
                                            </label>
                                            <input
                                                type="text"
                                                value={data.pincode}
                                                onChange={(e) => setData('pincode', e.target.value)}
                                                placeholder="6 digit pincode"
                                                className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#A855F7] focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                                            />
                                            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="md:col-span-2 flex gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] text-white py-2.5 rounded-lg font-bold transition active:scale-[0.98] shadow"
                                            >
                                                {editingAddressId ? 'Update Address' : 'Save Address'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddressForm(false);
                                                    setEditingAddressId(null);
                                                }}
                                                className="flex-1 border border-gray-300 dark:border-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-4">Order Items</h2>
                            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.map((item) => (
                                    <li key={item.id} className="flex gap-4 py-4">
                                        <div className="w-16 h-16 rounded-lg object-cover border border-gray-100 dark:border-gray-700 bg-gray-50 flex items-center justify-center overflow-hidden">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl">📦</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">
                                                {item.name ? item.name.split(' - ')[0] : ''}
                                            </p>
                                            <p className="text-xs text-gray-500">{item.unit_size}</p>
                                            <p className="font-bold mt-1">₹{item.price}</p>
                                        </div>
                                        <div className="text-sm font-bold">
                                            × {item.quantity}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Payment */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                                <input type="radio" checked readOnly className="accent-purple-600" />
                                <span className="font-bold text-sm">Cash on Delivery (Dummy)</span>
                            </label>
                        </div>
                    </div>

                    {/* RIGHT SUMMARY */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 h-fit sticky top-6">
                        <h2 className="text-lg font-bold mb-4">Price Details</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Items Total</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between text-gray-500">
                                <span>Delivery</span>
                                <span>₹{deliveryCharge}</span>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between text-base font-extrabold text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {selectedAddressId ? (
                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                className="w-full mt-6 bg-[#A855F7] hover:bg-[#9333EA] text-white py-3 rounded-xl font-bold transition"
                            >
                                Place Order
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full mt-6 bg-[#312041] hover:bg-[#3c2f47] cursor-not-allowed text-white py-3 rounded-xl font-bold transition"
                            >
                                Place Order
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}

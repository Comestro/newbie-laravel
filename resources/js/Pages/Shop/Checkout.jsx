import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Context/CartContext';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { ShieldAlert, Clock, AlertCircle, CreditCard, Banknote, Coins, Crown, Ticket, X } from 'lucide-react';

export default function Checkout({ addresses = [], deliveryCharge = 15 }) {
    const { auth, loyaltyConfig = {} } = usePage().props;
    const isRetailer = Boolean(auth?.user?.is_retailer);
    const isKycApproved = Boolean(auth?.user?.is_kyc_approved);
    const needsMembership = Boolean(auth?.user?.needs_membership);
    const canPlaceOrder = (!isRetailer || isKycApproved) && !needsMembership;

    const { items, subtotal } = useCart();
    const rawTotal = subtotal + deliveryCharge;

    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount || 0) : 0;
    const afterCouponTotal = Math.max(0, rawTotal - couponDiscount);

    const userPoints = Number(auth?.user?.loyalty_points || 0);
    const pointsPerRupee = Math.max(1, Number(loyaltyConfig?.points_per_rupee || 100));
    const maxUsablePoints = Math.min(userPoints, Math.floor(afterCouponTotal * pointsPerRupee));

    const [usePoints, setUsePoints] = useState(false);
    const [pointsToUse, setPointsToUse] = useState(maxUsablePoints);

    const activePointsUsed = usePoints
        ? Math.max(0, Math.min(Number(pointsToUse) || 0, maxUsablePoints))
        : 0;
    const pointsDiscount = Number((activePointsUsed / pointsPerRupee).toFixed(2));
    const grandTotal = Math.max(0, Number((afterCouponTotal - pointsDiscount).toFixed(2)));

    const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];
    const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id || null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [placingOrder, setPlacingOrder] = useState(false);
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

    const loadRazorpayScript = () => {
        if (window.Razorpay) return Promise.resolve(true);
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponInput.trim()) return;
        setApplyingCoupon(true);
        try {
            const { data } = await axios.post('/checkout/coupon', { code: couponInput.trim() });
            setAppliedCoupon(data);
            toast.success(data.message || `Coupon ${data.code} applied!`);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Invalid coupon code.');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponInput('');
    };

    const handlePlaceOrder = async () => {
        if (needsMembership) {
            toast.error('Please activate your membership plan before placing an order.');
            return;
        }

        if (!canPlaceOrder) {
            toast.error('Retailer KYC approval is required before you can place orders.');
            return;
        }

        if (!selectedAddressId) {
            toast.error('Please select or add a delivery address.');
            return;
        }

        if (paymentMethod === 'COD' || grandTotal <= 0) {
            setPlacingOrder(true);
            router.post('/checkout', {
                address_id: selectedAddressId,
                payment_method: 'COD',
                points_to_use: activePointsUsed,
                coupon_code: appliedCoupon?.code || null,
            }, {
                onFinish: () => setPlacingOrder(false),
            });
            return;
        }

        setPlacingOrder(true);
        try {
            const { data: orderData } = await axios.post('/checkout/razorpay-order', {
                address_id: selectedAddressId,
                points_to_use: activePointsUsed,
                coupon_code: appliedCoupon?.code || null,
            });

            if (orderData.free) {
                router.post('/checkout', {
                    address_id: selectedAddressId,
                    payment_method: 'COD',
                    points_to_use: activePointsUsed,
                    coupon_code: appliedCoupon?.code || null,
                }, {
                    onFinish: () => setPlacingOrder(false),
                });
                return;
            }

            const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

            await openRazorpayCheckout({
                orderData,
                description: 'Order Payment',
                prefill: {
                    name: auth?.user?.name || '',
                    email: auth?.user?.email || '',
                    contact: selectedAddress?.phone || auth?.user?.phone || '',
                },
                onDismiss: () => setPlacingOrder(false),
                onFailure: (msg) => {
                    toast.error(msg);
                    setPlacingOrder(false);
                },
                onSuccess: (response) => {
                    router.post('/checkout', {
                        address_id: selectedAddressId,
                        payment_method: 'ONLINE',
                        points_to_use: activePointsUsed,
                        coupon_code: appliedCoupon?.code || null,
                        ...response,
                    }, {
                        onFinish: () => setPlacingOrder(false),
                    });
                },
            });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Unable to start payment. Please try again.');
            setPlacingOrder(false);
        }
    };

    return (
        <ShopLayout>
            <Head title="Checkout - Newbie Service" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Membership Required Notice Banner */}
                {needsMembership && (
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex items-start gap-3 shadow-xs">
                        <Crown className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold text-xs text-purple-950">Monthly Membership Required</p>
                            <p className="text-[11px] text-purple-800 mt-0.5">
                                Pay <span className="font-bold">₹{loyaltyConfig.membership_fee ?? 49}/month</span> to keep your membership active to place orders and receive{' '}
                                <span className="font-bold">
                                    {(auth?.user?.membership_paid_at
                                        ? Math.round(Number(loyaltyConfig.membership_fee ?? 49) * Number(loyaltyConfig.points_per_rupee ?? 100))
                                        : Number(loyaltyConfig.membership_bonus_points ?? 5000)
                                    ).toLocaleString()}{' '}
                                    loyalty points
                                </span>{' '}
                                instantly.
                            </p>
                            <Link
                                href="/loyalty"
                                className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition"
                            >
                                Activate Membership &rarr;
                            </Link>
                        </div>
                    </div>
                )}

                {/* Retailer KYC Notice Banner */}
                {isRetailer && !isKycApproved && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold text-xs text-amber-900">Retailer KYC Approval Required</p>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                                {auth?.user?.apply_status === 'REJECTED'
                                    ? `Your KYC application was rejected (${auth?.user?.kyc_reject_reason || 'Please upload valid documents'}). Please re-submit your documents.`
                                    : auth?.user?.apply_status === 'PENDING'
                                    ? 'Your KYC documents are currently under review by our admin team. You can view products and add items to cart, but order placement will unlock once verified.'
                                    : 'As a retailer, you must submit and receive KYC approval before placing orders.'}
                            </p>
                            <Link
                                href="/apply-to-retailer"
                                className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-purple-700 hover:text-purple-800 underline"
                            >
                                {auth?.user?.apply_status ? 'Check / Resubmit KYC Status' : 'Complete KYC Verification'} &rarr;
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* LEFT SECTION */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                            <div className="flex justify-between items-center mb-3.5">
                                <h2 className="text-base font-bold text-slate-900">Delivery Address</h2>
                                {!showAddressForm && (
                                    <button
                                        type="button"
                                        onClick={handleAddNewAddress}
                                        className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                                    >
                                        + Add New Address
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                {!showAddressForm && (
                                    <>
                                        {addresses.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-xs text-slate-500 mb-2">No saved addresses found.</p>
                                                <button
                                                    type="button"
                                                    onClick={handleAddNewAddress}
                                                    className="text-xs font-bold text-purple-600"
                                                >
                                                    + Add Delivery Address
                                                </button>
                                            </div>
                                        ) : (
                                            addresses.map((address) => (
                                                <div
                                                    key={address.id}
                                                    className={`group flex items-start justify-between gap-3 p-3.5 rounded-xl border transition ${
                                                        selectedAddressId === address.id
                                                            ? 'border-purple-400 bg-purple-50/40'
                                                            : 'border-slate-200/80 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    <label className="flex gap-3 cursor-pointer flex-1">
                                                        <input
                                                            type="radio"
                                                            name="delivery_address"
                                                            value={address.id}
                                                            checked={selectedAddressId === address.id}
                                                            onChange={() => setSelectedAddressId(address.id)}
                                                            className="mt-1 accent-purple-600"
                                                        />

                                                        <div className="text-xs leading-relaxed">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-slate-900">{auth?.user?.name}</span>
                                                                <span
                                                                    className={`text-[9px] uppercase font-bold tracking-wide px-1.5 py-0.2 rounded ${
                                                                        address.label === 'Home'
                                                                            ? 'bg-purple-100 text-purple-700'
                                                                            : address.label === 'Shop'
                                                                            ? 'bg-emerald-100 text-emerald-700'
                                                                            : 'bg-blue-100 text-blue-700'
                                                                    }`}
                                                                >
                                                                    {address.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-600">
                                                                {address.line1}{address.line2 ? `, ${address.line2}` : ''}
                                                            </p>
                                                            <p className="text-slate-600">
                                                                {address.city}, {address.state} - {address.pincode}
                                                            </p>
                                                            <p className="mt-1 font-medium text-slate-500">
                                                                📞 {address.phone}
                                                            </p>
                                                        </div>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditAddress(address)}
                                                        className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}

                                {/* Form */}
                                {showAddressForm && (
                                    <form onSubmit={handleSaveAddress} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                                Address Type
                                            </label>
                                            <select
                                                value={data.label}
                                                onChange={(e) => setData('label', e.target.value)}
                                                className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            >
                                                <option value="Home">Home</option>
                                                <option value="Shop">Shop</option>
                                                <option value="Office">Office</option>
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
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                                Flat / House / Block
                                            </label>
                                            <input
                                                type="text"
                                                value={data.line1}
                                                onChange={(e) => setData('line1', e.target.value)}
                                                placeholder="Flat 101, Galaxy"
                                                className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                                Landmark / Area (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.line2}
                                                onChange={(e) => setData('line2', e.target.value)}
                                                placeholder="Near Green Park"
                                                className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                placeholder="City"
                                                className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                                placeholder="State"
                                                className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                                Pincode
                                            </label>
                                            <input
                                                type="text"
                                                value={data.pincode}
                                                onChange={(e) => setData('pincode', e.target.value)}
                                                placeholder="6 digits"
                                                className="w-full rounded-lg px-2.5 py-1.5 text-xs border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div className="sm:col-span-2 flex gap-2 pt-2">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold text-xs transition"
                                            >
                                                {editingAddressId ? 'Update Address' : 'Save Address'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddressForm(false);
                                                    setEditingAddressId(null);
                                                }}
                                                className="flex-1 border border-slate-200 py-2 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                            <h2 className="text-base font-bold text-slate-900 mb-3">Order Items</h2>
                            <ul className="divide-y divide-slate-100">
                                {items.map((item) => (
                                    <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                                        <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg">📦</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-xs text-slate-900">
                                                {item.name ? item.name.split(' - ')[0] : ''}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{item.unit_size}</p>
                                            <p className="font-bold text-xs text-slate-900 mt-1">₹{item.price}</p>
                                        </div>
                                        <div className="text-xs font-semibold text-slate-600">
                                            × {item.quantity}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Apply Coupon */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
                            <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-purple-600" />
                                <h2 className="text-base font-bold text-slate-900">Apply Coupon</h2>
                            </div>

                            {appliedCoupon ? (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                                    <div>
                                        <span className="font-mono font-bold text-xs text-emerald-800">{appliedCoupon.code}</span>
                                        <span className="text-xs text-emerald-700 ml-2">
                                            (-₹{Number(appliedCoupon.discount).toFixed(2)} saved)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"
                                        aria-label="Remove coupon"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        placeholder="Enter promo code (e.g. SAVE20)"
                                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={applyingCoupon || !couponInput.trim()}
                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                                    >
                                        {applyingCoupon ? 'Applying...' : 'Apply'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Loyalty Points Redemption */}
                        {userPoints > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-amber-500" />
                                        <h2 className="text-base font-bold text-slate-900">Use Loyalty Points</h2>
                                    </div>
                                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                                        Available: {userPoints.toLocaleString()} pts (₹{(userPoints / pointsPerRupee).toFixed(2)})
                                    </span>
                                </div>

                                <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={usePoints}
                                            onChange={(e) => {
                                                setUsePoints(e.target.checked);
                                                if (e.target.checked) setPointsToUse(maxUsablePoints);
                                            }}
                                            className="rounded accent-purple-600"
                                        />
                                        <span className="text-xs font-semibold text-slate-800">
                                            Redeem points on this order ({pointsPerRupee} pts = ₹1)
                                        </span>
                                    </div>
                                    {usePoints && (
                                        <span className="text-xs font-bold text-emerald-600">-₹{pointsDiscount.toFixed(2)}</span>
                                    )}
                                </label>

                                {usePoints && (
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs text-slate-500 font-medium">Points to apply:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={maxUsablePoints}
                                            value={pointsToUse}
                                            onChange={(e) => setPointsToUse(Math.max(0, Math.min(Number(e.target.value) || 0, maxUsablePoints)))}
                                            className="w-32 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-900"
                                        />
                                        <span className="text-[11px] text-slate-400">Max: {maxUsablePoints.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-2.5">
                            <h2 className="text-base font-bold text-slate-900 mb-3">Payment Method</h2>

                            <label
                                onClick={() => setPaymentMethod('COD')}
                                className={`flex items-center justify-between gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                                    paymentMethod === 'COD'
                                        ? 'border-purple-500 bg-purple-50/40'
                                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        checked={paymentMethod === 'COD'}
                                        onChange={() => setPaymentMethod('COD')}
                                        className="accent-purple-600"
                                    />
                                    <div>
                                        <span className="font-semibold text-xs text-slate-900 block">Cash on Delivery</span>
                                        <span className="text-[11px] text-slate-400">Pay with cash when your order arrives</span>
                                    </div>
                                </div>
                                <Banknote className="w-4 h-4 text-slate-500" />
                            </label>

                            <label
                                onClick={() => setPaymentMethod('ONLINE')}
                                className={`flex items-center justify-between gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                                    paymentMethod === 'ONLINE'
                                        ? 'border-purple-500 bg-purple-50/40'
                                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        checked={paymentMethod === 'ONLINE'}
                                        onChange={() => setPaymentMethod('ONLINE')}
                                        className="accent-purple-600"
                                    />
                                    <div>
                                        <span className="font-semibold text-xs text-slate-900 block">Pay Online (Razorpay)</span>
                                        <span className="text-[11px] text-slate-400">UPI, Debit / Credit Card, NetBanking</span>
                                    </div>
                                </div>
                                <CreditCard className="w-4 h-4 text-purple-600" />
                            </label>
                        </div>
                    </div>

                    {/* RIGHT SUMMARY */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-20 shadow-xs">
                        <h2 className="text-base font-bold text-slate-900 mb-3.5">Price Summary</h2>

                        <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span>Items Total</span>
                                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className="font-semibold text-slate-900">₹{deliveryCharge}</span>
                            </div>

                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Coupon ({appliedCoupon.code})</span>
                                    <span className="font-semibold">-₹{couponDiscount.toFixed(2)}</span>
                                </div>
                            )}

                            {pointsDiscount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Loyalty Discount ({activePointsUsed.toLocaleString()} pts)</span>
                                    <span className="font-semibold">-₹{pointsDiscount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-bold text-slate-900">
                                <span>Grand Total</span>
                                <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={!selectedAddressId || !canPlaceOrder || placingOrder}
                            className={`w-full mt-5 py-3 rounded-xl font-bold text-xs transition shadow-xs ${
                                selectedAddressId && canPlaceOrder && !placingOrder
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {needsMembership
                                ? 'Membership Required to Place Order'
                                : !canPlaceOrder
                                ? 'KYC Approval Required to Place Order'
                                : placingOrder
                                ? 'Processing...'
                                : grandTotal <= 0
                                ? 'Place Order (Paid with Points) →'
                                : paymentMethod === 'ONLINE'
                                ? `Pay ₹${grandTotal.toLocaleString()} & Place Order →`
                                : 'Place Order →'}
                        </button>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}

import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AddressFormFields from './AddressFormFields';
import {
    ShieldCheck,
    AlertCircle,
    UploadCloud,
    CheckCircle2,
    Clock,
    Store,
    MapPin,
    FileText,
    Camera,
    Check,
    Edit3,
    Eye,
    Building2,
    Lock,
    X,
} from 'lucide-react';

const parseInitialAddress = (user) => {
    const defaultAddr = user?.addresses?.find((a) => a.is_default) || user?.addresses?.[0];
    if (defaultAddr) {
        return {
            line1: defaultAddr.line1 || '',
            line2: defaultAddr.line2 || '',
            city: defaultAddr.city || '',
            state: defaultAddr.state || '',
            pincode: defaultAddr.pincode || '',
        };
    }
    const raw = user?.shop_address || '';
    if (!raw) return { line1: '', line2: '', city: '', state: '', pincode: '' };

    const pinMatch = raw.match(/(\d{6})/);
    const pincode = pinMatch ? pinMatch[1] : '';
    const withoutPin = raw.replace(/[-,\s]*\b\d{6}\b/, '').trim();
    const parts = withoutPin.split(',').map((p) => p.trim()).filter(Boolean);

    if (parts.length >= 3) {
        return {
            line1: parts[0] || '',
            line2: parts.length > 3 ? parts.slice(1, -2).join(', ') : '',
            city: parts[parts.length - 2] || '',
            state: parts[parts.length - 1] || '',
            pincode,
        };
    }

    return { line1: raw, line2: '', city: '', state: '', pincode };
};

export default function KycManager({ user, isRetailer = false }) {
    const isSubmitted = user?.apply_status === 'PENDING' || user?.apply_status === 'SUBMITTED';
    const isVerified = user?.is_kyc_approved || user?.apply_status === 'VERIFIED';
    const isRejected = user?.apply_status === 'REJECTED';

    const [isEditing, setIsEditing] = useState(!isSubmitted || isRejected);
    const [showAddressPicker, setShowAddressPicker] = useState(false);

    // Image previews
    const [shopImagePreview, setShopImagePreview] = useState(
        user?.shop_image ? `/storage/${user.shop_image}` : null
    );
    const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState(
        user?.aadhaar_card_front ? `/storage/${user.aadhaar_card_front}` : null
    );
    const [aadhaarBackPreview, setAadhaarBackPreview] = useState(
        user?.aadhaar_card_back ? `/storage/${user.aadhaar_card_back}` : null
    );

    const initialAddr = parseInitialAddress(user);

    const { data, setData, post, processing, errors } = useForm({
        shop_name: user?.shop_name || '',
        line1: initialAddr.line1,
        line2: initialAddr.line2,
        city: initialAddr.city,
        state: initialAddr.state,
        pincode: initialAddr.pincode,
        shop_address: user?.shop_address || '',
        gst_number: user?.gst_number || '',
        shop_image: null,
        avatar: null,
        aadhaar_card: user?.aadhaar_card || '',
        aadhaar_front: null,
        aadhaar_back: null,
    });

    const selectExistingAddress = (addr) => {
        setData((prev) => ({
            ...prev,
            line1: addr.line1,
            line2: addr.line2 || '',
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
        }));
        setShowAddressPicker(false);
    };

    const handleFileChange = (field, file) => {
        setData(field, file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (field === 'shop_image') setShopImagePreview(previewUrl);
            if (field === 'aadhaar_front') setAadhaarFrontPreview(previewUrl);
            if (field === 'aadhaar_back') setAadhaarBackPreview(previewUrl);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/apply-to-retailer', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    return (
        <div className="space-y-5 max-w-3xl">
            {/* 1. Status Banners */}
            {isVerified && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 shadow-xs">
                    <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-emerald-900">KYC Verified & Store Approved</h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-800">
                                    Verified Retailer
                                </span>
                            </div>
                            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                                Your store credentials and Aadhaar ID have been successfully verified. You now have full access to wholesale tier pricing and checkout.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isSubmitted && !isVerified && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 shadow-xs">
                    <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-amber-900">Application Under Review</h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-800">
                                    Pending Approval
                                </span>
                            </div>
                            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                Our admin team is currently reviewing your uploaded store details and identity documents. Placing bulk orders will be unlocked as soon as verification completes.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isRejected && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-950 shadow-xs">
                    <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-rose-900">KYC Verification Rejected</h3>
                            <div className="mt-2 p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-900">
                                <strong className="font-semibold block text-[11px] uppercase tracking-wider text-rose-600 mb-0.5">Reason for rejection:</strong>
                                <span>{user?.kyc_reject_reason || 'Please provide clear, legible documents and a valid shop address.'}</span>
                            </div>
                            <p className="text-xs text-rose-700 mt-2">
                                Please correct the highlighted issues below and resubmit your application.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Submitted Information Summary Card (Shown when under review or verified) */}
            {(isSubmitted || isVerified) && !isEditing && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Store className="w-4 h-4 text-purple-600" />
                                <span>Registered Store Profile</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Store details submitted for Newbie retailer partner account</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 text-xs font-semibold text-slate-700 hover:text-purple-600 bg-white hover:bg-purple-50/50 transition cursor-pointer"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Details</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shop Name</span>
                            <p className="font-semibold text-slate-900 text-sm">{user?.shop_name || 'N/A'}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">GST Number (GSTIN)</span>
                            <p className="font-mono font-semibold text-slate-900">
                                {user?.gst_number || <span className="text-slate-400 font-sans font-normal">Not Provided (Unregistered)</span>}
                            </p>
                        </div>

                        <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-purple-600" />
                                <span>Shop Physical Address</span>
                            </span>
                            <p className="text-slate-800 leading-relaxed">{user?.shop_address || 'No physical address provided yet.'}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aadhaar Card Number</span>
                            <p className="font-mono font-semibold text-slate-900">
                                {user?.aadhaar_card ? `XXXX-XXXX-${user.aadhaar_card.slice(-4)}` : 'N/A'}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verification Status</span>
                            <p className="font-semibold text-slate-900">
                                {isVerified ? (
                                    <span className="text-emerald-600 font-bold">Approved</span>
                                ) : isRejected ? (
                                    <span className="text-rose-600 font-bold">Rejected</span>
                                ) : (
                                    <span className="text-amber-600 font-bold">Under Review</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Document Thumbnails Preview */}
                    <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                            Uploaded Documents & Photos
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Shop Front Photo</p>
                                {user?.shop_image ? (
                                    <img
                                        src={`/storage/${user.shop_image}`}
                                        alt="Shop Front"
                                        className="h-28 w-full object-cover rounded-lg border border-slate-200"
                                    />
                                ) : (
                                    <div className="h-28 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                                        <Camera className="w-5 h-5 mb-1" />
                                        <span className="text-[10px]">No shop photo</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Aadhaar Front</p>
                                {user?.aadhaar_card_front ? (
                                    <img
                                        src={`/storage/${user.aadhaar_card_front}`}
                                        alt="Aadhaar Front"
                                        className="h-28 w-full object-cover rounded-lg border border-slate-200"
                                    />
                                ) : (
                                    <div className="h-28 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                                        <FileText className="w-5 h-5 mb-1" />
                                        <span className="text-[10px]">No front image</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Aadhaar Back</p>
                                {user?.aadhaar_card_back ? (
                                    <img
                                        src={`/storage/${user.aadhaar_card_back}`}
                                        alt="Aadhaar Back"
                                        className="h-28 w-full object-cover rounded-lg border border-slate-200"
                                    />
                                ) : (
                                    <div className="h-28 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                                        <FileText className="w-5 h-5 mb-1" />
                                        <span className="text-[10px]">No back image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. The Redesigned Application / Resubmission Form */}
            {isEditing && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-purple-600" />
                                <span>{isRetailer ? 'Retailer Verification & Store Details' : 'Retailer Partner Application'}</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Enter your business credentials and upload Aadhaar ID for wholesale partner approval.
                            </p>
                        </div>
                        {(isSubmitted || isVerified) && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        {/* SECTION 1: Store & Business Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center justify-center">
                                    1
                                </span>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Shop & Business Information
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Shop / Business Name <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.shop_name}
                                            onChange={(e) => setData('shop_name', e.target.value)}
                                            placeholder="e.g. Sharma Provision & General Store"
                                            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition"
                                        />
                                        <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                                    </div>
                                    {errors.shop_name && <p className="text-[10px] text-rose-600 mt-1">{errors.shop_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        GST Number (GSTIN) <span className="text-slate-400 font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.gst_number}
                                            onChange={(e) => setData('gst_number', e.target.value.toUpperCase())}
                                            placeholder="e.g. 08AAAAA0000A1Z5"
                                            maxLength={15}
                                            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none font-mono uppercase transition"
                                        />
                                        <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                                    </div>
                                    {errors.gst_number && <p className="text-[10px] text-rose-600 mt-1">{errors.gst_number}</p>}
                                </div>
                            </div>

                            {/* Shop Physical Address using reusable AddressFormFields */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Shop Physical Address <span className="text-rose-500">*</span></span>
                                    </label>
                                    {user?.addresses && user.addresses.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressPicker(!showAddressPicker)}
                                            className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
                                        >
                                            {showAddressPicker ? 'Hide Saved Addresses' : 'Select from Saved Addresses'}
                                        </button>
                                    )}
                                </div>

                                {showAddressPicker && user?.addresses && user.addresses.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                                        {user.addresses.map((addr) => (
                                            <button
                                                key={addr.id}
                                                type="button"
                                                onClick={() => selectExistingAddress(addr)}
                                                className="p-2.5 rounded-xl border border-slate-200/80 bg-white text-left hover:border-purple-400 hover:shadow-2xs transition cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-900">{addr.label}</span>
                                                    {addr.is_default && (
                                                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                                                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40">
                                    <AddressFormFields
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        showLabel={false}
                                        showPhone={false}
                                        line1Label="Shop / Building / Street Address"
                                        line1Placeholder="Shop / Plot No., Market / Building Name, Street"
                                        line2Placeholder="Area, Landmark, Sector (Optional)"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-600 bg-purple-50/70 p-2.5 rounded-xl border border-purple-100 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                    <span>This shop address will automatically be copied & saved as your default delivery address.</span>
                                </p>
                                {errors.shop_address && <p className="text-[10px] text-rose-600 mt-1">{errors.shop_address}</p>}
                            </div>

                            {/* Shop Front Photo Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Shop Front / Storefront Image <span className="text-slate-400 font-normal">(Optional but recommended)</span>
                                </label>
                                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-300 bg-slate-50/50 transition">
                                    {shopImagePreview ? (
                                        <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                                            <img
                                                src={shopImagePreview}
                                                alt="Shop Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                                            <Camera className="w-8 h-8 opacity-75" />
                                        </div>
                                    )}

                                    <div className="flex-1 text-center sm:text-left">
                                        <p className="text-xs font-semibold text-slate-800">
                                            {data.shop_image ? data.shop_image.name : 'Upload clear storefront photo'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Showing your shop signboard helps expedite instant verification. (JPG, PNG, max 4MB)
                                        </p>
                                        <label className="inline-block mt-2.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-purple-400 text-purple-700 font-semibold text-xs rounded-lg cursor-pointer hover:bg-purple-50/50 transition shadow-2xs">
                                            <span>{shopImagePreview ? 'Change Shop Photo' : 'Choose Shop Photo'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange('shop_image', e.target.files[0])}
                                            />
                                        </label>
                                    </div>
                                </div>
                                {errors.shop_image && <p className="text-[10px] text-rose-600 mt-1">{errors.shop_image}</p>}
                            </div>
                        </div>

                        {/* SECTION 2: Government Identity Verification (Aadhaar KYC) */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center justify-center">
                                    2
                                </span>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Proprietor Aadhaar KYC
                                </h4>
                            </div>

                            {/* Aadhaar Card Number */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Aadhaar Card Number (12 Digits) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.aadhaar_card}
                                        onChange={(e) => setData('aadhaar_card', e.target.value.replace(/\D/g, ''))}
                                        placeholder="123456789012"
                                        maxLength={12}
                                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none font-mono tracking-wider transition"
                                    />
                                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                                </div>
                                {errors.aadhaar_card && <p className="text-[10px] text-rose-600 mt-1">{errors.aadhaar_card}</p>}
                            </div>

                            {/* Front and Back Aadhaar Uploads */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Aadhaar Front */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Aadhaar Card Front Photo <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-purple-50/20 transition">
                                        {aadhaarFrontPreview ? (
                                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                <img
                                                    src={aadhaarFrontPreview}
                                                    alt="Aadhaar Front Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="py-4 flex flex-col items-center">
                                                <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                                                <span className="text-[11px] font-semibold text-slate-600">Front Side Photo</span>
                                                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG (Max 4MB)</span>
                                            </div>
                                        )}

                                        <label className="px-3 py-1.5 bg-white border border-slate-200 hover:border-purple-400 text-purple-700 font-semibold text-xs rounded-lg cursor-pointer hover:bg-purple-50/50 transition shadow-2xs">
                                            <span>{aadhaarFrontPreview ? 'Change Front Image' : 'Select Front Image'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange('aadhaar_front', e.target.files[0])}
                                            />
                                        </label>
                                    </div>
                                    {errors.aadhaar_front && <p className="text-[10px] text-rose-600 mt-1">{errors.aadhaar_front}</p>}
                                </div>

                                {/* Aadhaar Back */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Aadhaar Card Back Photo <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-purple-50/20 transition">
                                        {aadhaarBackPreview ? (
                                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                <img
                                                    src={aadhaarBackPreview}
                                                    alt="Aadhaar Back Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="py-4 flex flex-col items-center">
                                                <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                                                <span className="text-[11px] font-semibold text-slate-600">Back Side Photo</span>
                                                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG (Max 4MB)</span>
                                            </div>
                                        )}

                                        <label className="px-3 py-1.5 bg-white border border-slate-200 hover:border-purple-400 text-purple-700 font-semibold text-xs rounded-lg cursor-pointer hover:bg-purple-50/50 transition shadow-2xs">
                                            <span>{aadhaarBackPreview ? 'Change Back Image' : 'Select Back Image'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange('aadhaar_back', e.target.files[0])}
                                            />
                                        </label>
                                    </div>
                                    {errors.aadhaar_back && <p className="text-[10px] text-rose-600 mt-1">{errors.aadhaar_back}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Encrypted 256-bit storage. Exclusively used for retailer verification.</span>
                            </p>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>
                                    {processing
                                        ? 'Submitting Verification...'
                                        : isRejected
                                        ? 'Resubmit KYC Documents'
                                        : isSubmitted
                                        ? 'Update & Resubmit Verification'
                                        : 'Submit KYC for Review'}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

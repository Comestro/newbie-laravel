import React, { useState, useEffect } from 'react';
import { Store, Home, MapPin } from 'lucide-react';

export default function AddressFormFields({
    data,
    setData,
    errors = {},
    showLabel = false,
    showPhone = false,
    isRetailer = false,
    line1Label = 'Address Line 1',
    line1Placeholder = 'House / Flat / Shop No., Building Name, Street',
    line2Placeholder = 'Landmark, Area, Sector',
}) {
    const isStandardLabel = (lbl) => lbl === 'Home' || lbl === 'Shop';
    const [isOther, setIsOther] = useState(() => Boolean(data.label && !isStandardLabel(data.label)));

    useEffect(() => {
        if (data.label && !isStandardLabel(data.label)) {
            setIsOther(true);
        } else if (isStandardLabel(data.label)) {
            setIsOther(false);
        }
    }, [data.label]);

    return (
        <div className="space-y-3.5">
            {showPhone && (
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.phone || ''}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="10-digit mobile number"
                        className={`w-full text-xs px-3 py-2 rounded-xl border bg-white text-slate-900 outline-none transition ${
                            errors.phone
                                ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        }`}
                    />
                    {errors.phone && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.phone}</p>}
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {line1Label} <span className="text-rose-500">*</span>
                </label>
                <input
                    type="text"
                    value={data.line1 || ''}
                    onChange={(e) => setData('line1', e.target.value)}
                    placeholder={line1Placeholder}
                    className={`w-full text-xs px-3 py-2 rounded-xl border bg-white text-slate-900 outline-none transition ${
                        errors.line1
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                    }`}
                />
                {errors.line1 && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.line1}</p>}
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                    type="text"
                    value={data.line2 || ''}
                    onChange={(e) => setData('line2', e.target.value)}
                    placeholder={line2Placeholder}
                    className={`w-full text-xs px-3 py-2 rounded-xl border bg-white text-slate-900 outline-none transition ${
                        errors.line2
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                    }`}
                />
                {errors.line2 && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.line2}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.city || ''}
                        onChange={(e) => setData('city', e.target.value)}
                        placeholder="City"
                        className={`w-full text-xs px-3 py-2 rounded-xl border bg-white text-slate-900 outline-none transition ${
                            errors.city
                                ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        }`}
                    />
                    {errors.city && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.city}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        State <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.state || ''}
                        onChange={(e) => setData('state', e.target.value)}
                        placeholder="State"
                        className={`w-full text-xs px-3 py-2 rounded-xl border bg-white text-slate-900 outline-none transition ${
                            errors.state
                                ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        }`}
                    />
                    {errors.state && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.state}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pincode <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.pincode || ''}
                        onChange={(e) => setData('pincode', e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className={`w-full text-xs px-3 py-2 rounded-xl border bg-white text-slate-900 outline-none font-mono transition ${
                            errors.pincode
                                ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        }`}
                    />
                    {errors.pincode && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.pincode}</p>}
                </div>
            </div>

            {/* Address Type Pill Selector at bottom */}
            {showLabel && (
                <div className="pt-1 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                        Save Address As <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOther(false);
                                setData('label', 'Home');
                            }}
                            className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                !isOther && data.label === 'Home'
                                    ? 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-600 font-bold shadow-2xs'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            <Home className="w-3.5 h-3.5 shrink-0" />
                            <span>Home</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsOther(false);
                                setData('label', 'Shop');
                            }}
                            className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                !isOther && data.label === 'Shop'
                                    ? 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-600 font-bold shadow-2xs'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            <Store className="w-3.5 h-3.5 shrink-0" />
                            <span>Shop</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsOther(true);
                                if (data.label === 'Home' || data.label === 'Shop') {
                                    setData('label', '');
                                }
                            }}
                            className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                isOther
                                    ? 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-600 font-bold shadow-2xs'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>Other</span>
                        </button>
                    </div>

                    {isOther && (
                        <div className="pt-1 max-w-xs">
                            <input
                                type="text"
                                value={data.label || ''}
                                onChange={(e) => setData('label', e.target.value)}
                                placeholder="e.g. Warehouse, Godown, Office"
                                className={`w-full text-xs px-3 py-2 rounded-xl border bg-white text-slate-900 outline-none transition ${
                                    errors.label
                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                        : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                }`}
                                autoFocus
                            />
                        </div>
                    )}
                    {errors.label && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.label}</p>}
                </div>
            )}
        </div>
    );
}


import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { resolveImageUrl } from '../../../utils/media';
import { ArrowLeft, Image as ImageIcon, Save, Upload } from 'lucide-react';

export default function Form({ banner = null }) {
    const isEdit = Boolean(banner);
    const [imagePreview, setImagePreview] = useState(resolveImageUrl(banner?.banner_image));

    const { data, setData, post, processing, errors } = useForm({
        image_file: null,
        cta_link: banner?.cta_link || '/catalog',
        sort_order: banner?.sort_order ?? 0,
        is_active: banner ? Boolean(banner.is_active) : true,
    });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setData('image_file', file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('admin.banners.update', banner.id), { forceFormData: true });
        } else {
            post(route('admin.banners.store'), { forceFormData: true });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit Banner' : 'Upload Banner'}
            subtitle="Upload a promotional banner image for the home page"
            action={
                <Link
                    href={route('admin.banners.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Banners</span>
                </Link>
            }
        >
            <Head title={`${isEdit ? 'Edit' : 'Upload'} Banner - Admin Console`} />

            <form
                onSubmit={handleSubmit}
                className="max-w-xl bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5 text-xs"
            >
                {/* Banner Image Upload */}
                <div>
                    <label className="block font-semibold text-slate-700 mb-2">
                        Banner Image {!isEdit && <span className="text-rose-500">*</span>}
                    </label>

                    <label className="block cursor-pointer group">
                        {imagePreview ? (
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 h-44">
                                <img
                                    src={imagePreview}
                                    alt="Banner preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-semibold gap-1.5">
                                    <Upload className="w-4 h-4" />
                                    <span>Change Image</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-44 rounded-2xl border-2 border-dashed border-slate-200 group-hover:border-purple-400 bg-slate-50/70 flex flex-col items-center justify-center text-slate-400 transition">
                                <ImageIcon className="w-8 h-8 mb-2 text-slate-300 group-hover:text-purple-500 transition" />
                                <span className="font-semibold text-slate-600">Click to upload banner image</span>
                                <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    {errors.image_file && <p className="text-rose-600 mt-1.5 font-medium">{errors.image_file}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Target Link (Optional)</label>
                        <input
                            type="text"
                            value={data.cta_link}
                            onChange={(e) => setData('cta_link', e.target.value)}
                            placeholder="/catalog"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                        {errors.cta_link && <p className="text-rose-600 mt-1">{errors.cta_link}</p>}
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Sort Order</label>
                        <input
                            type="number"
                            min="0"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                        {errors.sort_order && <p className="text-rose-600 mt-1">{errors.sort_order}</p>}
                    </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-slate-700">Active (visible on home page)</span>
                </label>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        <span>{processing ? 'Saving...' : isEdit ? 'Update Banner' : 'Upload Banner'}</span>
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

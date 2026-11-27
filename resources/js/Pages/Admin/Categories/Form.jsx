import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CategoryIcon from '../../../Components/CategoryIcon';
import { ArrowLeft, Save, PlusCircle, Edit3, Upload, X } from 'lucide-react';

export default function CategoryForm({ category = null, parentCategories = [] }) {
    const isEdit = Boolean(category?.id);
    const [imagePreview, setImagePreview] = useState(null);

    const isExistingImage = typeof category?.icon === 'string' && (category.icon.startsWith('http') || category.icon.startsWith('/'));

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : undefined,
        parent_id: category?.parent_id || '',
        name: category?.name || '',
        slug: category?.slug || '',
        icon: isExistingImage ? '' : (category?.icon || ''),
        image_file: null,
        remove_icon: false,
        is_active: category ? Boolean(category.is_active) : true,
    });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData((prev) => ({
            ...prev,
            image_file: file,
            remove_icon: false,
        }));
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveIcon = () => {
        setImagePreview(null);
        setData((prev) => ({
            ...prev,
            icon: '',
            image_file: null,
            remove_icon: true,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEdit
            ? route('admin.categories.update', category.id)
            : route('admin.categories.store');

        post(url, { forceFormData: true });
    };

    const previewIcon = imagePreview
        || (!data.remove_icon && data.icon ? data.icon : null)
        || (!data.remove_icon && isExistingImage ? category.icon : null);

    return (
        <AdminLayout
            title={isEdit ? `Edit Category: ${category.name}` : 'Create Category'}
            subtitle={isEdit ? 'Update category name, icon/image, and visibility' : 'Add a new catalog category for grouping and filtering products'}
            action={
                <Link
                    href={route('admin.categories.index')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Categories</span>
                </Link>
            }
        >
            <Head title={`${isEdit ? 'Edit ' + category.name : 'Create Category'} - Admin Console`} />

            <div className="max-w-xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-sm">
                        {isEdit ? <Edit3 className="w-4 h-4 text-purple-600" /> : <PlusCircle className="w-4 h-4 text-purple-600" />}
                        <span>{isEdit ? 'Edit Category Details' : 'New Category Details'}</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Parent Category <span className="text-slate-400 font-normal">(optional, leave empty for Main Category)</span>
                            </label>
                            <select
                                value={data.parent_id}
                                onChange={(e) => setData('parent_id', e.target.value)}
                                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                            >
                                <option value="">None (Main Category)</option>
                                {parentCategories.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.path || p.name}
                                    </option>
                                ))}
                            </select>
                            {errors.parent_id && <p className="text-rose-500 text-[10px] mt-1">{errors.parent_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Category Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Milk & Dairy, Bakery, Fresh Produce..."
                                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                                required
                                autoFocus
                            />
                            {errors.name && <p className="text-rose-500 text-[10px] mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                URL Slug <span className="text-slate-400 font-normal">(optional, auto-generated from name)</span>
                            </label>
                            <input
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="e.g. milk-and-dairy"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 font-mono text-[11px] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                            {errors.slug && <p className="text-rose-500 text-[10px] mt-1">{errors.slug}</p>}
                        </div>

                        {/* Category Icon / Image */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Category Image / Icon <span className="text-slate-400 font-normal">(defaults to 📦)</span>
                            </label>
                            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/60">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                    <CategoryIcon icon={previewIcon} name={data.name} className="w-10 h-10" textClassName="text-2xl" />
                                </div>

                                <div className="flex-1 min-w-[180px] space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-xs font-semibold text-slate-700 cursor-pointer transition">
                                            <Upload className="w-3.5 h-3.5 text-purple-600" />
                                            <span>Upload Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>

                                        {previewIcon && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveIcon}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                <span>Reset to 📦</span>
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={data.icon}
                                        onChange={(e) => {
                                            setImagePreview(null);
                                            setData((prev) => ({
                                                ...prev,
                                                icon: e.target.value,
                                                image_file: null,
                                                remove_icon: false,
                                            }));
                                        }}
                                        placeholder="Or paste an emoji / icon URL (optional)"
                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                            {errors.image_file && <p className="text-rose-500 text-[10px] mt-1">{errors.image_file}</p>}
                            {errors.icon && <p className="text-rose-500 text-[10px] mt-1">{errors.icon}</p>}
                        </div>

                        <div className="pt-1">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded accent-purple-600 h-4 w-4"
                                />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                        <Link
                            href={route('admin.categories.index')}
                            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-lg transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isEdit ? 'Save Changes' : 'Create Category'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

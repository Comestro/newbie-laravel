import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, Save, PlusCircle, Edit3 } from 'lucide-react';

export default function CategoryForm({ category = null }) {
    const isEdit = Boolean(category?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name || '',
        slug: category?.slug || '',
        is_active: category ? Boolean(category.is_active) : true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.categories.update', category.id));
        } else {
            post(route('admin.categories.store'));
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit Category: ${category.name}` : 'Create Category'}
            subtitle={isEdit ? 'Update category name and active visibility' : 'Add a new catalog category for grouping and filtering products'}
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


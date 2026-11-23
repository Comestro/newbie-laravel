import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/categories');
    };

    return (
        <AdminLayout
            title="Create Category"
            subtitle="Add a new catalog category for grouping and filtering products"
            action={
                <Link
                    href="/admin/categories"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Categories</span>
                </Link>
            }
        >
            <Head title="Create Category - Admin Console" />

            <div className="max-w-xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs space-y-5">
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
                                <span>Publish Immediately (Active)</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                        <Link
                            href="/admin/categories"
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
                            <span>Create Category</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

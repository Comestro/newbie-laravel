import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function Create({ categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        brand: '',
        category: categories[0]?.value || 'Milk',
        description: '',
        is_active: true,
        variants: [
            { unit_size: '500ml', retail_price: '30', stock: '100', sku: '' },
        ],
    });

    const addVariant = () => {
        setData('variants', [
            ...data.variants,
            { unit_size: '', retail_price: '', stock: '100', sku: '' },
        ]);
    };

    const removeVariant = (index) => {
        setData('variants', data.variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index, field, value) => {
        const next = [...data.variants];
        next[index][field] = value;
        setData('variants', next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/products');
    };

    return (
        <AdminLayout
            title="Create Product"
            subtitle="Add a new catalog product with initial size/weight variants"
            action={
                <Link
                    href="/admin/products"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Products</span>
                </Link>
            }
        >
            <Head title="New Product - Admin Console" />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* General Info Card */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                    <h3 className="font-bold text-sm text-slate-900">Product Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Fresh Cow Milk"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                required
                            />
                            {errors.name && <p className="text-rose-500 text-[10px] mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
                            <input
                                type="text"
                                value={data.brand}
                                onChange={(e) => setData('brand', e.target.value)}
                                placeholder="e.g. FarmFresh"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                required
                            />
                            {errors.brand && <p className="text-rose-500 text-[10px] mt-1">{errors.brand}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            >
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>{c.value}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded accent-purple-600"
                                />
                                <span>Publish Immediately (Active)</span>
                            </label>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                placeholder="Describe nutritional highlights, farm sourcing, or pack info..."
                            />
                        </div>
                    </div>
                </div>

                {/* Variants Card */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">Sizes & Variants</h3>
                            <p className="text-[11px] text-slate-400">At least one pack size/price variant is required.</p>
                        </div>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Size</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {data.variants.map((v, i) => (
                            <div key={i} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                                <div className="flex-1 w-full sm:w-auto">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Size/Weight</label>
                                    <input
                                        type="text"
                                        value={v.unit_size}
                                        onChange={(e) => updateVariant(i, 'unit_size', e.target.value)}
                                        placeholder="e.g. 1L or 500ml"
                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-900"
                                        required
                                    />
                                </div>
                                <div className="w-full sm:w-32">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={v.retail_price}
                                        onChange={(e) => updateVariant(i, 'retail_price', e.target.value)}
                                        placeholder="30"
                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-900"
                                        required
                                    />
                                </div>
                                <div className="w-full sm:w-28">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Stock</label>
                                    <input
                                        type="number"
                                        value={v.stock}
                                        onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                                        placeholder="100"
                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-900"
                                    />
                                </div>
                                {data.variants.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(i)}
                                        className="mt-4 sm:mt-0 p-1.5 text-slate-400 hover:text-rose-600 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        href="/admin/products"
                        className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50 transition"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                    >
                        Create Product
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

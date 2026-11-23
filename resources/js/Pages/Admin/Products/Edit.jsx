import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function Edit({ product, categories = [] }) {
    const [deletedVariantIds, setDeletedVariantIds] = useState([]);

    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        brand: product.brand || '',
        category: product.category?.value || product.category || 'Milk',
        description: product.description || '',
        is_active: Boolean(product.is_active),
        variants: (product.variants || []).map((v) => ({
            id: v.id,
            unit_size: v.unit_size || '',
            retail_price: v.retail_price || '',
            stock: v.stock || 0,
            sku: v.sku || '',
        })),
        deleted_variant_ids: [],
    });

    const addVariant = () => {
        setData('variants', [
            ...data.variants,
            { id: null, unit_size: '', retail_price: '', stock: '100', sku: '' },
        ]);
    };

    const removeVariant = (index) => {
        const variantToRemove = data.variants[index];
        if (variantToRemove.id) {
            setDeletedVariantIds((prev) => [...prev, variantToRemove.id]);
            setData('deleted_variant_ids', [...deletedVariantIds, variantToRemove.id]);
        }
        setData('variants', data.variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index, field, value) => {
        const next = [...data.variants];
        next[index][field] = value;
        setData('variants', next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/products/${product.id}`);
    };

    return (
        <AdminLayout
            title={`Edit: ${product.name}`}
            subtitle="Modify product details, categories, and inventory SKU pricing"
            action={
                <Link
                    href="/admin/products"
                    className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Products</span>
                </Link>
            }
        >
            <Head title={`Edit ${product.name} - Admin Console`} />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                {/* General Info Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-xs space-y-5">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Product Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Product Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5"
                                required
                            />
                            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Brand Name</label>
                            <input
                                type="text"
                                value={data.brand}
                                onChange={(e) => setData('brand', e.target.value)}
                                className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5"
                                required
                            />
                            {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Category</label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5"
                            >
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>{c.value}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Product is Active & Visible in Shop
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Description</label>
                        <textarea
                            rows="3"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5"
                        />
                    </div>
                </div>

                {/* Variants Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-base text-gray-900 dark:text-white">Product Variants</h3>
                            <p className="text-xs text-gray-500">Edit or add new package sizes and retail prices</p>
                        </div>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Variant</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {data.variants.map((v, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Unit / Size</label>
                                    <input
                                        type="text"
                                        value={v.unit_size}
                                        onChange={(e) => updateVariant(idx, 'unit_size', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 p-2 bg-white dark:bg-gray-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Retail Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={v.retail_price}
                                        onChange={(e) => updateVariant(idx, 'retail_price', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 p-2 bg-white dark:bg-gray-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Inventory Stock</label>
                                    <input
                                        type="number"
                                        value={v.stock}
                                        onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 p-2 bg-white dark:bg-gray-700"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase">SKU</label>
                                        <input
                                            type="text"
                                            value={v.sku}
                                            onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                                            className="mt-1 w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 font-mono"
                                        />
                                    </div>
                                    {data.variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(idx)}
                                            className="p-2 text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        href="/admin/products"
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm shadow-sm transition"
                    >
                        Update Product
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Plus, Trash2, ArrowLeft, Save, PlusCircle, Edit3, Package, Layers } from 'lucide-react';

export default function ProductForm({ product = null, categories = [] }) {
    const isEdit = Boolean(product?.id);
    const defaultCategoryId = categories[0]?.id || '';

    const initialVariants = product?.variants && product.variants.length > 0
        ? product.variants.map((v) => ({
            id: v.id,
            unit_size: v.unit_size || '',
            mrp: v.mrp ?? '',
            retail_price: v.retail_price ?? '',
            bulk_price: v.bulk_price ?? v.retail_price ?? '',
            min_bulk_qty: v.min_bulk_qty ?? 10,
            stock: v.stock ?? 100,
            sku: v.sku || '',
            image_url: v.image_url || '',
        }))
        : [
            {
                id: null,
                unit_size: '500ml',
                mrp: '35',
                retail_price: '30',
                bulk_price: '25',
                min_bulk_qty: 10,
                stock: 100,
                sku: '',
                image_url: '',
            },
        ];

    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name || '',
        brand: product?.brand || '',
        category_id: product?.category_id || defaultCategoryId,
        description: product?.description || '',
        is_active: product ? Boolean(product.is_active) : true,
        variants: initialVariants,
        deleted_variant_ids: [],
    });

    const getVariantError = (index, field) => errors[`variants.${index}.${field}`];

    const addVariant = () => {
        setData('variants', [
            ...data.variants,
            {
                id: null,
                unit_size: '',
                mrp: '',
                retail_price: '',
                bulk_price: '',
                min_bulk_qty: 10,
                stock: 100,
                sku: '',
                image_url: '',
            },
        ]);
    };

    const removeVariant = (index) => {
        if (data.variants.length <= 1) {
            return;
        }

        const targetVariant = data.variants[index];
        const nextVariants = data.variants.filter((_, i) => i !== index);

        if (targetVariant.id) {
            setData((prev) => ({
                ...prev,
                variants: nextVariants,
                deleted_variant_ids: [...prev.deleted_variant_ids, targetVariant.id],
            }));
        } else {
            setData('variants', nextVariants);
        }
    };

    const updateVariant = (index, field, value) => {
        const next = [...data.variants];
        next[index][field] = value;
        setData('variants', next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(route('admin.products.update', product.id), {
                preserveScroll: true,
            });
        } else {
            post(route('admin.products.store'), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit Product: ${product.name}` : 'Create Product'}
            subtitle={isEdit ? 'Update product information, pricing tiers, and size variants' : 'Add a new catalog product with size, stock, and pricing variants'}
            action={
                <Link
                    href={route('admin.products.index')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Products</span>
                </Link>
            }
        >
            <Head title={`${isEdit ? 'Edit ' + product.name : 'Create Product'} - Admin Console`} />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* General Info Card */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-sm">
                        {isEdit ? <Edit3 className="w-4 h-4 text-purple-600" /> : <PlusCircle className="w-4 h-4 text-purple-600" />}
                        <span>Product Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Product Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Fresh Cow Milk"
                                className={`w-full text-xs px-3 py-2 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                    errors.name
                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                        : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                }`}
                            />
                            {errors.name && <p className="text-rose-500 text-[10px] mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Brand Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.brand}
                                onChange={(e) => setData('brand', e.target.value)}
                                placeholder="e.g. FarmFresh"
                                className={`w-full text-xs px-3 py-2 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                    errors.brand
                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                        : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                }`}
                            />
                            {errors.brand && <p className="text-rose-500 text-[10px] mt-1">{errors.brand}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Category <span className="text-rose-500">*</span>
                                </label>
                                <Link
                                    href={route('admin.categories.create')}
                                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-700"
                                >
                                    + Add New Category
                                </Link>
                            </div>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className={`w-full text-xs px-3 py-2 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                    errors.category_id
                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                        : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                }`}
                            >
                                {categories.length === 0 ? (
                                    <option value="">No categories found - please create one</option>
                                ) : (
                                    categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {errors.category_id && <p className="text-rose-500 text-[10px] mt-1">{errors.category_id}</p>}
                        </div>

                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded accent-purple-600 h-4 w-4"
                                />
                                <span>Active Product (Visible on Store)</span>
                            </label>
                            {errors.is_active && <p className="text-rose-500 text-[10px] ml-3">{errors.is_active}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows="3"
                            placeholder="Detailed product information, ingredients, nutritional values, storage instructions..."
                            className={`w-full text-xs px-3 py-2 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                errors.description
                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                    : 'border-slate-200/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                            }`}
                        />
                        {errors.description && <p className="text-rose-500 text-[10px] mt-1">{errors.description}</p>}
                    </div>
                </div>

                {/* Variants Card */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-600" />
                                <span>Product Variants & Pricing</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Add sizes, weights, or packages with retail & bulk wholesale pricing.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Variant</span>
                        </button>
                    </div>

                    {errors.variants && (
                        <p className="text-rose-500 text-xs font-semibold">{errors.variants}</p>
                    )}

                    <div className="space-y-4">
                        {data.variants.map((v, index) => (
                            <div
                                key={v.id || index}
                                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition space-y-3 relative group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5 text-purple-500" />
                                        <span>Variant #{index + 1} {index === 0 && <span className="text-purple-600 font-semibold">(Default)</span>}</span>
                                    </span>
                                    {data.variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition"
                                            title="Remove Variant"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Size / Unit <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={v.unit_size}
                                            onChange={(e) => updateVariant(index, 'unit_size', e.target.value)}
                                            placeholder="e.g. 500ml, 1kg, Pack of 6"
                                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                                getVariantError(index, 'unit_size')
                                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                                    : 'border-slate-200 focus:border-purple-500'
                                            }`}
                                        />
                                        {getVariantError(index, 'unit_size') && (
                                            <p className="text-rose-500 text-[10px] mt-1">{getVariantError(index, 'unit_size')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            MRP (₹) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={v.mrp}
                                            onChange={(e) => updateVariant(index, 'mrp', e.target.value)}
                                            placeholder="e.g. 35.00"
                                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                                getVariantError(index, 'mrp')
                                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                                    : 'border-slate-200 focus:border-purple-500'
                                            }`}
                                        />
                                        {getVariantError(index, 'mrp') && (
                                            <p className="text-rose-500 text-[10px] mt-1">{getVariantError(index, 'mrp')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Retail Price (₹) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={v.retail_price}
                                            onChange={(e) => updateVariant(index, 'retail_price', e.target.value)}
                                            placeholder="e.g. 30.00"
                                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                                getVariantError(index, 'retail_price')
                                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                                    : 'border-slate-200 focus:border-purple-500'
                                            }`}
                                        />
                                        {getVariantError(index, 'retail_price') && (
                                            <p className="text-rose-500 text-[10px] mt-1">{getVariantError(index, 'retail_price')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Bulk Price (₹) <span className="text-rose-500">*</span> <span className="text-slate-400 font-normal">(Retailer)</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={v.bulk_price}
                                            onChange={(e) => updateVariant(index, 'bulk_price', e.target.value)}
                                            placeholder="e.g. 25.00"
                                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                                getVariantError(index, 'bulk_price')
                                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                                    : 'border-slate-200 focus:border-purple-500'
                                            }`}
                                        />
                                        {getVariantError(index, 'bulk_price') && (
                                            <p className="text-rose-500 text-[10px] mt-1">{getVariantError(index, 'bulk_price')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Min Bulk Qty
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={v.min_bulk_qty}
                                            onChange={(e) => updateVariant(index, 'min_bulk_qty', e.target.value)}
                                            placeholder="e.g. 10"
                                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                                getVariantError(index, 'min_bulk_qty')
                                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                                    : 'border-slate-200 focus:border-purple-500'
                                            }`}
                                        />
                                        {getVariantError(index, 'min_bulk_qty') && (
                                            <p className="text-rose-500 text-[10px] mt-1">{getVariantError(index, 'min_bulk_qty')}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Stock Units <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={v.stock}
                                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                            placeholder="100"
                                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                                getVariantError(index, 'stock')
                                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                                    : 'border-slate-200 focus:border-purple-500'
                                            }`}
                                        />
                                        {getVariantError(index, 'stock') && (
                                            <p className="text-rose-500 text-[10px] mt-1">{getVariantError(index, 'stock')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            SKU Code <span className="text-slate-400 font-normal">(auto if blank)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={v.sku}
                                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                            placeholder="e.g. MILK-500ML"
                                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border bg-white text-slate-900 font-mono text-[11px] outline-none uppercase transition ${
                                                getVariantError(index, 'sku')
                                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                                    : 'border-slate-200 focus:border-purple-500'
                                            }`}
                                        />
                                        {getVariantError(index, 'sku') && (
                                            <p className="text-rose-500 text-[10px] mt-1">{getVariantError(index, 'sku')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Image URL <span className="text-slate-400 font-normal">(optional)</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={v.image_url}
                                            onChange={(e) => updateVariant(index, 'image_url', e.target.value)}
                                            placeholder="https://images..."
                                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border bg-white text-slate-900 outline-none transition ${
                                                getVariantError(index, 'image_url')
                                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                                    : 'border-slate-200 focus:border-purple-500'
                                            }`}
                                        />
                                        {getVariantError(index, 'image_url') && (
                                            <p className="text-rose-500 text-[10px] mt-1">{getVariantError(index, 'image_url')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href={route('admin.products.index')}
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
                        <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

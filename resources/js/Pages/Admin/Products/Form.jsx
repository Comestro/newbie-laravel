import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Plus, Trash2, ArrowLeft, Save, PlusCircle, Edit3, Package, Layers, Upload, Image as ImageIcon, X, Star, ListChecks } from 'lucide-react';

const DEFAULT_DETAIL_KEYS = [
    'Key Features',
    'Ingredients',
    'Shelf Life',
    'FSSAI License',
    'Country of Origin',
    'Manufacturer Details',
    'Seller',
    'Disclaimer',
];

const NUTRITION_PRESET_KEYS = [
    'Serve Size',
    'Energy (Per 100 g)',
    'Protein (Per 100 g)',
    'Total Carbohydrates (Per 100 g)',
    'Total Sugar (Per 100 g)',
    'Added Sugar (Per 100 g)',
    'Dietary Fiber (Per 100 g)',
    'Total Fat (Per 100 g)',
    'Saturated Fat (Per 100 g)',
    'Trans Fat (Per 100 g)',
    'Cholesterol (Per 100 g)',
    'Sodium (Per 100 g)',
];

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
            image_files: [],
            cover_image_id: null,
            cover_new_file_id: null,
            status: v.status || 'active',
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
                image_files: [],
                cover_image_id: null,
                cover_new_file_id: null,
                status: 'active',
            },
        ];

    // Local gallery state for each variant: { existing: [{id, url, thumbnail_url, is_primary}], newFiles: [{id, file, preview, is_cover}] }
    const [variantGalleries, setVariantGalleries] = useState(() => {
        if (!product?.variants) {
            return [{ existing: [], newFiles: [] }];
        }
        return product.variants.map((v) => {
            const sortedImages = [...(v.images || [])].sort((a, b) => {
                if (a.is_primary && !b.is_primary) return -1;
                if (!a.is_primary && b.is_primary) return 1;
                return (a.sort_order ?? 0) - (b.sort_order ?? 0);
            });

            return {
                existing: sortedImages.map((img) => ({
                    id: img.id,
                    url: img.url,
                    thumbnail_url: img.thumbnail_url || img.url,
                    is_primary: Boolean(img.is_primary),
                })),
                newFiles: [],
            };
        });
    });

    useEffect(() => {
        return () => {
            variantGalleries.forEach((g) => {
                g.newFiles?.forEach((item) => {
                    if (item.preview) URL.revokeObjectURL(item.preview);
                });
            });
        };
    }, []);

    const initialDetails = Array.isArray(product?.details) && product.details.length > 0
        ? product.details.map((d) => ({ key: d.key || '', value: d.value || '' }))
        : DEFAULT_DETAIL_KEYS.map((key) => ({ key, value: '' }));

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'put' : undefined,
        name: product?.name || '',
        brand: product?.brand || '',
        category_id: product?.category_id || defaultCategoryId,
        description: product?.description || '',
        details: initialDetails,
        status: product?.status || (product?.is_active === false ? 'inactive' : 'active'),
        is_active: product ? (product.status ? product.status === 'active' : Boolean(product.is_active)) : true,
        variants: initialVariants,
        deleted_variant_ids: [],
        deleted_image_ids: [],
    });

    const addDetailRow = () => {
        setData('details', [...data.details, { key: '', value: '' }]);
    };

    const updateDetailRow = (index, field, value) => {
        const next = [...data.details];
        next[index] = { ...next[index], [field]: value };
        setData('details', next);
    };

    const removeDetailRow = (index) => {
        setData('details', data.details.filter((_, i) => i !== index));
    };

    const addNutritionPreset = () => {
        const existingKeys = new Set(data.details.map((d) => d.key.trim().toLowerCase()));
        const toAdd = NUTRITION_PRESET_KEYS
            .filter((k) => !existingKeys.has(k.toLowerCase()))
            .map((key) => ({ key, value: '' }));
        if (toAdd.length > 0) {
            setData('details', [...data.details, ...toAdd]);
        }
    };

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
                image_files: [],
                cover_image_id: null,
                cover_new_file_id: null,
                status: 'active',
            },
        ]);
        setVariantGalleries((prev) => [...prev, { existing: [], newFiles: [] }]);
    };

    const removeVariant = (index) => {
        if (data.variants.length <= 1) {
            return;
        }

        const targetVariant = data.variants[index];
        const nextVariants = data.variants.filter((_, i) => i !== index);

        // Revoke previews for removed variant
        if (variantGalleries[index]?.newFiles) {
            variantGalleries[index].newFiles.forEach((item) => {
                if (item.preview) URL.revokeObjectURL(item.preview);
            });
        }
        setVariantGalleries((prev) => prev.filter((_, i) => i !== index));

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

    const handleAddImages = (index, fileList) => {
        if (!fileList || fileList.length === 0) return;

        const filesArray = Array.from(fileList);
        const newItems = filesArray.map((file) => ({
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: URL.createObjectURL(file),
            is_cover: false,
        }));

        setVariantGalleries((prev) => {
            const next = [...prev];
            if (!next[index]) next[index] = { existing: [], newFiles: [] };
            next[index] = {
                ...next[index],
                newFiles: [...next[index].newFiles, ...newItems],
            };
            return next;
        });

        setData((prev) => {
            const nextVariants = [...prev.variants];
            const currentFiles = nextVariants[index].image_files || [];
            nextVariants[index] = {
                ...nextVariants[index],
                image_files: [...currentFiles, ...filesArray],
            };
            return {
                ...prev,
                variants: nextVariants,
            };
        });
    };

    const handleRemoveImage = (variantIndex, imageItem, isExisting) => {
        if (isExisting) {
            setData((prev) => ({
                ...prev,
                deleted_image_ids: [...prev.deleted_image_ids, imageItem.id],
            }));

            setVariantGalleries((prev) => {
                const next = [...prev];
                next[variantIndex] = {
                    ...next[variantIndex],
                    existing: next[variantIndex].existing.filter((img) => img.id !== imageItem.id),
                };
                return next;
            });
        } else {
            if (imageItem.preview) {
                URL.revokeObjectURL(imageItem.preview);
            }

            setVariantGalleries((prev) => {
                const next = [...prev];
                next[variantIndex] = {
                    ...next[variantIndex],
                    newFiles: next[variantIndex].newFiles.filter((item) => item.id !== imageItem.id),
                };
                return next;
            });

            setData((prev) => {
                const nextVariants = [...prev.variants];
                nextVariants[variantIndex] = {
                    ...nextVariants[variantIndex],
                    image_files: (nextVariants[variantIndex].image_files || []).filter((f) => f !== imageItem.file),
                };
                return {
                    ...prev,
                    variants: nextVariants,
                };
            });
        }
    };

    const handleSetCover = (variantIndex, targetItem, isExisting) => {
        setVariantGalleries((prev) => {
            const next = [...prev];
            const g = next[variantIndex];
            if (!g) return prev;

            if (isExisting) {
                const target = g.existing.find((img) => img.id === targetItem.id);
                if (!target) return prev;
                const remaining = g.existing.filter((img) => img.id !== targetItem.id);

                next[variantIndex] = {
                    ...g,
                    existing: [{ ...target, is_primary: true }, ...remaining.map((img) => ({ ...img, is_primary: false }))],
                    newFiles: g.newFiles.map((n) => ({ ...n, is_cover: false })),
                };
            } else {
                const target = g.newFiles.find((n) => n.id === targetItem.id);
                if (!target) return prev;
                const remaining = g.newFiles.filter((n) => n.id !== targetItem.id);

                next[variantIndex] = {
                    ...g,
                    newFiles: [{ ...target, is_cover: true }, ...remaining.map((n) => ({ ...n, is_cover: false }))],
                    existing: g.existing.map((img) => ({ ...img, is_primary: false })),
                };
            }
            return next;
        });

        setData((prev) => {
            const nextVariants = [...prev.variants];
            const currentVariant = nextVariants[variantIndex];

            if (isExisting) {
                nextVariants[variantIndex] = {
                    ...currentVariant,
                    cover_image_id: targetItem.id,
                    cover_new_file_id: null,
                };
            } else {
                const files = currentVariant.image_files || [];
                const targetFile = targetItem.file;
                const reorderedFiles = targetFile
                    ? [targetFile, ...files.filter((f) => f !== targetFile)]
                    : files;

                nextVariants[variantIndex] = {
                    ...currentVariant,
                    cover_image_id: null,
                    cover_new_file_id: targetItem.id,
                    image_files: reorderedFiles,
                };
            }

            return {
                ...prev,
                variants: nextVariants,
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            post(route('admin.products.update', product.id), {
                forceFormData: true,
                preserveScroll: true,
            });
        } else {
            post(route('admin.products.store'), {
                forceFormData: true,
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
                                            {c.path || (c.parent ? `${c.parent.name} → ${c.name}` : c.name)}
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
                                    checked={data.status === 'active'}
                                    onChange={(e) => {
                                        const nextStatus = e.target.checked ? 'active' : 'inactive';
                                        setData((prev) => ({
                                            ...prev,
                                            status: nextStatus,
                                            is_active: e.target.checked,
                                        }));
                                    }}
                                    className="rounded accent-purple-600 h-4 w-4"
                                />
                                <span>Active Product (Visible on Store)</span>
                            </label>
                            {errors.status && <p className="text-rose-500 text-[10px] ml-3">{errors.status}</p>}
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
                                Add sizes, weights, or packages with retail, bulk pricing, and multiple images.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Variant</span>
                        </button>
                    </div>

                    {errors.variants && (
                        <p className="text-rose-500 text-xs font-semibold">{errors.variants}</p>
                    )}

                    <div className="space-y-4">
                        {data.variants.map((v, index) => {
                            const gallery = variantGalleries[index] || { existing: [], newFiles: [] };
                            const totalImages = (gallery.existing?.length || 0) + (gallery.newFiles?.length || 0);

                            return (
                                <div
                                    key={v.id || index}
                                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition space-y-3 relative group"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Package className="w-3.5 h-3.5 text-purple-500" />
                                            <span>Variant #{index + 1} {index === 0 && <span className="text-purple-600 font-semibold">(Default)</span>}</span>
                                            <span
                                                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                                    (v.status || 'active') === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-slate-200 text-slate-600'
                                                }`}
                                            >
                                                {v.status || 'active'}
                                            </span>
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={(v.status || 'active') === 'active'}
                                                    onChange={(e) => updateVariant(index, 'status', e.target.checked ? 'active' : 'inactive')}
                                                    className="rounded accent-purple-600 h-3.5 w-3.5"
                                                />
                                                <span>Active Variant</span>
                                            </label>
                                            {data.variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(index)}
                                                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                                                    title="Remove Variant"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                                    </div>

                                    {/* Variant Images Gallery (Multiple Images per Variant, Upload only) */}
                                    <div className="pt-2 border-t border-slate-200/60">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                                                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                                                <span>Variant Images</span>
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {totalImages} image{totalImages === 1 ? '' : 's'}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5">
                                            {/* Existing images */}
                                            {gallery.existing?.map((img, imgIdx) => {
                                                const hasNewCover = gallery.newFiles?.some((n) => n.is_cover);
                                                const isCover = !hasNewCover && (img.is_primary || (imgIdx === 0 && !gallery.existing.some((x) => x.is_primary)));

                                                return (
                                                    <div
                                                        key={img.id}
                                                        className={`relative group w-18 h-18 rounded-lg border overflow-hidden bg-slate-100 shadow-2xs shrink-0 transition ${
                                                            isCover ? 'ring-2 ring-purple-600 ring-offset-1 border-purple-500' : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <img
                                                            src={img.thumbnail_url || img.url}
                                                            alt={`Variant ${index + 1} image ${imgIdx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {isCover ? (
                                                            <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5 pointer-events-none select-none">
                                                                <Star className="w-2.5 h-2.5 fill-current" />
                                                                <span>Cover</span>
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetCover(index, img, true)}
                                                                className="absolute bottom-1 left-1 bg-white/95 hover:bg-purple-600 text-slate-700 hover:text-white px-1.5 py-0.5 rounded shadow-xs border border-slate-200 hover:border-purple-600 flex items-center gap-1 text-[9px] font-medium transition cursor-pointer group/btn"
                                                                title="Set as cover image"
                                                            >
                                                                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400 group-hover/btn:text-white group-hover/btn:fill-white transition" />
                                                                <span className="text-[8px] leading-tight font-semibold">Cover</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index, img, true)}
                                                            className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                                                            title="Delete image"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })}

                                            {/* Newly selected images pending upload */}
                                            {gallery.newFiles?.map((item, newIdx) => {
                                                const hasExistingImages = (gallery.existing?.length || 0) > 0;
                                                const hasNewCover = gallery.newFiles?.some((n) => n.is_cover);
                                                const isCover = item.is_cover || (!hasExistingImages && !hasNewCover && newIdx === 0);

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`relative group w-18 h-18 rounded-lg border overflow-hidden bg-purple-50/50 shadow-2xs shrink-0 transition ${
                                                            isCover ? 'ring-2 ring-purple-600 ring-offset-1 border-purple-500' : 'border-purple-200 hover:border-purple-300'
                                                        }`}
                                                    >
                                                        <img
                                                            src={item.preview}
                                                            alt="New upload"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <span className="absolute top-1 left-1 bg-emerald-600/90 text-white text-[8px] font-bold px-1 py-0.2 rounded shadow-2xs pointer-events-none">
                                                            New
                                                        </span>
                                                        {isCover ? (
                                                            <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5 pointer-events-none select-none">
                                                                <Star className="w-2.5 h-2.5 fill-current" />
                                                                <span>Cover</span>
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetCover(index, item, false)}
                                                                className="absolute bottom-1 left-1 bg-white/95 hover:bg-purple-600 text-slate-700 hover:text-white px-1.5 py-0.5 rounded shadow-xs border border-purple-200 hover:border-purple-600 flex items-center gap-1 text-[9px] font-medium transition cursor-pointer group/btn"
                                                                title="Set as cover image"
                                                            >
                                                                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400 group-hover/btn:text-white group-hover/btn:fill-white transition" />
                                                                <span className="text-[8px] leading-tight font-semibold">Cover</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index, item, false)}
                                                            className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                                                            title="Remove image"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })}

                                            {/* Add Images Tile */}
                                            <label className="w-18 h-18 rounded-lg border-2 border-dashed border-slate-300 hover:border-purple-500 bg-white hover:bg-purple-50/40 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-purple-600 cursor-pointer transition shrink-0 group">
                                                <Upload className="w-4 h-4 group-hover:scale-110 transition" />
                                                <span className="text-[10px] font-semibold">+ Add</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files.length > 0) {
                                                            handleAddImages(index, e.target.files);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {getVariantError(index, 'image_files') && (
                                            <p className="text-rose-500 text-[10px] mt-1.5">{getVariantError(index, 'image_files')}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Product Details (Dynamic Key-Value Specifications) */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-purple-600" />
                                <span>Product Details &amp; Specifications</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Fill relevant fields or add custom attributes. Empty rows are automatically skipped when saving.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={addNutritionPreset}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
                            >
                                + Nutrition Fields
                            </button>
                            <button
                                type="button"
                                onClick={addDetailRow}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Custom Field</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {data.details.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-start p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                                <div className="sm:col-span-4">
                                    <input
                                        type="text"
                                        value={row.key}
                                        onChange={(e) => updateDetailRow(idx, 'key', e.target.value)}
                                        placeholder="Field name (e.g. Shelf Life)"
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 font-semibold focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-7">
                                    <textarea
                                        rows={2}
                                        value={row.value}
                                        onChange={(e) => updateDetailRow(idx, 'value', e.target.value)}
                                        placeholder="Value (leave blank to omit)"
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-1 flex justify-end sm:justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => removeDetailRow(idx)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                        title="Remove field"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
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
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

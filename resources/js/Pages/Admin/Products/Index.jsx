import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmModal from '../../../Components/ConfirmModal';
import { Plus, Edit, Trash2, Package, Search, Layers, AlertCircle } from 'lucide-react';

export default function Index({ products, categories = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [status, setStatus] = useState(filters.status || '');

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        name: '',
        loading: false,
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('admin.products.index'),
            {
                search: search || undefined,
                category_id: categoryId || undefined,
                status: status || undefined,
            },
            { preserveScroll: true }
        );
    };

    const handleClear = () => {
        setSearch('');
        setCategoryId('');
        setStatus('');
        router.get(route('admin.products.index'), {}, { preserveScroll: true });
    };

    const handleToggleActive = (product) => {
        router.post(route('admin.products.toggle-active', product.id), {}, { preserveScroll: true });
    };

    const openDeleteModal = (id, name) => {
        setDeleteModal({
            isOpen: true,
            id,
            name,
            loading: false,
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.id) return;
        setDeleteModal((prev) => ({ ...prev, loading: true }));
        router.delete(route('admin.products.destroy', deleteModal.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteModal({ isOpen: false, id: null, name: '', loading: false });
            },
        });
    };

    const productList = products?.data || (Array.isArray(products) ? products : []);

    const formatPriceRange = (variants) => {
        if (!variants || variants.length === 0) return '—';
        const prices = variants.map((v) => Number(v.retail_price)).filter((p) => !isNaN(p));
        if (prices.length === 0) return '—';
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? `₹${min.toFixed(2)}` : `₹${min.toFixed(2)} – ₹${max.toFixed(2)}`;
    };

    const getTotalStock = (variants) => {
        if (!variants || variants.length === 0) return 0;
        return variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    };

    return (
        <AdminLayout
            title="Products Catalog"
            subtitle="Manage product catalog, sizes, inventory stock, and pricing"
            action={
                <Link
                    href={route('admin.products.create')}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                </Link>
            }
        >
            <Head title="Products - Admin Console" />

            <div className="space-y-4">
                {/* Search & Filters */}
                <form onSubmit={handleFilter} className="bg-white rounded-xl border border-slate-100 p-3 shadow-xs">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by product name, brand, or SKU..."
                                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>

                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="text-xs px-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                        >
                            Filter
                        </button>

                        {(filters.search || filters.category_id || filters.status) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                {/* Products Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Product</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4 text-center">Variants</th>
                                    <th className="py-3 px-4">Price Range</th>
                                    <th className="py-3 px-4 text-center">Total Stock</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {productList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400">
                                            <div className="max-w-xs mx-auto space-y-2">
                                                <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                                                <p className="font-semibold text-slate-700">No products found</p>
                                                <p className="text-[11px] text-slate-400">
                                                    {(filters.search || filters.category_id || filters.status)
                                                        ? 'Try clearing filters to see all products.'
                                                        : 'Create your first product to display it in the store.'}
                                                </p>
                                                <Link
                                                    href={route('admin.products.create')}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Add Product</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    productList.map((prod) => {
                                        const totalStock = getTotalStock(prod.variants);
                                        const defaultImage = prod.variants?.find((v) => v.image_url)?.image_url;

                                        return (
                                            <tr key={prod.id} className="hover:bg-slate-50/50 transition">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {defaultImage ? (
                                                                <img src={defaultImage} alt={prod.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="w-4 h-4 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 leading-snug">{prod.name}</h4>
                                                            <p className="text-[11px] text-purple-600 font-semibold">{prod.brand}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                        {prod.category?.name || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                                                        {prod.variants_count ?? prod.variants?.length ?? 0}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-800">
                                                    {formatPriceRange(prod.variants)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            totalStock === 0
                                                                ? 'bg-rose-50 text-rose-700'
                                                                : totalStock < 20
                                                                ? 'bg-amber-50 text-amber-700'
                                                                : 'bg-emerald-50 text-emerald-700'
                                                        }`}
                                                    >
                                                        {totalStock} units
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActive(prod)}
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                                                            prod.is_active
                                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {prod.is_active ? 'Active' : 'Draft'}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={route('admin.products.edit', prod.id)}
                                                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition"
                                                            title="Edit Product"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteModal(prod.id, prod.name)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products?.links && products.links.length > 3 && (
                        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <div>
                                Showing <span className="font-semibold text-slate-700">{products.from || 0}</span> to{' '}
                                <span className="font-semibold text-slate-700">{products.to || 0}</span> of{' '}
                                <span className="font-semibold text-slate-700">{products.total || 0}</span> products
                            </div>
                            <div className="flex gap-1">
                                {products.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded text-xs transition ${
                                            link.active
                                                ? 'bg-purple-600 text-white font-bold'
                                                : !link.url
                                                ? 'text-slate-300 pointer-events-none'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Product"
                message={
                    <span>
                        Are you sure you want to delete <strong className="text-slate-800 font-semibold">"{deleteModal.name}"</strong>? All associated variant SKUs and inventory records will also be deleted.
                    </span>
                }
                confirmText="Delete Product"
                variant="danger"
                loading={deleteModal.loading}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', loading: false })}
            />
        </AdminLayout>
    );
}

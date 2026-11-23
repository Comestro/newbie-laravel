import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmModal from '../../../Components/ConfirmModal';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

export default function Index({ products }) {
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        name: '',
        loading: false,
    });

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
        router.delete(`/admin/products/${deleteModal.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteModal({ isOpen: false, id: null, name: '', loading: false });
            },
        });
    };

    return (
        <AdminLayout
            title="Products Catalog"
            subtitle="Manage product definitions, brands, and variant SKU pricing"
            action={
                <Link
                    href="/admin/products/create"
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                </Link>
            }
        >
            <Head title="Products - Admin Console" />

            <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                            <tr>
                                <th className="py-3 px-4">Product</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Variants</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-slate-400">
                                        No products created yet.
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-slate-50/50 transition">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    <Package className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{prod.name}</h4>
                                                    <p className="text-[11px] text-purple-600 font-semibold">{prod.brand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                {prod.category?.value || prod.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {prod.variants?.length || 0} variant(s)
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                prod.is_active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {prod.is_active ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${prod.id}/edit`}
                                                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-purple-600"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteModal(prod.id, prod.name)}
                                                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {products?.links && products.links.length > 3 && (
                    <div className="p-3 border-t border-slate-100 flex justify-center gap-1">
                        {products.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-2.5 py-1 text-xs rounded border ${
                                    link.active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200'
                                } ${!link.url ? 'opacity-40' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Product"
                message={
                    <span>
                        Are you sure you want to delete <strong className="text-slate-800 font-semibold">"{deleteModal.name}"</strong>? All associated variant SKUs will also be deleted.
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

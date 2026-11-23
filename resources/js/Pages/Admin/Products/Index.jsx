import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

export default function Index({ products }) {
    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(`/admin/products/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="Products Catalog"
            subtitle="Manage product definitions, brands, and variant SKU pricing"
            action={
                <Link
                    href="/admin/products/create"
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                </Link>
            }
        >
            <Head title="Products - Admin Console" />

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                            <tr>
                                <th className="py-3.5 px-6">Product</th>
                                <th className="py-3.5 px-6">Category</th>
                                <th className="py-3.5 px-6">Variants</th>
                                <th className="py-3.5 px-6">Status</th>
                                <th className="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {products?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400">
                                        No products created yet.
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                    <Package className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{prod.name}</h4>
                                                    <p className="text-xs text-purple-600 font-semibold">{prod.brand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                {prod.category?.value || prod.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                                            {prod.variants_count ?? prod.variants?.length ?? 0} variants
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                prod.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                            }`}>
                                                {prod.is_active ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${prod.id}/edit`}
                                                    className="p-1.5 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(prod.id, prod.name)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center gap-1">
                        {products.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                    link.active
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

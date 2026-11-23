import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Plus, Edit, Trash2, Layers, Search } from 'lucide-react';

export default function Index({ categories, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/categories', { search: search || undefined }, { preserveScroll: true });
    };

    const handleToggleActive = (category) => {
        router.post(`/admin/categories/${category.id}/toggle-active`, {}, { preserveScroll: true });
    };

    const handleDelete = (id, name, productCount) => {
        if (productCount > 0) {
            alert(`Cannot delete "${name}" because it has ${productCount} assigned product(s). Please reassign or delete those products first.`);
            return;
        }
        if (confirm(`Are you sure you want to delete category "${name}"?`)) {
            router.delete(`/admin/categories/${id}`, { preserveScroll: true });
        }
    };

    const categoryList = categories?.data || (Array.isArray(categories) ? categories : []);

    return (
        <AdminLayout
            title="Categories"
            subtitle="Manage product categories and active status"
            action={
                <Link
                    href="/admin/categories/create"
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                </Link>
            }
        >
            <Head title="Categories - Admin Console" />

            <div className="space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200/80 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    <button
                        type="submit"
                        className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                    >
                        Filter
                    </button>
                    {filters.search && (
                        <Link
                            href="/admin/categories"
                            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center"
                        >
                            Clear
                        </Link>
                    )}
                </form>

                {/* Categories Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Category Name</th>
                                    <th className="py-3 px-4">Slug</th>
                                    <th className="py-3 px-4 text-center">Products</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categoryList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400">
                                            <div className="max-w-xs mx-auto space-y-2">
                                                <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                                                <p className="font-semibold text-slate-700">No categories found</p>
                                                <p className="text-[11px] text-slate-400">Create categories so products can be grouped and filtered in your store.</p>
                                                <Link
                                                    href="/admin/categories/create"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Create First Category</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    categoryList.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3 px-4 font-semibold text-slate-900">
                                                {cat.name}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                                                {cat.slug}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                                    {cat.products_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(cat)}
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                                                        cat.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {cat.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/admin/categories/${cat.id}/edit`}
                                                        className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition"
                                                        title="Edit Category"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(cat.id, cat.name, cat.products_count ?? 0)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                                                        title="Delete Category"
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

                    {/* Pagination */}
                    {categories?.links && categories.links.length > 3 && (
                        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <div>
                                Showing <span className="font-semibold text-slate-700">{categories.from || 0}</span> to{' '}
                                <span className="font-semibold text-slate-700">{categories.to || 0}</span> of{' '}
                                <span className="font-semibold text-slate-700">{categories.total || 0}</span> categories
                            </div>
                            <div className="flex gap-1">
                                {categories.links.map((link, idx) => (
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
        </AdminLayout>
    );
}

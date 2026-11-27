import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SearchBar from '../../../Components/SearchBar';
import CategoryIcon from '../../../Components/CategoryIcon';
import ConfirmModal from '../../../Components/ConfirmModal';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';

export default function Index({ categories, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        name: '',
        productCount: 0,
        childrenCount: 0,
        loading: false,
    });

    const applyCategorySearch = (nextSearch) => {
        const query = nextSearch !== undefined ? nextSearch : search;
        router.get(route('admin.categories.index'), { search: query || undefined }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyCategorySearch();
    };

    const handleToggleActive = (category) => {
        router.post(route('admin.categories.toggle-active', category.id), {}, { preserveScroll: true });
    };

    const openDeleteModal = (id, name, productCount, childrenCount) => {
        setDeleteModal({
            isOpen: true,
            id,
            name,
            productCount,
            childrenCount,
            loading: false,
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.id) return;
        setDeleteModal((prev) => ({ ...prev, loading: true }));
        router.delete(route('admin.categories.destroy', deleteModal.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteModal({ isOpen: false, id: null, name: '', productCount: 0, childrenCount: 0, loading: false });
            },
        });
    };

    const categoryList = categories?.data || (Array.isArray(categories) ? categories : []);

    return (
        <AdminLayout
            title="Categories"
            subtitle="Manage product categories and active status"
            action={
                <Link
                    href={route('admin.categories.create')}
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
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onSearch={applyCategorySearch}
                        placeholder="Search categories..."
                        className="flex-1"
                        inputClassName="py-2 text-slate-800"
                    />
                    <button
                        type="submit"
                        className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                    >
                        Filter
                    </button>
                    {filters.search && (
                        <Link
                            href={route('admin.categories.index')}
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
                                    <th className="py-3 px-4">Parent</th>
                                    <th className="py-3 px-4">Slug</th>
                                    <th className="py-3 px-4 text-center">Products</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categoryList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            <div className="max-w-xs mx-auto space-y-2">
                                                <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                                                <p className="font-semibold text-slate-700">No categories found</p>
                                                <p className="text-[11px] text-slate-400">Create categories so products can be grouped and filtered in your store.</p>
                                                <Link
                                                    href={route('admin.categories.create')}
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
                                                {(cat.depth || 0) > 0 ? (
                                                    <span
                                                        className="inline-flex items-center gap-1.5 text-slate-700"
                                                        style={{ paddingLeft: `${cat.depth * 18}px` }}
                                                    >
                                                        <span className="text-slate-400">↳</span>
                                                        <CategoryIcon icon={cat.icon} name={cat.name} className="w-5 h-5" textClassName="text-sm" />
                                                        <span>{cat.name}</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2">
                                                        <CategoryIcon icon={cat.icon} name={cat.name} className="w-5 h-5" textClassName="text-sm" />
                                                        <span>{cat.name}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {cat.parent ? (
                                                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-semibold">
                                                        {cat.parent.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400">Main</span>
                                                )}
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
                                                        href={route('admin.categories.edit', cat.id)}
                                                        className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition"
                                                        title="Edit Category"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteModal(cat.id, cat.name, cat.products_count ?? 0, cat.children_count ?? 0)}
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

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Category"
                message={
                    <span>
                        Are you sure you want to delete category <strong className="text-slate-800 font-semibold">"{deleteModal.name}"</strong>?
                        {deleteModal.childrenCount > 0 && (
                            <span className="block mt-1.5 text-rose-600 font-medium">
                                Warning: All subcategories under this category will also be deleted.
                            </span>
                        )}
                        {deleteModal.productCount > 0 && (
                            <span className="block mt-1.5 text-rose-600 font-medium">
                                Warning: {deleteModal.productCount} assigned product(s) will also be deleted.
                            </span>
                        )}
                        <span className="block mt-1.5">This action cannot be undone.</span>
                    </span>
                }
                confirmText="Delete Category"
                variant="danger"
                loading={deleteModal.loading}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', productCount: 0, childrenCount: 0, loading: false })}
            />
        </AdminLayout>
    );
}

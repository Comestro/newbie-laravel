import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmModal from '../../../Components/ConfirmModal';
import { resolveImageUrl } from '../../../utils/media';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

export default function Index({ banners = [] }) {
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        loading: false,
    });

    const hasProcessing = banners.some((b) => !b.banner_image);

    useEffect(() => {
        if (!hasProcessing) return;
        const interval = setInterval(() => {
            router.reload({ only: ['banners'], preserveScroll: true });
        }, 1500);
        return () => clearInterval(interval);
    }, [hasProcessing]);

    const handleToggleActive = (banner) => {
        router.post(route('admin.banners.toggle-active', banner.id), {}, { preserveScroll: true });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.id) return;
        setDeleteModal((prev) => ({ ...prev, loading: true }));
        router.delete(route('admin.banners.destroy', deleteModal.id), {
            preserveScroll: true,
            onFinish: () => setDeleteModal({ isOpen: false, id: null, loading: false }),
        });
    };

    return (
        <AdminLayout
            title="Home Banners"
            subtitle="Upload and manage banner images shown on the public home page"
            action={
                <Link
                    href={route('admin.banners.create')}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Banner</span>
                </Link>
            }
        >
            <Head title="Banners - Admin Console" />

            <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Banner Image</th>
                                <th className="py-3 px-4">Target Link</th>
                                <th className="py-3 px-4 text-center">Order</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {banners.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400">
                                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="font-semibold text-slate-600">No banners uploaded yet</p>
                                        <p className="text-[11px] mt-0.5">Upload a banner image to display on the home page.</p>
                                    </td>
                                </tr>
                            ) : (
                                banners.map((banner) => {
                                    const imgUrl = resolveImageUrl(banner.banner_image);
                                    return (
                                        <tr key={banner.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-3 px-4">
                                                {imgUrl ? (
                                                    <img
                                                        src={imgUrl}
                                                        alt="Banner"
                                                        className="w-36 h-16 object-cover rounded-xl border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-36 h-16 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center text-[10px]">
                                                        Processing...
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-[11px] text-slate-600 font-mono">
                                                    {banner.cta_link || '/catalog'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono text-slate-600">
                                                {banner.sort_order}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(banner)}
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                                                        banner.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {banner.is_active ? 'Active' : 'Hidden'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <Link
                                                        href={route('admin.banners.edit', banner.id)}
                                                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                        title="Edit banner"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteModal({
                                                                isOpen: true,
                                                                id: banner.id,
                                                                loading: false,
                                                            })
                                                        }
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                        title="Delete banner"
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
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, loading: false })}
                onConfirm={handleConfirmDelete}
                title="Delete Banner"
                message="Are you sure you want to delete this banner?"
                confirmText="Delete"
                confirmVariant="danger"
                loading={deleteModal.loading}
            />
        </AdminLayout>
    );
}

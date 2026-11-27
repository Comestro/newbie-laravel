import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import ProductCard from '../../Components/ProductCard';
import CategoryIcon from '../../Components/CategoryIcon';

export default function Catalog({ products, filters = {}, categories = [] }) {
    const currentCategory = filters.category || null;

    const handleSelectCategory = (cat) => {
        // Clear search when selecting a category
        router.get('/catalog', {
            category: cat || undefined,
        }, { preserveState: false });
    };

    const productList = products?.data || (Array.isArray(products) ? products : []);

    return (
        <ShopLayout>
            <Head title="Catalog - Newbie Service" />

            <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 flex">
                {/* Desktop Sidebar */}
                <div className="w-60 bg-white border-r border-slate-100 shrink-0 hidden md:block self-start sticky top-16 max-h-[calc(100vh-64px)] overflow-y-auto scrollbar-none p-4">
                    <button
                        type="button"
                        onClick={() => handleSelectCategory(null)}
                        className={`flex items-center gap-2.5 w-full px-3 py-2.5 border rounded-xl mb-4 transition-all cursor-pointer ${
                            !currentCategory
                                ? 'border-purple-500 bg-purple-50/70 text-purple-700'
                                : 'border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-lg">🛒</span>
                        <span className="text-xs font-bold uppercase tracking-wider">All Products</span>
                    </button>

                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 px-1">
                        Select Category
                    </div>

                    <div className="space-y-1">
                        {categories.map((cat) => {
                            const catVal = cat.name || cat.value || '';
                            const catSlug = cat.slug || catVal.toLowerCase();
                            const isSelected =
                                currentCategory?.toLowerCase() === catSlug.toLowerCase() ||
                                currentCategory?.toLowerCase() === catVal.toLowerCase();
                            return (
                                <button
                                    key={cat.id || catVal}
                                    type="button"
                                    onClick={() => handleSelectCategory(catSlug)}
                                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold transition ${
                                        isSelected
                                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                    }`}
                                >
                                    <span
                                        className={`truncate mr-2 ${(cat.depth || 0) > 0 ? 'text-[11px] font-medium' : ''}`}
                                        style={(cat.depth || 0) > 0 ? { paddingLeft: `${cat.depth * 12}px` } : undefined}
                                    >
                                        {(cat.depth || 0) > 0 ? `↳ ${catVal}` : catVal}
                                    </span>
                                    <CategoryIcon icon={cat.icon} name={catVal} className="w-5 h-5" textClassName="text-sm" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8">
                    {/* Mobile Category Nav */}
                    <div className="md:hidden mb-4 overflow-x-auto pb-1 scrollbar-none">
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => handleSelectCategory(null)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                                    !currentCategory
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white border-slate-200 text-slate-600'
                                }`}
                            >
                                All
                            </button>

                            {categories.map((cat) => {
                                const catVal = cat.name || cat.value || '';
                                const catSlug = cat.slug || catVal.toLowerCase();
                                const isSelected =
                                    currentCategory?.toLowerCase() === catSlug.toLowerCase() ||
                                    currentCategory?.toLowerCase() === catVal.toLowerCase();
                                return (
                                    <button
                                        key={cat.id || catVal}
                                        type="button"
                                        onClick={() => handleSelectCategory(catSlug)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border flex items-center gap-1.5 transition ${
                                            isSelected
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'bg-white border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <CategoryIcon icon={cat.icon} name={catVal} className="w-4 h-4" textClassName="text-xs" />
                                        <span>{catVal}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-4 sm:mb-6">
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                            {filters.search ? (
                                `Search results for "${filters.search}"`
                            ) : currentCategory ? (
                                currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)
                            ) : (
                                'All Products'
                            )}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Showing {productList.length} items
                        </p>
                    </div>

                    {/* Products Grid */}
                    {productList.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                            <p className="text-base font-bold text-slate-800">No products found</p>
                            <p className="text-xs text-slate-400 mt-1">Try selecting a different category or clearing your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                            {productList.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {products?.links && products.links.length > 3 && (
                        <div className="mt-8 flex flex-wrap justify-center gap-1">
                            {products.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
                                        link.active
                                            ? 'bg-purple-600 text-white border-purple-600'
                                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}

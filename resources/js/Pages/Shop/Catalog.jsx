import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import ProductCard from '../../Components/ProductCard';
import { Search } from 'lucide-react';

export default function Catalog({ products, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const currentCategory = filters.category || null;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/catalog', {
            category: currentCategory || undefined,
            search: search || undefined,
        }, { preserveScroll: true });
    };

    const productList = products?.data || (Array.isArray(products) ? products : []);

    return (
        <ShopLayout>
            <Head title="Catalog - Newbie Service" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
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

                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200/80 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </form>
                </div>

                {/* Products Grid */}
                {productList.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                        <p className="text-base font-bold text-slate-800">No products found</p>
                        <p className="text-xs text-slate-400 mt-1">Try selecting a different category or clearing your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                        {productList.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {products?.links && products.links.length > 3 && (
                    <div className="mt-8 flex justify-center gap-1">
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
        </ShopLayout>
    );
}

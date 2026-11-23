<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::with('category')->withCount('variants')->latest()->paginate(10);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'brand' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'variants' => 'required|array|min:1',
            'variants.*.unit_size' => 'required|string',
            'variants.*.retail_price' => 'required|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.sku' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'brand' => $validated['brand'],
            'category_id' => $validated['category_id'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        foreach ($validated['variants'] as $index => $variantData) {
            ProductVariant::create([
                'product_id' => $product->id,
                'variant_name' => $product->name . ' - ' . $variantData['unit_size'],
                'unit_size' => $variantData['unit_size'],
                'retail_price' => $variantData['retail_price'],
                'stock' => $variantData['stock'],
                'sku' => $variantData['sku'] ?: strtoupper(Str::slug($product->name . '-' . $variantData['unit_size'])),
                'is_default' => $index === 0,
            ]);
        }

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['variants', 'category']);

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'brand' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'variants' => 'required|array|min:1',
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.unit_size' => 'required|string',
            'variants.*.retail_price' => 'required|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.sku' => 'nullable|string',
            'deleted_variant_ids' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $product->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'brand' => $validated['brand'],
            'category_id' => $validated['category_id'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        if (!empty($validated['deleted_variant_ids'])) {
            ProductVariant::whereIn('id', $validated['deleted_variant_ids'])
                ->where('product_id', $product->id)
                ->delete();
        }

        foreach ($validated['variants'] as $variantData) {
            if (!empty($variantData['id'])) {
                ProductVariant::where('id', $variantData['id'])
                    ->where('product_id', $product->id)
                    ->update([
                        'variant_name' => $product->name . ' - ' . $variantData['unit_size'],
                        'unit_size' => $variantData['unit_size'],
                        'retail_price' => $variantData['retail_price'],
                        'stock' => $variantData['stock'],
                        'sku' => $variantData['sku'] ?: strtoupper(Str::slug($product->name . '-' . $variantData['unit_size'])),
                    ]);
            } else {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'variant_name' => $product->name . ' - ' . $variantData['unit_size'],
                    'unit_size' => $variantData['unit_size'],
                    'retail_price' => $variantData['retail_price'],
                    'stock' => $variantData['stock'],
                    'sku' => $variantData['sku'] ?: strtoupper(Str::slug($product->name . '-' . $variantData['unit_size'])),
                    'is_default' => false,
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->variants()->delete();
        $product->delete();

        return back()->with('success', 'Product deleted successfully.');
    }
}


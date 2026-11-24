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
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $categoryId = $request->query('category_id');
        $status = $request->query('status'); // 'active', 'draft'

        $products = Product::query()
            ->with(['category', 'variants' => fn($q) => $q->orderBy('retail_price', 'asc')])
            ->withCount('variants')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhereHas('variants', fn($vq) => $vq->where('sku', 'like', "%{$search}%"));
                });
            })
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                if ($status === 'active') {
                    $query->where('is_active', true);
                } elseif ($status === 'draft') {
                    $query->where('is_active', false);
                }
            })
            ->latest('id')
            ->paginate(12)
            ->withQueryString();

        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'variants' => 'required|array|min:1',
            'variants.*.unit_size' => 'required|string|max:100',
            'variants.*.mrp' => 'nullable|numeric|min:0',
            'variants.*.retail_price' => 'required|numeric|min:0',
            'variants.*.bulk_price' => 'nullable|numeric|min:0',
            'variants.*.min_bulk_qty' => 'nullable|integer|min:1',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.sku' => 'nullable|string|max:100',
            'variants.*.image_url' => 'nullable|string|max:500',
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
            $retailPrice = (float) $variantData['retail_price'];
            $mrp = isset($variantData['mrp']) && $variantData['mrp'] !== ''
                ? (float) $variantData['mrp']
                : null;
            $bulkPrice = isset($variantData['bulk_price']) && $variantData['bulk_price'] !== ''
                ? (float) $variantData['bulk_price']
                : $retailPrice;

            ProductVariant::create([
                'product_id' => $product->id,
                'variant_name' => $product->name . ' - ' . $variantData['unit_size'],
                'unit_size' => $variantData['unit_size'],
                'mrp' => $mrp,
                'retail_price' => $retailPrice,
                'bulk_price' => $bulkPrice,
                'min_bulk_qty' => !empty($variantData['min_bulk_qty']) ? (int) $variantData['min_bulk_qty'] : 10,
                'stock' => (int) $variantData['stock'],
                'sku' => !empty($variantData['sku']) ? strtoupper($variantData['sku']) : strtoupper(Str::slug($product->name . '-' . $variantData['unit_size'])),
                'image_url' => $variantData['image_url'] ?? null,
                'is_default' => $index === 0,
                'is_active' => true,
            ]);
        }

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product->load([
            'category:id,name',
            'variants' => fn($q) => $q->orderBy('id', 'asc'),
        ]);

        return Inertia::render('Admin/Products/Form', [
            'product' => $product,
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'variants' => 'required|array|min:1',
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.unit_size' => 'required|string|max:100',
            'variants.*.mrp' => 'nullable|numeric|min:0',
            'variants.*.retail_price' => 'required|numeric|min:0',
            'variants.*.bulk_price' => 'nullable|numeric|min:0',
            'variants.*.min_bulk_qty' => 'nullable|integer|min:1',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.sku' => 'nullable|string|max:100',
            'variants.*.image_url' => 'nullable|string|max:500',
            'deleted_variant_ids' => 'nullable|array',
            'deleted_variant_ids.*' => 'exists:product_variants,id',
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

        foreach ($validated['variants'] as $index => $variantData) {
            $retailPrice = (float) $variantData['retail_price'];
            $mrp = isset($variantData['mrp']) && $variantData['mrp'] !== ''
                ? (float) $variantData['mrp']
                : null;
            $bulkPrice = isset($variantData['bulk_price']) && $variantData['bulk_price'] !== ''
                ? (float) $variantData['bulk_price']
                : $retailPrice;
            $sku = !empty($variantData['sku']) ? strtoupper($variantData['sku']) : strtoupper(Str::slug($product->name . '-' . $variantData['unit_size']));

            if (!empty($variantData['id'])) {
                ProductVariant::where('id', $variantData['id'])
                    ->where('product_id', $product->id)
                    ->update([
                        'variant_name' => $product->name . ' - ' . $variantData['unit_size'],
                        'unit_size' => $variantData['unit_size'],
                        'mrp' => $mrp,
                        'retail_price' => $retailPrice,
                        'bulk_price' => $bulkPrice,
                        'min_bulk_qty' => !empty($variantData['min_bulk_qty']) ? (int) $variantData['min_bulk_qty'] : 10,
                        'stock' => (int) $variantData['stock'],
                        'sku' => $sku,
                        'image_url' => $variantData['image_url'] ?? null,
                    ]);
            } else {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'variant_name' => $product->name . ' - ' . $variantData['unit_size'],
                    'unit_size' => $variantData['unit_size'],
                    'mrp' => $mrp,
                    'retail_price' => $retailPrice,
                    'bulk_price' => $bulkPrice,
                    'min_bulk_qty' => !empty($variantData['min_bulk_qty']) ? (int) $variantData['min_bulk_qty'] : 10,
                    'stock' => (int) $variantData['stock'],
                    'sku' => $sku,
                    'image_url' => $variantData['image_url'] ?? null,
                    'is_default' => false,
                    'is_active' => true,
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    public function toggleActive(Product $product): RedirectResponse
    {
        $product->update(['is_active' => !$product->is_active]);

        return back()->with('success', "Product status changed to " . ($product->is_active ? 'active' : 'draft') . ".");
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->variants()->delete();
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully.');
    }
}

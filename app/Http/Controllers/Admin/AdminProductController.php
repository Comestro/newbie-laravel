<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Services\ImageKitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    protected function variantValidationMessages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'brand.required' => 'Brand name is required.',
            'category_id.required' => 'Please select a category.',
            'variants.required' => 'At least one variant is required.',
            'variants.min' => 'At least one variant is required.',
            'variants.*.unit_size.required' => 'Size / unit is required.',
            'variants.*.mrp.required' => 'MRP is required.',
            'variants.*.mrp.numeric' => 'MRP must be a valid number.',
            'variants.*.mrp.min' => 'MRP cannot be negative.',
            'variants.*.retail_price.required' => 'Retail price is required.',
            'variants.*.retail_price.numeric' => 'Retail price must be a valid number.',
            'variants.*.retail_price.min' => 'Retail price cannot be negative.',
            'variants.*.bulk_price.required' => 'Bulk price is required.',
            'variants.*.bulk_price.numeric' => 'Bulk price must be a valid number.',
            'variants.*.bulk_price.min' => 'Bulk price cannot be negative.',
            'variants.*.min_bulk_qty.integer' => 'Min bulk qty must be an integer.',
            'variants.*.min_bulk_qty.min' => 'Min bulk qty must be at least 1.',
            'variants.*.stock.required' => 'Stock quantity is required.',
            'variants.*.stock.integer' => 'Stock must be an integer.',
            'variants.*.stock.min' => 'Stock cannot be negative.',
            'variants.*.sku.max' => 'SKU code must not exceed 100 characters.',
            'variants.*.image_files.array' => 'Variant images must be an array of files.',
            'variants.*.image_files.*.image' => 'Each variant image must be a valid image file (jpeg, png, webp, gif, svg).',
            'variants.*.image_files.*.max' => 'Each variant image must not exceed 10MB.',
            'variants.*.image_file.image' => 'Variant image must be a valid image file (jpeg, png, webp, gif, svg).',
            'variants.*.image_file.max' => 'Variant image must not exceed 10MB.',
        ];
    }

    protected function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name) ?: 'product';
        $slug = $baseSlug;
        $count = 1;

        while (Product::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }

        return $slug;
    }

    protected function generateUniqueSku(string $productName, string $unitSize, ?int $ignoreId = null): string
    {
        $baseSku = strtoupper(Str::slug($productName . '-' . $unitSize)) ?: 'SKU';
        $sku = $baseSku;
        $count = 1;

        while (ProductVariant::where('sku', $sku)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $sku = "{$baseSku}-{$count}";
            $count++;
        }

        return $sku;
    }

    public function store(Request $request, ImageKitService $imageKitService): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'variants' => 'required|array|min:1',
            'variants.*.unit_size' => 'required|string|max:100',
            'variants.*.mrp' => 'required|numeric|min:0',
            'variants.*.retail_price' => 'required|numeric|min:0',
            'variants.*.bulk_price' => 'required|numeric|min:0',
            'variants.*.min_bulk_qty' => 'nullable|integer|min:1',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.sku' => 'nullable|string|max:100',
            'variants.*.image_files' => 'nullable|array',
            'variants.*.image_files.*' => 'image|max:10240',
            'variants.*.image_file' => 'nullable|image|max:10240',
            'variants.*.image_url' => 'nullable|string|max:500',
        ], $this->variantValidationMessages());

        DB::transaction(function () use ($validated, $request, $imageKitService) {
            $product = Product::create([
                'name' => $validated['name'],
                'slug' => $this->generateUniqueSlug($validated['name']),
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

                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'variant_name' => $product->name . ' - ' . $variantData['unit_size'],
                    'unit_size' => $variantData['unit_size'],
                    'mrp' => $mrp,
                    'retail_price' => $retailPrice,
                    'bulk_price' => $bulkPrice,
                    'min_bulk_qty' => !empty($variantData['min_bulk_qty']) ? (int) $variantData['min_bulk_qty'] : 10,
                    'stock' => (int) $variantData['stock'],
                    'sku' => !empty($variantData['sku'])
                        ? strtoupper($variantData['sku'])
                        : $this->generateUniqueSku($product->name, $variantData['unit_size']),
                    'image_url' => $variantData['image_url'] ?? null,
                    'is_default' => $index === 0,
                    'is_active' => true,
                ]);

                // Collect uploaded image files
                $uploadedFiles = [];
                if ($request->hasFile("variants.{$index}.image_files")) {
                    $rawFiles = $request->file("variants.{$index}.image_files");
                    $uploadedFiles = is_array($rawFiles) ? $rawFiles : [$rawFiles];
                } elseif ($request->hasFile("variants.{$index}.image_file")) {
                    $uploadedFiles = [$request->file("variants.{$index}.image_file")];
                }

                $firstImageUrl = $variant->image_url;
                foreach ($uploadedFiles as $imgIdx => $file) {
                    if (!$file) {
                        continue;
                    }
                    $uploadRes = $imageKitService->upload($file, null, '/products');
                    if (!$firstImageUrl) {
                        $firstImageUrl = $uploadRes['url'];
                    }

                    ProductImage::create([
                        'product_id' => $product->id,
                        'product_variant_id' => $variant->id,
                        'url' => $uploadRes['url'],
                        'file_id' => $uploadRes['file_id'] ?? null,
                        'file_path' => $uploadRes['file_path'] ?? null,
                        'thumbnail_url' => $uploadRes['thumbnail_url'] ?? null,
                        'alt_text' => $variant->variant_name,
                        'is_primary' => ($index === 0 && $imgIdx === 0),
                        'sort_order' => $imgIdx,
                    ]);
                }

                if ($firstImageUrl && $variant->image_url !== $firstImageUrl) {
                    $variant->update(['image_url' => $firstImageUrl]);
                }
            }
        });

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product->load([
            'category:id,name',
            'variants' => fn($q) => $q->orderBy('id', 'asc')->with(['images' => fn($iq) => $iq->orderBy('sort_order', 'asc')]),
            'images' => fn($iq) => $iq->orderBy('sort_order', 'asc'),
        ]);

        return Inertia::render('Admin/Products/Form', [
            'product' => $product,
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product, ImageKitService $imageKitService): RedirectResponse
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
            'variants.*.mrp' => 'required|numeric|min:0',
            'variants.*.retail_price' => 'required|numeric|min:0',
            'variants.*.bulk_price' => 'required|numeric|min:0',
            'variants.*.min_bulk_qty' => 'nullable|integer|min:1',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.sku' => 'nullable|string|max:100',
            'variants.*.image_files' => 'nullable|array',
            'variants.*.image_files.*' => 'image|max:10240',
            'variants.*.image_file' => 'nullable|image|max:10240',
            'variants.*.image_url' => 'nullable|string|max:500',
            'deleted_variant_ids' => 'nullable|array',
            'deleted_variant_ids.*' => 'exists:product_variants,id',
            'deleted_image_ids' => 'nullable|array',
            'deleted_image_ids.*' => 'exists:product_images,id',
        ], $this->variantValidationMessages());

        DB::transaction(function () use ($validated, $request, $product, $imageKitService) {
            $product->update([
                'name' => $validated['name'],
                'slug' => $this->generateUniqueSlug($validated['name'], $product->id),
                'description' => $validated['description'] ?? null,
                'brand' => $validated['brand'],
                'category_id' => $validated['category_id'],
                'is_active' => $request->boolean('is_active', true),
            ]);

            // 1. Delete requested individual images
            if (!empty($validated['deleted_image_ids'])) {
                $imagesToDelete = ProductImage::whereIn('id', $validated['deleted_image_ids'])
                    ->where('product_id', $product->id)
                    ->get();

                foreach ($imagesToDelete as $delImg) {
                    $imageKitService->delete($delImg->file_id, $delImg->file_path);
                    $delImg->delete();
                }
            }

            // 2. Delete deleted variants and their images
            if (!empty($validated['deleted_variant_ids'])) {
                $deletedVariants = ProductVariant::whereIn('id', $validated['deleted_variant_ids'])
                    ->where('product_id', $product->id)
                    ->get();

                foreach ($deletedVariants as $deletedVariant) {
                    $images = ProductImage::where('product_variant_id', $deletedVariant->id)->get();
                    foreach ($images as $img) {
                        $imageKitService->delete($img->file_id, $img->file_path);
                        $img->delete();
                    }
                    $deletedVariant->delete();
                }
            }

            // 3. Process each variant
            foreach ($validated['variants'] as $index => $variantData) {
                $retailPrice = (float) $variantData['retail_price'];
                $mrp = isset($variantData['mrp']) && $variantData['mrp'] !== ''
                    ? (float) $variantData['mrp']
                    : null;
                $bulkPrice = isset($variantData['bulk_price']) && $variantData['bulk_price'] !== ''
                    ? (float) $variantData['bulk_price']
                    : $retailPrice;
                $existingVariant = !empty($variantData['id'])
                    ? ProductVariant::where('id', $variantData['id'])->where('product_id', $product->id)->first()
                    : null;

                $sku = !empty($variantData['sku'])
                    ? strtoupper($variantData['sku'])
                    : ($existingVariant?->sku ?? $this->generateUniqueSku($product->name, $variantData['unit_size'], $existingVariant?->id));

                if ($existingVariant) {
                    $existingVariant->update([
                        'variant_name' => $product->name . ' - ' . $variantData['unit_size'],
                        'unit_size' => $variantData['unit_size'],
                        'mrp' => $mrp,
                        'retail_price' => $retailPrice,
                        'bulk_price' => $bulkPrice,
                        'min_bulk_qty' => !empty($variantData['min_bulk_qty']) ? (int) $variantData['min_bulk_qty'] : 10,
                        'stock' => (int) $variantData['stock'],
                        'sku' => $sku,
                    ]);
                    $targetVariant = $existingVariant;
                } else {
                    $targetVariant = ProductVariant::create([
                        'product_id' => $product->id,
                        'variant_name' => $product->name . ' - ' . $variantData['unit_size'],
                        'unit_size' => $variantData['unit_size'],
                        'mrp' => $mrp,
                        'retail_price' => $retailPrice,
                        'bulk_price' => $bulkPrice,
                        'min_bulk_qty' => !empty($variantData['min_bulk_qty']) ? (int) $variantData['min_bulk_qty'] : 10,
                        'stock' => (int) $variantData['stock'],
                        'sku' => $sku,
                        'image_url' => null,
                        'is_default' => $index === 0,
                        'is_active' => true,
                    ]);
                }

                // Collect uploaded image files
                $uploadedFiles = [];
                if ($request->hasFile("variants.{$index}.image_files")) {
                    $rawFiles = $request->file("variants.{$index}.image_files");
                    $uploadedFiles = is_array($rawFiles) ? $rawFiles : [$rawFiles];
                } elseif ($request->hasFile("variants.{$index}.image_file")) {
                    $uploadedFiles = [$request->file("variants.{$index}.image_file")];
                }

                $currentSortOrder = ProductImage::where('product_variant_id', $targetVariant->id)->max('sort_order') ?? -1;

                foreach ($uploadedFiles as $file) {
                    if (!$file) {
                        continue;
                    }
                    $currentSortOrder++;
                    $uploadRes = $imageKitService->upload($file, null, '/products');

                    ProductImage::create([
                        'product_id' => $product->id,
                        'product_variant_id' => $targetVariant->id,
                        'url' => $uploadRes['url'],
                        'file_id' => $uploadRes['file_id'] ?? null,
                        'file_path' => $uploadRes['file_path'] ?? null,
                        'thumbnail_url' => $uploadRes['thumbnail_url'] ?? null,
                        'alt_text' => $targetVariant->variant_name,
                        'is_primary' => ($index === 0 && $currentSortOrder === 0),
                        'sort_order' => $currentSortOrder,
                    ]);
                }

                // Sync target variant image_url to its first image
                $firstVariantImg = ProductImage::where('product_variant_id', $targetVariant->id)
                    ->orderBy('sort_order', 'asc')
                    ->first();

                $targetVariant->update([
                    'image_url' => $firstVariantImg?->url ?? $targetVariant->image_url,
                ]);
            }
        });

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    public function toggleActive(Product $product): RedirectResponse
    {
        $product->update(['is_active' => !$product->is_active]);

        return back()->with('success', "Product status changed to " . ($product->is_active ? 'active' : 'draft') . ".");
    }

    public function destroy(Product $product, ImageKitService $imageKitService): RedirectResponse
    {
        DB::transaction(function () use ($product, $imageKitService) {
            $images = ProductImage::where('product_id', $product->id)->get();
            foreach ($images as $img) {
                $imageKitService->delete($img->file_id, $img->file_path);
                $img->delete();
            }

            $product->variants()->delete();
            $product->delete();
        });

        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully.');
    }
}

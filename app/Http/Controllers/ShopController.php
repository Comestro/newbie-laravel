<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $selectedCategory = $request->query('category');

        $products = Product::with([
            'category',
            'variants' => function ($query) {
                $query->where('status', 'active')->orderBy('retail_price');
            }
        ])
            ->where('status', 'active')
            ->whereHas('variants', fn($q) => $q->where('status', 'active'))
            ->when($selectedCategory, function ($query, $cat) {
                $query->whereIn('category_id', Category::matchingIdsForFilter((string) $cat));
            })
            ->get()
            ->groupBy(fn($item) => $item->category?->name ?? 'Other');

        $categories = Category::activeOrdered();

        return Inertia::render('Shop/Home', [
            'groupedProducts' => $products,
            'selectedCategory' => $selectedCategory,
            'categories' => $categories,
        ]);
    }

    public function catalog(Request $request): Response
    {
        $category = $request->query('category');
        $search = $request->query('search');
        $sort = $request->query('sort', 'newest');

        $query = Product::query()
            ->where('status', 'active')
            ->whereHas('variants', fn($q) => $q->where('status', 'active'))
            ->with([
                'category',
                'variants' => fn($q) => $q->where('status', 'active')->orderBy('retail_price')
            ])
            ->when($category, fn($q) => $q->whereIn('category_id', Category::matchingIdsForFilter((string) $category)))
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', '%' . $search . '%')
                        ->orWhere('brand', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%');
                });
            });

        switch ($sort) {
            case 'price_low':
                $query->orderBy(
                    \App\Models\ProductVariant::select('retail_price')
                        ->whereColumn('product_variants.product_id', 'products.id')
                        ->where('status', 'active')
                        ->orderBy('retail_price', 'asc')
                        ->limit(1),
                    'asc'
                );
                break;
            case 'price_high':
                $query->orderBy(
                    \App\Models\ProductVariant::select('retail_price')
                        ->whereColumn('product_variants.product_id', 'products.id')
                        ->where('status', 'active')
                        ->orderBy('retail_price', 'desc')
                        ->limit(1),
                    'desc'
                );
                break;
            case 'popular':
                $query->withCount('variants')->orderByDesc('variants_count');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        $products = $query->paginate(12)->withQueryString();

        $categories = Category::activeOrdered();

        return Inertia::render('Shop/Catalog', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'category' => $category,
                'search' => $search,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->status === 'active', 404);

        $product->load([
            'category',
            'variants' => function ($q) {
                $q->where('status', 'active')
                    ->orderBy('retail_price')
                    ->with(['images' => fn($iq) => $iq->orderBy('sort_order', 'asc')]);
            },
            'images' => fn($iq) => $iq->orderBy('sort_order', 'asc'),
        ]);

        abort_if($product->variants->isEmpty(), 404);

        $relatedProducts = Product::query()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->whereHas('variants', fn($q) => $q->where('status', 'active'))
            ->with(['category', 'variants' => fn($q) => $q->where('status', 'active')->orderBy('retail_price')])
            ->take(4)
            ->get();

        return Inertia::render('Shop/ProductShow', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    public function checkout(Request $request)
    {
        $cart = session('cart', []);
        $itemsTotal = collect($cart)->sum(fn($i) => $i['price'] * $i['quantity']);

        if ($itemsTotal === 0) {
            return redirect()->route('home');
        }

        $addresses = Address::where('user_id', auth()->id())
            ->orderByDesc('is_default')
            ->get();

        return Inertia::render('Shop/Checkout', [
            'addresses' => $addresses,
            'deliveryCharge' => 15,
        ]);
    }

    public function orderSuccess(string $orderNumber): Response
    {
        return Inertia::render('Shop/OrderSuccess', [
            'orderNumber' => $orderNumber,
        ]);
    }
}


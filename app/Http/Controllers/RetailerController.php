<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RetailerController extends Controller
{
    public function orders(): Response
    {
        $orders = Order::where('user_id', Auth::id())
            ->with('items')
            ->latest()
            ->get();

        return Inertia::render('Retailer/Orders', [
            'orders' => $orders,
        ]);
    }

    public function addresses(): Response
    {
        $addresses = Address::where('user_id', Auth::id())
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return Inertia::render('Retailer/Addresses', [
            'addresses' => $addresses,
        ]);
    }

    public function wishlist(): Response
    {
        $wishlists = Product::whereIn('id', Auth::user()->wishlists()->pluck('product_id'))
            ->where('status', 'active')
            ->with([
                'category',
                'variants' => fn($q) => $q->where('status', 'active')->orderBy('retail_price')
            ])
            ->get();

        return Inertia::render('Retailer/Wishlist', [
            'wishlists' => $wishlists,
        ]);
    }

    public function profile(): Response
    {
        return Inertia::render('Retailer/Profile', [
            'user' => Auth::user(),
        ]);
    }

    public function kyc(): Response
    {
        return Inertia::render('Retailer/Kyc', [
            'user' => Auth::user()->load('addresses'),
        ]);
    }
}

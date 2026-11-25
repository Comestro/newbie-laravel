<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\Wishlist;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RetailerController extends Controller
{
    public function dashboard(): Response
    {
        $user = auth()->user()->load('retailerProfile');

        return Inertia::render('Retailer/Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_retailer' => $user->isRetailer(),
                'apply_status' => $user->apply_status,
                'is_kyc_approved' => $user->isKycApproved(),
                'kyc_reject_reason' => $user->kyc_reject_reason,
            ],
            'totalAssignedOrders' => Order::where('user_id', $user->id)->count(),
            'fulfilledOrders' => Order::where('user_id', $user->id)->whereIn('status', ['COMPLETED', 'DELIVERED'])->count(),
            'recentOrders' => Order::where('user_id', $user->id)->latest()->take(5)->get(),
        ]);
    }

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
        $wishlists = Wishlist::where('user_id', Auth::id())
            ->with(['product.variants' => fn($q) => $q->where('status', 'active')->orderBy('retail_price')])
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

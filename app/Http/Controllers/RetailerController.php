<?php

namespace App\Http\Controllers;

use App\Models\Order;
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
}


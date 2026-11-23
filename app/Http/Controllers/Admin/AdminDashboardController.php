<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $totalOrders = Order::count();
        $totalCustomer = User::where('role', '!=', 'ADMIN')->count();
        $totalRevenue = Order::where('status', 'COMPLETED')->orWhere('status', 'completed')->sum('total_amount');
        $unVerifiedRetailer = User::where('apply_status', 'PENDING')->count();
        $recentOrders = Order::with('user')->latest()->take(8)->get();

        return Inertia::render('Admin/Dashboard', [
            'totalOrders' => $totalOrders,
            'totalCustomer' => $totalCustomer,
            'totalRevenue' => $totalRevenue,
            'unVerifiedRetailer' => $unVerifiedRetailer,
            'recentOrders' => $recentOrders,
        ]);
    }
}


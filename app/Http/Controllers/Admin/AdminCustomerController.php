<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $active = $request->query('active');

        $customers = User::query()
            ->where('role', UserRole::USER->value)
            ->whereDoesntHave('retailerProfile')
            ->when($search, fn($q) => $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->when($active !== null && $active !== '', fn($q) => $q->where('is_active', (bool) $active))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Customers', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'active' => $active,
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load('addresses');
        $orders = $user->orders()
            ->with('invoice:id,order_id,invoice_number')
            ->withCount('items')
            ->latest()
            ->get();

        return Inertia::render('Admin/CustomerShow', [
            'customer' => $user,
            'orders' => $orders,
        ]);
    }

    public function toggleActive(User $user): RedirectResponse
    {
        $user->update(['is_active' => !$user->is_active]);

        return back()->with('success', "User active status updated.");
    }
}


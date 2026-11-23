<?php

namespace App\Http\Controllers\Admin;

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
        $role = $request->query('role');
        $status = $request->query('status');
        $active = $request->query('active');

        $customers = User::query()
            ->where('role', '!=', 'ADMIN')
            ->when($search, fn($q) => $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->when($role, fn($q) => $q->where('role', $role))
            ->when($status, fn($q) => $q->whereHas('retailerKyc', fn($k) => $k->where('status', $status)))
            ->when($active !== null && $active !== '', fn($q) => $q->where('is_active', (bool) $active))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Customers', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
                'active' => $active,
            ],
        ]);
    }

    public function toggleActive(User $user): RedirectResponse
    {
        $user->update(['is_active' => !$user->is_active]);

        return back()->with('success', "User active status updated.");
    }
}


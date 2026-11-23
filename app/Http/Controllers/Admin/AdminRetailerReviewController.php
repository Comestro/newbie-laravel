<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminRetailerReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'PENDING');

        $requests = User::where('apply_status', $status)
            ->latest()
            ->get();

        return Inertia::render('Admin/ReviewRetailer', [
            'requests' => $requests,
            'currentStatus' => $status,
        ]);
    }

    public function approve(User $user): RedirectResponse
    {
        $user->update([
            'role' => UserRole::RETAILER,
            'apply_status' => 'VERIFIED',
            'is_verified' => true,
        ]);

        return back()->with('success', "{$user->name} has been approved as Retailer.");
    }

    public function reject(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'reject_reason' => 'required|string|min:5',
        ]);

        $user->update([
            'apply_status' => 'REJECTED',
            'rejection_reason' => $request->input('reject_reason'),
        ]);

        return back()->with('success', "Application for {$user->name} was rejected.");
    }
}


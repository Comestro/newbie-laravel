<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\RetailerProfile;
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

        $requests = RetailerProfile::with('user')
            ->where('status', $status)
            ->latest()
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->user->id,
                    'profile_id' => $profile->id,
                    'name' => $profile->user->name,
                    'email' => $profile->user->email,
                    'phone' => $profile->user->phone,
                    'shop_name' => $profile->shop_name,
                    'shop_address' => $profile->shop_address,
                    'gst_number' => $profile->gst_number,
                    'shop_image' => $profile->shop_image,
                    'aadhaar_card' => $profile->aadhaar_card,
                    'aadhaar_front' => $profile->aadhaar_card_front,
                    'aadhaar_back' => $profile->aadhaar_card_back,
                    'apply_status' => $profile->status,
                    'status' => $profile->status,
                    'rejection_reason' => $profile->rejection_reason,
                    'created_at' => $profile->created_at,
                ];
            });

        return Inertia::render('Admin/ReviewRetailer', [
            'requests' => $requests,
            'currentStatus' => $status,
        ]);
    }

    public function approve(User $user): RedirectResponse
    {
        $user->update([
            'role' => UserRole::RETAILER,
        ]);

        RetailerProfile::where('user_id', $user->id)->update([
            'status' => 'VERIFIED',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
            'rejection_reason' => null,
        ]);

        return back()->with('success', "{$user->name} has been approved as Retailer.");
    }

    public function reject(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'reject_reason' => 'required|string|min:5',
        ]);

        RetailerProfile::where('user_id', $user->id)->update([
            'status' => 'REJECTED',
            'rejection_reason' => $request->input('reject_reason'),
        ]);

        return back()->with('success', "Application for {$user->name} was rejected.");
    }
}



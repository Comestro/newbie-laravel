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
    private function formatApplicant(RetailerProfile $profile): array
    {
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
            'approved_at' => $profile->approved_at,
            'created_at' => $profile->created_at,
        ];
    }

    public function index(Request $request): Response
    {
        $status = $request->query('status', 'ALL');

        $requests = RetailerProfile::with('user')
            ->when($status && $status !== 'ALL', fn ($q) => $q->where('status', $status))
            ->latest()
            ->get()
            ->map(fn ($profile) => $this->formatApplicant($profile));

        return Inertia::render('Admin/ReviewRetailer', [
            'requests' => $requests,
            'currentStatus' => $status,
        ]);
    }

    public function show(User $user): Response
    {
        $profile = RetailerProfile::with('user')
            ->where('user_id', $user->id)
            ->firstOrFail();

        return Inertia::render('Admin/ReviewRetailerShow', [
            'applicant' => $this->formatApplicant($profile),
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

        $user->update([
            'role' => UserRole::USER,
        ]);

        RetailerProfile::where('user_id', $user->id)->update([
            'status' => 'REJECTED',
            'rejection_reason' => $request->input('reject_reason'),
        ]);

        return back()->with('success', "Application for {$user->name} was rejected.");
    }
}



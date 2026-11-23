<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\RetailerKyc;
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

        $requests = RetailerKyc::with('user')
            ->where('status', $status)
            ->latest()
            ->get()
            ->map(function ($kyc) {
                return [
                    'id' => $kyc->user->id,
                    'kyc_id' => $kyc->id,
                    'name' => $kyc->user->name,
                    'email' => $kyc->user->email,
                    'phone' => $kyc->user->phone,
                    'aadhar_card' => $kyc->aadhar_card,
                    'aadhar_front' => $kyc->aadhar_card_front,
                    'aadhar_back' => $kyc->aadhar_card_back,
                    'apply_status' => $kyc->status,
                    'status' => $kyc->status,
                    'rejection_reason' => $kyc->rejection_reason,
                    'created_at' => $kyc->created_at,
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

        RetailerKyc::where('user_id', $user->id)->update([
            'status' => 'VERIFIED',
        ]);

        return back()->with('success', "{$user->name} has been approved as Retailer.");
    }

    public function reject(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'reject_reason' => 'required|string|min:5',
        ]);

        RetailerKyc::where('user_id', $user->id)->update([
            'status' => 'REJECTED',
            'rejection_reason' => $request->input('reject_reason'),
        ]);

        return back()->with('success', "Application for {$user->name} was rejected.");
    }
}



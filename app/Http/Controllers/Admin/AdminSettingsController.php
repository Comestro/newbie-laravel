<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => Setting::getLoyaltyConfig(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'membership_fee' => 'required|numeric|min:0',
            'membership_bonus_points' => 'required|integer|min:0',
            'points_per_rupee' => 'required|integer|min:1',
            'require_membership_for_order' => 'required|boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setValue($key, $value);
        }

        return back()->with('success', 'Membership & loyalty settings updated.');
    }
}


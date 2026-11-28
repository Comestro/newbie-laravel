<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role instanceof \BackedEnum ? $user->role->value : $user->role,
                    'is_admin' => $user->isAdmin(),
                    'is_retailer' => $user->isRetailer(),
                    'apply_status' => $user->apply_status,
                    'is_kyc_approved' => $user->isKycApproved(),
                    'can_place_order' => $user->canPlaceOrder(),
                    'is_member' => $user->hasActiveMembership(),
                    'membership_paid_at' => $user->membership_paid_at,
                    'membership_expires_at' => $user->membership_expires_at,
                    'loyalty_points' => (int) $user->loyalty_points,
                    'needs_membership' => $user->needsMembershipToOrder(),
                    'kyc_reject_reason' => $user->kyc_reject_reason,
                    'profile_pic' => $user->profile_pic
                        ? (str_starts_with($user->profile_pic, 'http') || str_starts_with($user->profile_pic, '/')
                            ? $user->profile_pic
                            : asset('storage/' . $user->profile_pic))
                        : null,
                    'email_verified_at' => $user->email_verified_at,
                ] : null,
            ],
            'cart' => session('cart', []),
            'wishlistProductIds' => fn () => $request->user()
                ? $request->user()->wishlists()->pluck('product_id')->toArray()
                : (array) $request->session()->get('wishlist', []),
            'categories' => fn () => \Illuminate\Support\Facades\Schema::hasTable('categories')
                ? \App\Models\Category::activeOrdered()
                : [],
            'loyaltyConfig' => fn () => \Illuminate\Support\Facades\Schema::hasTable('settings')
                ? \App\Models\Setting::getLoyaltyConfig()
                : [
                    'membership_fee' => 49,
                    'membership_bonus_points' => 5000,
                    'points_per_rupee' => 100,
                    'require_membership_for_order' => true,
                    'earn_points_on_order' => true,
                    'points_per_100_rupees' => 1,
                ],
            'flash' => [
                'success' => fn () => $request->session()->get('success') ?? $request->session()->get('status'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => $user && \Illuminate\Support\Facades\Schema::hasTable('notifications')
                ? [
                    'unread_count' => $user->unreadNotifications()->count(),
                    'items' => $user->notifications()->latest()->take(15)->get()->map(fn ($n) => [
                        'id' => $n->id,
                        'data' => $n->data,
                        'read_at' => $n->read_at,
                        'created_at' => $n->created_at?->diffForHumans(),
                    ]),
                ]
                : null,
        ];
    }
}


<?php

namespace App\Http\Middleware;

use App\Enums\ProductCategory;
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
                    'avatar_url' => $user->avatar_url ? asset('storage/' . $user->avatar_url) : null,
                    'email_verified_at' => $user->email_verified_at,
                ] : null,
            ],
            'cart' => session('cart', []),
            'categories' => fn () => \Illuminate\Support\Facades\Schema::hasTable('categories')
                ? \App\Models\Category::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug'])
                : [],
            'flash' => [
                'success' => fn () => $request->session()->get('success') ?? $request->session()->get('status'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}


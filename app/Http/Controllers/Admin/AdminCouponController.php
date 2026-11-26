<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminCouponController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $coupons = Coupon::query()
            ->when($search, fn($q) => $q->where('code', 'like', "%{$search}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Coupons/Form');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateCoupon($request);
        Coupon::create($validated);

        return redirect()->route('admin.coupons.index')->with('success', 'Coupon created successfully.');
    }

    public function edit(Coupon $coupon): Response
    {
        return Inertia::render('Admin/Coupons/Form', [
            'coupon' => $coupon,
        ]);
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $validated = $this->validateCoupon($request, $coupon->id);
        $coupon->update($validated);

        return redirect()->route('admin.coupons.index')->with('success', 'Coupon updated successfully.');
    }

    public function toggleActive(Coupon $coupon): RedirectResponse
    {
        $coupon->update(['is_active' => !$coupon->is_active]);

        return back()->with('success', 'Coupon status updated.');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        return redirect()->route('admin.coupons.index')->with('success', 'Coupon deleted successfully.');
    }

    private function validateCoupon(Request $request, ?int $ignoreId = null): array
    {
        $request->merge([
            'code' => strtoupper(trim((string) $request->input('code'))),
        ]);

        return $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($ignoreId)],
            'type' => 'required|in:PERCENT,FIXED',
            'value' => 'required|numeric|min:0.01',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);
    }
}


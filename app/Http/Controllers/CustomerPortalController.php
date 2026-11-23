<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CustomerPortalController extends Controller
{
    public function dashboard(): Response
    {
        $userId = Auth::id();
        $totalOrders = Order::where('user_id', $userId)->count();
        $totalWishlist = Wishlist::where('user_id', $userId)->count();
        $totalAddress = Address::where('user_id', $userId)->count();
        $recentOrders = Order::where('user_id', $userId)->latest()->take(5)->get();

        return Inertia::render('App/UserDashboard', [
            'totalOrders' => $totalOrders,
            'totalWishlist' => $totalWishlist,
            'totalAddress' => $totalAddress,
            'recentOrders' => $recentOrders,
        ]);
    }

    public function orders(): Response
    {
        $orders = Order::where('user_id', Auth::id())
            ->with('items')
            ->latest()
            ->get();

        return Inertia::render('App/UserMyOrder', [
            'orders' => $orders,
        ]);
    }

    public function orderView(string $orderNumber): Response
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', Auth::id())
            ->with(['items.variant.product', 'address'])
            ->firstOrFail();

        return Inertia::render('App/UserOrderView', [
            'order' => $order,
        ]);
    }

    public function addresses(): Response
    {
        $addresses = Address::where('user_id', Auth::id())
            ->orderByDesc('is_default')
            ->get();

        return Inertia::render('App/UserAddress', [
            'addresses' => $addresses,
        ]);
    }

    public function storeAddress(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:addresses,id',
            'label' => 'required|string|max:255',
            'line1' => 'required|string|max:255',
            'line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'pincode' => 'required|string|max:20',
            'phone' => 'required|string|max:20',
            'is_default' => 'nullable|boolean',
        ]);

        $userId = Auth::id();
        $isDefault = $request->boolean('is_default', false);

        if ($isDefault) {
            Address::where('user_id', $userId)->update(['is_default' => false]);
        }

        if (!empty($validated['id'])) {
            $address = Address::where('id', $validated['id'])
                ->where('user_id', $userId)
                ->firstOrFail();

            $address->update([
                'label' => $validated['label'],
                'line1' => $validated['line1'],
                'line2' => $validated['line2'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pincode' => $validated['pincode'],
                'phone' => $validated['phone'],
                'is_default' => $isDefault,
            ]);
            $msg = 'Address updated successfully.';
        } else {
            Address::create([
                'user_id' => $userId,
                'label' => $validated['label'],
                'line1' => $validated['line1'],
                'line2' => $validated['line2'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pincode' => $validated['pincode'],
                'phone' => $validated['phone'],
                'is_default' => $isDefault || Address::where('user_id', $userId)->count() === 0,
            ]);
            $msg = 'Address added successfully.';
        }

        return back()->with('success', $msg);
    }

    public function deleteAddress(Address $address): RedirectResponse
    {
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $address->delete();
        return back()->with('success', 'Address deleted successfully.');
    }

    public function setDefaultAddress(Address $address): RedirectResponse
    {
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        Address::where('user_id', Auth::id())->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return back()->with('success', 'Default address updated.');
    }

    public function profile(): Response
    {
        return Inertia::render('App/UserProfile', [
            'user' => Auth::user(),
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', 'Profile updated successfully.');
    }

    public function wishlist(): Response
    {
        $wishlists = Wishlist::where('user_id', Auth::id())
            ->with(['product.variants' => fn($q) => $q->where('is_active', true)->orderBy('retail_price')])
            ->get();

        return Inertia::render('App/UserWishlist', [
            'wishlists' => $wishlists,
        ]);
    }

    public function applyRetailer(): Response
    {
        return Inertia::render('App/ApplyToRetailer', [
            'user' => Auth::user(),
        ]);
    }

    public function submitRetailer(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $request->validate([
            'avatar' => 'required|image|max:2048',
            'aadhar_card' => 'required|string|size:12',
            'aadhar_front' => 'required|image|max:2048',
            'aadhar_back' => 'required|image|max:2048',
        ]);

        if ($user->avatar_url && Storage::disk('public')->exists($user->avatar_url)) {
            Storage::disk('public')->delete($user->avatar_url);
        }
        if ($user->aadhar_card_front && Storage::disk('public')->exists($user->aadhar_card_front)) {
            Storage::disk('public')->delete($user->aadhar_card_front);
        }
        if ($user->aadhar_card_back && Storage::disk('public')->exists($user->aadhar_card_back)) {
            Storage::disk('public')->delete($user->aadhar_card_back);
        }

        $avatarPath = $request->file('avatar')->store('retailer/avatar', 'public');
        $frontPath = $request->file('aadhar_front')->store('retailer/aadhar', 'public');
        $backPath = $request->file('aadhar_back')->store('retailer/aadhar', 'public');

        $user->update([
            'avatar_url' => $avatarPath,
            'aadhar_card' => $request->input('aadhar_card'),
            'aadhar_card_front' => $frontPath,
            'aadhar_card_back' => $backPath,
            'apply_status' => 'PENDING',
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'Your application has been submitted for verification.');
    }

    public function accounts(): Response
    {
        return Inertia::render('App/UserAccounts');
    }
}


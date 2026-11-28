<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\RetailerProfile;
use App\Models\User;
use App\Models\Wishlist;
use App\Notifications\NewUserRegisteredNotification;
use App\Services\ImageKitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response; 

class CustomerPortalController extends Controller
{
    public function orders(): Response
    {
        $orders = Order::where('user_id', Auth::id())
            ->with('items')
            ->latest()
            ->get();

        return Inertia::render('Customer/Orders', [
            'orders' => $orders,
        ]);
    }

    public function orderView(string $orderNumber): Response
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', Auth::id())
            ->with(['items.variant.product', 'address', 'invoice'])
            ->firstOrFail();

        return Inertia::render('Customer/OrderShow', [
            'order' => $order,
        ]);
    }

    public function orderInvoice(string $orderNumber): Response
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', Auth::id())
            ->whereHas('invoice')
            ->with('invoice')
            ->firstOrFail();

        return Inertia::render('Invoices/Show', [
            'invoice' => $order->invoice,
        ]);
    }

    public function addresses(): Response
    {
        $addresses = Address::where('user_id', Auth::id())
            ->orderByDesc('is_default')
            ->get();

        return Inertia::render('Customer/Addresses', [
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
        return Inertia::render('Customer/Profile', [
            'user' => Auth::user(),
        ]);
    }

    public function updateProfile(Request $request, ImageKitService $imageKitService): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[\pL\s\.\'\-]+$/u',
            ],
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => ['nullable', 'string', 'regex:/^[6-9]\d{9}$/'],
            'password' => 'nullable|string|min:6|max:100',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $user->name = trim($validated['name']);
        $user->email = trim($validated['email']);
        $user->phone = !empty($validated['phone']) ? trim($validated['phone']) : null;

        if ($request->hasFile('avatar')) {
            $uploadRes = $imageKitService->upload($request->file('avatar'), null, '/avatars');
            if (!empty($uploadRes['url'])) {
                $user->profile_pic = $uploadRes['url'];
            }
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', 'Profile updated successfully.');
    }

    public function wishlist(): Response
    {
        $wishlists = Product::whereIn('id', Auth::user()->wishlists()->pluck('product_id'))
            ->where('status', 'active')
            ->with([
                'category',
                'variants' => fn($q) => $q->where('status', 'active')->orderBy('retail_price')
            ])
            ->get();

        return Inertia::render('Customer/Wishlist', [
            'wishlists' => $wishlists,
        ]);
    }

    public function applyRetailer(): Response
    {
        return Inertia::render('Customer/ApplyRetailer', [
            'user' => Auth::user()->load('addresses'),
        ]);
    }

    private function uploadKycImage(Request $request, ImageKitService $imageKitService, string $field, string $folder, ?string $existing): ?string
    {
        if (!$request->hasFile($field)) {
            return $existing;
        }

        if ($existing && !str_starts_with($existing, 'http') && !str_starts_with($existing, '/') && Storage::disk('public')->exists($existing)) {
            Storage::disk('public')->delete($existing);
        }

        $uploadRes = $imageKitService->upload($request->file($field), null, $folder);

        return !empty($uploadRes['url']) ? $uploadRes['url'] : $existing;
    }

    public function submitRetailer(Request $request, ImageKitService $imageKitService): RedirectResponse
    {
        $user = Auth::user();
        $existingProfile = RetailerProfile::where('user_id', $user->id)->first();

        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'line1' => 'required|string|max:255',
            'line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'pincode' => 'required|string|size:6',
            'gst_number' => 'required|string|max:20',
            'shop_image' => 'nullable|image|max:4096',
            'avatar' => 'nullable|image|max:2048',
            'aadhaar_card' => 'required|string|size:12',
            'aadhaar_front' => ($existingProfile?->aadhaar_card_front ? 'nullable' : 'required') . '|image|max:4096',
            'aadhaar_back' => ($existingProfile?->aadhaar_card_back ? 'nullable' : 'required') . '|image|max:4096',
            'sync_delivery_address' => 'nullable|boolean',
        ]);

        if ($request->hasFile('avatar')) {
            $newAvatar = $this->uploadKycImage($request, $imageKitService, 'avatar', '/retailer/avatars', $user->profile_pic);
            if ($newAvatar) {
                $user->update(['profile_pic' => $newAvatar]);
            }
        }

        $shopImagePath = $this->uploadKycImage($request, $imageKitService, 'shop_image', '/retailer/shops', $existingProfile?->shop_image);
        $frontPath = $this->uploadKycImage($request, $imageKitService, 'aadhaar_front', '/retailer/aadhaar', $existingProfile?->aadhaar_card_front);
        $backPath = $this->uploadKycImage($request, $imageKitService, 'aadhaar_back', '/retailer/aadhaar', $existingProfile?->aadhaar_card_back);

        $line1 = trim($validated['line1']);
        $line2 = !empty($validated['line2']) ? trim($validated['line2']) : null;
        $city = trim($validated['city']);
        $state = trim($validated['state']);
        $pincode = trim($validated['pincode']);

        $shopAddress = $line1 . ($line2 ? ", {$line2}" : '') . ", {$city}, {$state} - {$pincode}";

        $profileData = [
            'shop_name' => $validated['shop_name'],
            'shop_address' => $shopAddress,
            'gst_number' => !empty($validated['gst_number']) ? strtoupper(trim($validated['gst_number'])) : null,
            'shop_image' => $shopImagePath,
            'aadhaar_card' => $validated['aadhaar_card'],
            'aadhaar_card_front' => $frontPath,
            'aadhaar_card_back' => $backPath,
            'status' => 'PENDING',
            'rejection_reason' => null,
        ];

        RetailerProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        NewUserRegisteredNotification::notifyAdmins($user, $validated['shop_name']);

        // Automatically copy & save this shop address as default delivery address
        $existingShopAddress = Address::where('user_id', $user->id)
            ->where('label', 'Shop')
            ->first();

        $hasOtherDefault = Address::where('user_id', $user->id)
            ->where('is_default', true)
            ->where('id', '!=', $existingShopAddress?->id ?? 0)
            ->exists();

        $addressData = [
            'user_id' => $user->id,
            'label' => 'Shop',
            'line1' => $line1,
            'line2' => $line2,
            'city' => $city,
            'state' => $state,
            'pincode' => $pincode,
            'phone' => $user->phone ?? '9876543210',
            'is_default' => !$hasOtherDefault,
        ];

        if (!$existingShopAddress) {
            Address::create($addressData);
        } else {
            $existingShopAddress->update($addressData);
        }

        return back()->with('success', 'Your retailer verification details have been submitted successfully.');
    }

    public function accounts(): Response
    {
        return Inertia::render('Customer/Accounts');
    }
}


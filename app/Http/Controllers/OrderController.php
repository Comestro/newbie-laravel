<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Coupon;
use App\Models\LoyaltyTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\NewOrderReceivedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|max:50',
        ]);

        $cart = session('cart', []);
        if (empty($cart)) {
            return response()->json(['message' => 'Your cart is empty.'], 422);
        }

        $code = strtoupper(trim($request->input('code')));
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid coupon code.'], 422);
        }

        $itemsTotal = (float) collect($cart)->sum(fn($i) => $i['price'] * $i['quantity']);
        if ($error = $coupon->isValidForAmount($itemsTotal)) {
            return response()->json(['message' => $error], 422);
        }

        return response()->json([
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'discount' => $coupon->calculateDiscount($itemsTotal),
            'message' => "Coupon {$coupon->code} applied!",
        ]);
    }

    public function createRazorpayOrder(Request $request): JsonResponse
    {
        $user = Auth::user();
        if ($user?->needsMembershipToOrder()) {
            return response()->json(['message' => 'Membership plan is required before placing orders.'], 403);
        }
        if ($user && !$user->canPlaceOrder()) {
            return response()->json(['message' => 'Retailer KYC approval is required before you can place orders.'], 403);
        }

        $request->validate([
            'address_id' => 'required|exists:addresses,id',
            'points_to_use' => 'nullable|integer|min:0',
            'coupon_code' => 'nullable|string|max:50',
        ]);

        $cart = session('cart', []);
        if (empty($cart)) {
            return response()->json(['message' => 'Cart is empty.'], 422);
        }

        Address::where('user_id', Auth::id())->findOrFail($request->input('address_id'));

        $variants = ProductVariant::whereIn('id', collect($cart)->pluck('id'))->get()->keyBy('id');
        foreach ($cart as $item) {
            $variant = $variants->get($item['id']);
            if (!$variant || $variant->stock < $item['quantity']) {
                return response()->json(['message' => "Insufficient stock for {$item['name']}."], 422);
            }
        }

        try {
            $pricing = $this->calculateOrderPricing(
                $cart,
                $user,
                (int) $request->input('points_to_use', 0),
                $request->input('coupon_code')
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        if ($pricing['payable_total'] <= 0) {
            return response()->json(['free' => true, 'payable' => 0]);
        }

        $amountInPaise = (int) round($pricing['payable_total'] * 100);
        $key = config('services.razorpay.key');
        $secret = config('services.razorpay.secret');

        $response = Http::withBasicAuth($key, $secret)
            ->post('https://api.razorpay.com/v1/orders', [
                'amount' => $amountInPaise,
                'currency' => 'INR',
                'receipt' => 'rcpt_' . Str::random(12),
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => $response->json('error.description') ?? 'Unable to initiate Razorpay payment.',
            ], 502);
        }

        return response()->json([
            'order_id' => $response->json('id'),
            'amount' => $response->json('amount'),
            'currency' => $response->json('currency', 'INR'),
            'key' => $key,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if ($user?->needsMembershipToOrder()) {
            return redirect()->route('checkout')->with('error', 'Membership plan is required before you can place orders.');
        }
        if ($user && !$user->canPlaceOrder()) {
            return redirect()->route('checkout')->with('error', 'Retailer KYC approval is required before you can place orders.');
        }

        $request->validate([
            'address_id' => 'required|exists:addresses,id',
            'payment_method' => 'nullable|in:COD,ONLINE',
            'points_to_use' => 'nullable|integer|min:0',
            'coupon_code' => 'nullable|string|max:50',
            'razorpay_order_id' => 'nullable|string',
            'razorpay_payment_id' => 'nullable|string',
            'razorpay_signature' => 'nullable|string',
        ]);

        $cart = session('cart', []);
        if (empty($cart)) {
            return redirect()->route('home')->with('error', 'Cart is empty');
        }

        $address = Address::where('user_id', Auth::id())
            ->findOrFail($request->input('address_id'));

        $paymentMethod = $request->input('payment_method', PaymentMethod::COD->value);

        try {
            $order = DB::transaction(function () use ($cart, $address, $paymentMethod, $request) {
                $lockedUser = User::where('id', Auth::id())->lockForUpdate()->firstOrFail();
                $pricing = $this->calculateOrderPricing(
                    $cart,
                    $lockedUser,
                    (int) $request->input('points_to_use', 0),
                    $request->input('coupon_code'),
                    true
                );

                $isOnline = $paymentMethod === PaymentMethod::ONLINE->value && $pricing['payable_total'] > 0;

                if ($isOnline) {
                    $expectedSignature = hash_hmac(
                        'sha256',
                        $request->input('razorpay_order_id') . '|' . $request->input('razorpay_payment_id'),
                        config('services.razorpay.secret')
                    );

                    if (
                        !$request->filled('razorpay_order_id') ||
                        !$request->filled('razorpay_payment_id') ||
                        !hash_equals($expectedSignature, (string) $request->input('razorpay_signature'))
                    ) {
                        throw new \RuntimeException('Payment verification failed. Please try again.');
                    }
                }

                $variants = ProductVariant::whereIn('id', collect($cart)->pluck('id'))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($cart as $item) {
                    $variant = $variants->get($item['id']);
                    if (!$variant || $variant->stock < $item['quantity']) {
                        throw new \RuntimeException("Insufficient stock for {$item['name']}.");
                    }
                }

                $isPaid = $isOnline || $pricing['payable_total'] <= 0;

                $order = Order::create([
                    'user_id' => $lockedUser->id,
                    'address_id' => $address->id,
                    'total_amount' => $pricing['payable_total'],
                    'subtotal' => $pricing['items_total'],
                    'discount' => $pricing['total_discount'],
                    'coupon_code' => $pricing['coupon']?->code,
                    'coupon_discount' => $pricing['coupon_discount'],
                    'points_used' => $pricing['points_used'],
                    'delivery_fee' => $pricing['delivery_fee'],
                    'order_number' => 'TMP-' . Str::uuid(),
                    'address' => $address->toArray(),
                    'status' => OrderStatus::PENDING,
                    'payment_status' => $isPaid ? PaymentStatus::PAID : PaymentStatus::PENDING,
                    'payment_method' => $isOnline ? PaymentMethod::ONLINE : PaymentMethod::COD,
                ]);

                $orderNumber = 'ORD' . str_pad((string) $order->id, 8, '0', STR_PAD_LEFT);
                $order->update(['order_number' => $orderNumber]);

                Payment::create([
                    'order_id' => $order->id,
                    'user_id' => $lockedUser->id,
                    'gateway' => $isOnline ? 'razorpay' : ($pricing['payable_total'] <= 0 ? 'loyalty' : 'cod'),
                    'method' => $isOnline ? PaymentMethod::ONLINE : PaymentMethod::COD,
                    'status' => $isPaid ? PaymentStatus::PAID : PaymentStatus::PENDING,
                    'amount' => $pricing['payable_total'],
                    'currency' => 'INR',
                    'gateway_order_id' => $isOnline ? $request->input('razorpay_order_id') : null,
                    'gateway_payment_id' => $isOnline ? $request->input('razorpay_payment_id') : null,
                    'gateway_signature' => $isOnline ? $request->input('razorpay_signature') : null,
                    'paid_at' => $isPaid ? now() : null,
                ]);

                if ($pricing['coupon']) {
                    $pricing['coupon']->increment('used_count');
                }

                if ($pricing['points_used'] > 0) {
                    $lockedUser->decrement('loyalty_points', $pricing['points_used']);

                    LoyaltyTransaction::create([
                        'user_id' => $lockedUser->id,
                        'type' => 'ORDER_REDEEM',
                        'points' => -$pricing['points_used'],
                        'amount' => $pricing['points_discount'],
                        'description' => "Redeemed on Order #{$orderNumber}",
                        'order_id' => $order->id,
                    ]);
                }

                foreach ($cart as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['id'],
                        'product_name' => $item['name'],
                        'variant_name' => $item['unit_size'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                        'total' => $item['price'] * $item['quantity'],
                    ]);

                    $variants->get($item['id'])->decrement('stock', $item['quantity']);
                }

                return $order;
            });
        } catch (\RuntimeException $e) {
            return redirect()->route('checkout')->with('error', $e->getMessage());
        }

        session()->forget('cart');

        User::notifyAdmins(new NewOrderReceivedNotification($order, $user));

        return redirect()->route('ordersuccess', ['order' => $order->order_number]);
    }

    private function calculateOrderPricing(array $cart, User $user, int $requestedPoints, ?string $couponCode = null, bool $lockCoupon = false): array
    {
        $itemsTotal = (float) collect($cart)->sum(fn($i) => $i['price'] * $i['quantity']);
        $deliveryFee = 15.0;

        $coupon = null;
        $couponDiscount = 0.0;

        if ($couponCode && trim($couponCode) !== '') {
            $query = Coupon::where('code', strtoupper(trim($couponCode)));
            if ($lockCoupon) {
                $query->lockForUpdate();
            }
            $coupon = $query->first();

            if (!$coupon) {
                throw new \RuntimeException('Invalid coupon code.');
            }
            if ($error = $coupon->isValidForAmount($itemsTotal)) {
                throw new \RuntimeException($error);
            }

            $couponDiscount = $coupon->calculateDiscount($itemsTotal);
        }

        $afterCouponTotal = max(0, ($itemsTotal + $deliveryFee) - $couponDiscount);

        $config = Setting::getLoyaltyConfig();
        $pointsPerRupee = $config['points_per_rupee'];

        $maxPointsForOrder = (int) floor($afterCouponTotal * $pointsPerRupee);
        $maxUsablePoints = min((int) $user->loyalty_points, $maxPointsForOrder);
        $pointsUsed = max(0, min($requestedPoints, $maxUsablePoints));

        $pointsDiscount = round($pointsUsed / $pointsPerRupee, 2);
        $payableTotal = max(0, round($afterCouponTotal - $pointsDiscount, 2));

        return [
            'items_total' => $itemsTotal,
            'delivery_fee' => $deliveryFee,
            'coupon' => $coupon,
            'coupon_discount' => $couponDiscount,
            'points_used' => $pointsUsed,
            'points_discount' => $pointsDiscount,
            'total_discount' => round($couponDiscount + $pointsDiscount, 2),
            'payable_total' => $payableTotal,
        ];
    }
}

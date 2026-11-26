<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function createRazorpayOrder(Request $request): JsonResponse
    {
        $user = Auth::user();
        if ($user && !$user->canPlaceOrder()) {
            return response()->json(['message' => 'Retailer KYC approval is required before you can place orders.'], 403);
        }

        $request->validate([
            'address_id' => 'required|exists:addresses,id',
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

        $itemsTotal = collect($cart)->sum(fn($i) => $i['price'] * $i['quantity']);
        $deliveryCharge = 15;
        $grandTotal = $itemsTotal + $deliveryCharge;
        $amountInPaise = (int) round($grandTotal * 100);

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
        if ($user && !$user->canPlaceOrder()) {
            return redirect()->route('checkout')->with('error', 'Retailer KYC approval is required before you can place orders.');
        }

        $request->validate([
            'address_id' => 'required|exists:addresses,id',
            'payment_method' => 'nullable|in:COD,ONLINE',
            'razorpay_order_id' => 'required_if:payment_method,ONLINE|nullable|string',
            'razorpay_payment_id' => 'required_if:payment_method,ONLINE|nullable|string',
            'razorpay_signature' => 'required_if:payment_method,ONLINE|nullable|string',
        ]);

        $paymentMethod = $request->input('payment_method', PaymentMethod::COD->value);

        if ($paymentMethod === PaymentMethod::ONLINE->value) {
            $expectedSignature = hash_hmac(
                'sha256',
                $request->input('razorpay_order_id') . '|' . $request->input('razorpay_payment_id'),
                config('services.razorpay.secret')
            );

            if (!hash_equals($expectedSignature, (string) $request->input('razorpay_signature'))) {
                return redirect()->route('checkout')->with('error', 'Payment verification failed. Please try again.');
            }
        }

        $cart = session('cart', []);
        if (empty($cart)) {
            return redirect()->route('home')->with('error', 'Cart is empty');
        }

        $address = Address::where('user_id', Auth::id())
            ->findOrFail($request->input('address_id'));

        $itemsTotal = collect($cart)->sum(fn($i) => $i['price'] * $i['quantity']);
        $deliveryCharge = 15;
        $grandTotal = $itemsTotal + $deliveryCharge;

        try {
            $order = DB::transaction(function () use ($cart, $address, $itemsTotal, $deliveryCharge, $grandTotal, $paymentMethod, $request) {
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

                $isOnline = $paymentMethod === PaymentMethod::ONLINE->value;

                $order = Order::create([
                    'user_id' => Auth::id(),
                    'address_id' => $address->id,
                    'total_amount' => $grandTotal,
                    'subtotal' => $itemsTotal,
                    'discount' => 0,
                    'delivery_fee' => $deliveryCharge,
                    'order_number' => $this->generateOrderNumber(),
                    'address' => $address->toArray(),
                    'status' => OrderStatus::PENDING,
                    'payment_status' => $isOnline ? PaymentStatus::PAID : PaymentStatus::PENDING,
                    'payment_method' => $isOnline ? PaymentMethod::ONLINE : PaymentMethod::COD,
                ]);

                Payment::create([
                    'order_id' => $order->id,
                    'user_id' => Auth::id(),
                    'gateway' => $isOnline ? 'razorpay' : 'cod',
                    'method' => $isOnline ? PaymentMethod::ONLINE : PaymentMethod::COD,
                    'status' => $isOnline ? PaymentStatus::PAID : PaymentStatus::PENDING,
                    'amount' => $grandTotal,
                    'currency' => 'INR',
                    'gateway_order_id' => $isOnline ? $request->input('razorpay_order_id') : null,
                    'gateway_payment_id' => $isOnline ? $request->input('razorpay_payment_id') : null,
                    'gateway_signature' => $isOnline ? $request->input('razorpay_signature') : null,
                    'paid_at' => $isOnline ? now() : null,
                ]);

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

        return redirect()->route('ordersuccess', ['order' => $order->order_number]);
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'NB' . rand(10000000, 99999999);
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}

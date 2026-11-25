<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if ($user && !$user->canPlaceOrder()) {
            return redirect()->route('checkout')->with('error', 'Retailer KYC approval is required before you can place orders.');
        }

        $request->validate([
            'address_id' => 'required|exists:addresses,id',
        ]);

        $cart = session('cart', []);
        if (empty($cart)) {
            return redirect()->route('home')->with('error', 'Cart is empty');
        }

        $address = Address::where('user_id', Auth::id())
            ->findOrFail($request->input('address_id'));

        $itemsTotal = collect($cart)->sum(fn($i) => $i['price'] * $i['quantity']);
        $deliveryCharge = 15;
        $grandTotal = $itemsTotal + $deliveryCharge;

        $orderNumber = $this->generateOrderNumber();

        $order = Order::create([
            'user_id' => Auth::id(),
            'address_id' => $address->id,
            'total_amount' => $grandTotal,
            'subtotal' => $itemsTotal,
            'discount' => 0,
            'delivery_fee' => $deliveryCharge,
            'order_number' => $orderNumber,
            'address' => $address->toArray(),
            'status' => \App\Enums\OrderStatus::PENDING,
            'payment_status' => \App\Enums\PaymentStatus::PENDING,
            'payment_method' => \App\Enums\PaymentMethod::COD,
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

<?php

namespace App\Http\Controllers;

use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $variantId = $request->input('variant_id');
        $quantity = (int) $request->input('quantity', 1);

        $variant = ProductVariant::with('product')->findOrFail($variantId);
        $cart = session('cart', []);

        $isRetailer = auth()->check() && auth()->user()->isRetailer();
        $itemPrice = $isRetailer && $variant->bulk_price !== null
            ? (float) $variant->bulk_price
            : (float) $variant->retail_price;

        if (isset($cart[$variantId])) {
            $cart[$variantId]['quantity'] += $quantity;
        } else {
            $cart[$variantId] = [
                'id' => $variant->id,
                'product_id' => $variant->product->id,
                'name' => $variant->product->name . ' - ' . $variant->variant_name,
                'price' => $itemPrice,
                'unit_size' => $variant->unit_size,
                'image_url' => $variant->image_url,
                'quantity' => $quantity,
                'brand' => $variant->product->brand,
            ];
        }

        session(['cart' => $cart]);

        return back()->with('success', 'Item added to cart.');
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'variant_id' => 'required',
            'change' => 'required|integer',
        ]);

        $variantId = $request->input('variant_id');
        $change = (int) $request->input('change');

        $cart = session('cart', []);

        if (isset($cart[$variantId])) {
            $cart[$variantId]['quantity'] += $change;

            if ($cart[$variantId]['quantity'] <= 0) {
                unset($cart[$variantId]);
            }

            session(['cart' => $cart]);
        }

        return back();
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'variant_id' => 'required',
        ]);

        $variantId = $request->input('variant_id');
        $cart = session('cart', []);

        if (isset($cart[$variantId])) {
            unset($cart[$variantId]);
            session(['cart' => $cart]);
        }

        return back()->with('success', 'Item removed from cart.');
    }

    public function clear(): RedirectResponse
    {
        session()->forget('cart');
        return back();
    }
}


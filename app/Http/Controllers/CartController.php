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
        $variant = ProductVariant::with('product')->findOrFail($variantId);
        $cart = session('cart', []);

        $isRetailer = auth()->check() && auth()->user()->isRetailer();
        $minBulkQty = max(1, (int) ($variant->min_bulk_qty ?? 1));

        $quantity = (int) $request->input('quantity', 1);

        // If retailer is adding fresh to cart or quantity is lower than minimum bulk qty, enforce min_bulk_qty
        if ($isRetailer && !isset($cart[$variantId]) && $quantity < $minBulkQty) {
            $quantity = $minBulkQty;
        }

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
                'min_bulk_qty' => $minBulkQty,
            ];
        }

        session(['cart' => $cart]);

        return back();
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

            $isRetailer = auth()->check() && auth()->user()->isRetailer();
            $minBulkQty = $isRetailer && isset($cart[$variantId]['min_bulk_qty'])
                ? (int) $cart[$variantId]['min_bulk_qty']
                : 1;

            if ($cart[$variantId]['quantity'] < $minBulkQty || $cart[$variantId]['quantity'] <= 0) {
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


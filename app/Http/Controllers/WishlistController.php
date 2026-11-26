<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function toggle(Product $product): RedirectResponse
    {
        if (!Auth::check()) {
            $wishlist = (array) session('wishlist', []);

            if (in_array($product->id, $wishlist)) {
                $wishlist = array_values(array_diff($wishlist, [$product->id]));
                $message = 'Removed from wishlist';
            } else {
                $wishlist[] = $product->id;
                $message = 'Added to wishlist';
            }

            session(['wishlist' => $wishlist]);

            return back()->with('success', $message);
        }

        $deleted = Auth::user()->wishlists()->where('product_id', $product->id)->delete();

        if (! $deleted) {
            Auth::user()->wishlists()->create(['product_id' => $product->id]);
        }

        return back()->with('success', $deleted ? 'Removed from wishlist' : 'Added to wishlist');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if (!Auth::check()) {
            $wishlist = array_values(array_diff((array) session('wishlist', []), [$product->id]));
            session(['wishlist' => $wishlist]);
        } else {
            Auth::user()->wishlists()->where('product_id', $product->id)->delete();
        }

        return back()->with('success', 'Removed from wishlist');
    }
}


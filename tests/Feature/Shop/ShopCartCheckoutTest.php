<?php

namespace Tests\Feature\Shop;

use App\Models\Address;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShopCartCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_cart_and_checkout_flow(): void
    {
        $user = User::where('email', 'user@newbie.com')->first();
        $variant = ProductVariant::first();

        // 1. Add to cart
        $response = $this->actingAs($user)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 2,
        ]);
        $response->assertSessionHas('cart');
        $this->assertEquals(2, session('cart')[$variant->id]['quantity']);

        // 2. Update cart
        $this->actingAs($user)->post('/cart/update', [
            'variant_id' => $variant->id,
            'change' => 1,
        ]);
        $this->assertEquals(3, session('cart')[$variant->id]['quantity']);

        // 3. Create Address
        $this->actingAs($user)->post('/my-addresses', [
            'label' => 'Home',
            'line1' => '123 Main St',
            'city' => 'Bengaluru',
            'state' => 'Karnataka',
            'pincode' => '560001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);
        $address = Address::where('user_id', $user->id)->first();
        $this->assertNotNull($address);

        // 4. Place order
        $orderRes = $this->actingAs($user)->post('/checkout', [
            'address_id' => $address->id,
        ]);
        $orderRes->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'address_id' => $address->id,
        ]);
    }

    public function test_wishlist_toggle(): void
    {
        $user = User::where('email', 'user@newbie.com')->first();
        $product = Product::first();

        // Toggle on
        $this->actingAs($user)->post("/wishlist/{$product->id}/toggle");
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        // Toggle off
        $this->actingAs($user)->post("/wishlist/{$product->id}/toggle");
        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_customer_and_retailer_wishlist_pages_render_with_relations(): void
    {
        $customer = User::where('email', 'user@newbie.com')->first();
        $product = Product::first();

        // 1. Customer wishlists product
        $this->actingAs($customer)->post("/wishlist/{$product->id}/toggle");
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);

        // Customer views /wishlist
        $res = $this->actingAs($customer)->get('/wishlist');
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => $page
            ->component('Customer/Wishlist')
            ->has('wishlists', 1)
            ->where('wishlistProductIds', [$product->id])
        );

        // 2. Retailer wishlists product
        $retailer = User::where('email', 'retailer@newbie.com')->first();
        $this->actingAs($retailer)->post("/wishlist/{$product->id}/toggle");
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $retailer->id,
            'product_id' => $product->id,
        ]);

        // Retailer views /retailer/wishlist
        $resRetailer = $this->actingAs($retailer)->get('/retailer/wishlist');
        $resRetailer->assertStatus(200);
        $resRetailer->assertInertia(fn ($page) => $page
            ->component('Retailer/Wishlist')
            ->has('wishlists', 1)
            ->where('wishlistProductIds', [$product->id])
        );
    }

    public function test_retailer_adds_product_to_cart_enforces_min_bulk_qty_and_bulk_price(): void
    {
        $retailer = User::where('email', 'retailer@newbie.com')->first();
        $variant = ProductVariant::where('min_bulk_qty', '>', 1)->first();
        $this->assertNotNull($variant);

        // 1. Retailer adds to cart with quantity 1 (or default)
        $response = $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response->assertSessionHas('cart');
        $cart = session('cart');

        // Quantity should automatically be min_bulk_qty for retailer
        $this->assertEquals($variant->min_bulk_qty, $cart[$variant->id]['quantity']);
        // Price should be bulk_price
        $this->assertEquals((float) $variant->bulk_price, $cart[$variant->id]['price']);

        // 2. Decrementing below min_bulk_qty should remove item from cart
        $this->actingAs($retailer)->post('/cart/update', [
            'variant_id' => $variant->id,
            'change' => -1,
        ]);
        $updatedCart = session('cart');
        $this->assertArrayNotHasKey($variant->id, $updatedCart);
    }
}


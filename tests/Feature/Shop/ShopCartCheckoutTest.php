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
}


<?php

namespace Tests\Feature\Shop;

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
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

    public function test_guest_can_toggle_wishlist_and_view_wishlist_page(): void
    {
        $product = Product::first();

        // 1. Guest toggles product into wishlist
        $response = $this->post("/wishlist/{$product->id}/toggle");
        $response->assertSessionHas('wishlist', [$product->id]);

        // 2. Guest visiting /wishlist is redirected to login
        $pageRes = $this->get('/wishlist');
        $pageRes->assertRedirect('/login');

        // 3. Guest toggles again -> removed from session
        $removeRes = $this->post("/wishlist/{$product->id}/toggle");
        $removeRes->assertSessionHas('wishlist', []);
    }

    public function test_guest_wishlist_migrates_to_database_on_login(): void
    {
        $user = User::where('email', 'user@newbie.com')->first();
        $product = Product::first();

        // Guest has wishlist in session
        $this->withSession(['wishlist' => [$product->id]]);

        // User logs in
        $response = $this->post('/login', [
            'email' => 'user@newbie.com',
            'password' => 'password',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
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

    public function test_cannot_add_or_update_cart_beyond_available_stock(): void
    {
        $variant = ProductVariant::first();
        $variant->update(['stock' => 3]);

        // 1. Adding 4 units when stock is 3 should fail
        $res = $this->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 4,
        ]);
        $res->assertSessionHas('error');
        $this->assertEmpty(session('cart', []));

        // 2. Adding 3 units succeeds
        $this->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 3,
        ]);
        $this->assertEquals(3, session('cart')[$variant->id]['quantity']);

        // 3. Incrementing past 3 should fail and keep quantity at 3
        $incRes = $this->post('/cart/update', [
            'variant_id' => $variant->id,
            'change' => 1,
        ]);
        $incRes->assertSessionHas('error');
        $this->assertEquals(3, session('cart')[$variant->id]['quantity']);
    }

    public function test_razorpay_order_creation_and_signature_verification(): void
    {
        config()->set('services.razorpay.key', 'rzp_test_key');
        config()->set('services.razorpay.secret', 'rzp_test_secret');

        $user = User::where('email', 'user@newbie.com')->first();
        $variant = ProductVariant::with('product')->first();
        $address = Address::create([
            'user_id' => $user->id,
            'label' => 'Home',
            'line1' => '123 Main St',
            'city' => 'Patna',
            'state' => 'Bihar',
            'pincode' => '800001',
            'phone' => '9876543210',
        ]);

        $cart = [
            $variant->id => [
                'id' => $variant->id,
                'product_id' => $variant->product_id,
                'name' => $variant->product->name,
                'unit_size' => $variant->unit_size,
                'price' => 50,
                'quantity' => 2,
            ],
        ];

        Http::fake([
            'https://api.razorpay.com/v1/orders' => Http::response([
                'id' => 'order_test_123',
                'amount' => 11500, // (50*2 + 15 delivery) * 100
                'currency' => 'INR',
            ], 200),
        ]);

        // 1. Create Razorpay order
        $rzpRes = $this->actingAs($user)
            ->withSession(['cart' => $cart])
            ->postJson(route('checkout.razorpay-order'), ['address_id' => $address->id]);

        $rzpRes->assertOk()
            ->assertJson([
                'order_id' => 'order_test_123',
                'amount' => 11500,
                'currency' => 'INR',
                'key' => 'rzp_test_key',
            ]);

        // 2. Invalid signature fails
        $badRes = $this->actingAs($user)
            ->withSession(['cart' => $cart])
            ->post(route('checkout.place-order'), [
                'address_id' => $address->id,
                'payment_method' => 'ONLINE',
                'razorpay_order_id' => 'order_test_123',
                'razorpay_payment_id' => 'pay_test_456',
                'razorpay_signature' => 'invalid_sig',
            ]);

        $badRes->assertRedirect(route('checkout'));
        $badRes->assertSessionHas('error');

        // 3. Valid signature creates PAID order
        $validSignature = hash_hmac('sha256', 'order_test_123|pay_test_456', 'rzp_test_secret');

        $okRes = $this->actingAs($user)
            ->withSession(['cart' => $cart])
            ->post(route('checkout.place-order'), [
                'address_id' => $address->id,
                'payment_method' => 'ONLINE',
                'razorpay_order_id' => 'order_test_123',
                'razorpay_payment_id' => 'pay_test_456',
                'razorpay_signature' => $validSignature,
            ]);

        $okRes->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'payment_method' => 'ONLINE',
            'payment_status' => 'PAID',
        ]);

        $order = Order::where('user_id', $user->id)->latest('id')->first();
        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'user_id' => $user->id,
            'gateway' => 'razorpay',
            'method' => 'ONLINE',
            'status' => 'PAID',
            'gateway_order_id' => 'order_test_123',
            'gateway_payment_id' => 'pay_test_456',
        ]);
    }
}


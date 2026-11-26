<?php

namespace Tests\Feature\Shop;

use App\Models\Address;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::where('email', 'admin@newbie.com')->first();
        $this->customer = User::where('email', 'user@newbie.com')->first();
    }

    public function test_admin_can_crud_coupons(): void
    {
        // Create
        $this->actingAs($this->admin)->post(route('admin.coupons.store'), [
            'code' => 'save20',
            'type' => 'PERCENT',
            'value' => 20,
            'min_order_amount' => 100,
            'max_discount_amount' => 50,
            'usage_limit' => 10,
            'is_active' => true,
        ])->assertRedirect(route('admin.coupons.index'));

        $coupon = Coupon::where('code', 'SAVE20')->first();
        $this->assertNotNull($coupon);

        // Update
        $this->actingAs($this->admin)->put(route('admin.coupons.update', $coupon), [
            'code' => 'SAVE25',
            'type' => 'PERCENT',
            'value' => 25,
            'min_order_amount' => 100,
            'is_active' => true,
        ])->assertRedirect(route('admin.coupons.index'));

        $this->assertEquals('SAVE25', $coupon->fresh()->code);

        // Toggle active
        $this->actingAs($this->admin)->post(route('admin.coupons.toggle-active', $coupon));
        $this->assertFalse($coupon->fresh()->is_active);

        // Delete
        $this->actingAs($this->admin)->delete(route('admin.coupons.destroy', $coupon))
            ->assertRedirect(route('admin.coupons.index'));
        $this->assertDatabaseMissing('coupons', ['id' => $coupon->id]);
    }

    public function test_coupon_validation_and_checkout_application(): void
    {
        $variant = ProductVariant::with('product')->first();
        $address = Address::create([
            'user_id' => $this->customer->id,
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
                'price' => 100,
                'quantity' => 2, // subtotal = 200
            ],
        ];

        $coupon = Coupon::create([
            'code' => 'FLAT30',
            'type' => 'FIXED',
            'value' => 30,
            'min_order_amount' => 150,
            'usage_limit' => 5,
            'is_active' => true,
        ]);

        // 1. Apply valid coupon
        $this->actingAs($this->customer)
            ->withSession(['cart' => $cart])
            ->postJson(route('checkout.coupon'), ['code' => 'flat30'])
            ->assertOk()
            ->assertJson([
                'code' => 'FLAT30',
                'discount' => 30.0,
            ]);

        // 2. Expired coupon rejected
        Coupon::create([
            'code' => 'EXPIRED',
            'type' => 'FIXED',
            'value' => 20,
            'expires_at' => now()->subDay(),
            'is_active' => true,
        ]);

        $this->actingAs($this->customer)
            ->withSession(['cart' => $cart])
            ->postJson(route('checkout.coupon'), ['code' => 'EXPIRED'])
            ->assertStatus(422);

        // 3. Place order with FLAT30 -> subtotal 200 + 15 delivery - 30 coupon = 185
        $this->actingAs($this->customer)
            ->withSession(['cart' => $cart])
            ->post(route('checkout.place-order'), [
                'address_id' => $address->id,
                'payment_method' => 'COD',
                'coupon_code' => 'FLAT30',
            ])
            ->assertRedirect();

        $order = Order::where('user_id', $this->customer->id)->latest('id')->first();
        $this->assertEquals('FLAT30', $order->coupon_code);
        $this->assertEquals(30.00, (float) $order->coupon_discount);
        $this->assertEquals(185.00, (float) $order->total_amount);
        $this->assertEquals(1, $coupon->fresh()->used_count);
    }
}


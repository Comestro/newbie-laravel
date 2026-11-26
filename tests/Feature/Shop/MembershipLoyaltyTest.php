<?php

namespace Tests\Feature\Shop;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Address;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MembershipLoyaltyTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::where('email', 'admin@newbie.com')->first();
        config()->set('services.razorpay.key', 'rzp_test_key');
        config()->set('services.razorpay.secret', 'rzp_test_secret');
    }

    private function createNewCustomer(): array
    {
        $user = User::create([
            'name' => 'Fresh Customer',
            'email' => 'fresh@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::USER,
            'is_member' => false,
            'loyalty_points' => 0,
        ]);

        $address = Address::create([
            'user_id' => $user->id,
            'label' => 'Home',
            'line1' => '123 Test St',
            'city' => 'Patna',
            'state' => 'Bihar',
            'pincode' => '800001',
            'phone' => '9876543210',
        ]);

        $variant = ProductVariant::with('product')->first();
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

        return [$user, $address, $cart];
    }

    public function test_admin_can_update_loyalty_and_membership_settings(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.settings.update'), [
            'membership_fee' => 99,
            'membership_bonus_points' => 10000,
            'points_per_rupee' => 50,
            'require_membership_for_order' => false,
        ]);

        $response->assertRedirect();
        $config = Setting::getLoyaltyConfig();

        $this->assertEquals(99, $config['membership_fee']);
        $this->assertEquals(10000, $config['membership_bonus_points']);
        $this->assertEquals(50, $config['points_per_rupee']);
        $this->assertFalse($config['require_membership_for_order']);
    }

    public function test_new_user_requires_membership_when_setting_enabled_and_can_bypass_when_disabled(): void
    {
        [$user, $address, $cart] = $this->createNewCustomer();

        // 1. Default require_membership_for_order = true -> blocked
        $res = $this->actingAs($user)
            ->withSession(['cart' => $cart])
            ->post(route('checkout.place-order'), ['address_id' => $address->id]);

        $res->assertRedirect(route('checkout'));
        $res->assertSessionHas('error', 'Membership plan is required before you can place orders.');

        // 2. Admin disables require_membership_for_order -> allowed
        $this->actingAs($this->admin)->post(route('admin.settings.update'), [
            'membership_fee' => 49,
            'membership_bonus_points' => 5000,
            'points_per_rupee' => 100,
            'require_membership_for_order' => false,
        ]);

        $okRes = $this->actingAs($user->fresh())
            ->withSession(['cart' => $cart])
            ->post(route('checkout.place-order'), ['address_id' => $address->id]);

        $okRes->assertRedirect();
        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
    }

    public function test_user_can_buy_membership_and_topup_points_via_razorpay(): void
    {
        [$user] = $this->createNewCustomer();

        Http::fake([
            'https://api.razorpay.com/v1/orders' => Http::response([
                'id' => 'order_mem_1',
                'amount' => 4900,
                'currency' => 'INR',
            ], 200),
        ]);

        // 1. Initiate membership order
        $this->actingAs($user)
            ->postJson(route('loyalty.membership.order'))
            ->assertOk()
            ->assertJson(['order_id' => 'order_mem_1', 'amount' => 4900]);

        // 2. Verify membership payment -> 5000 points credited
        $sig = hash_hmac('sha256', 'order_mem_1|pay_mem_1', 'rzp_test_secret');
        $this->actingAs($user)
            ->post(route('loyalty.membership.verify'), [
                'razorpay_order_id' => 'order_mem_1',
                'razorpay_payment_id' => 'pay_mem_1',
                'razorpay_signature' => $sig,
            ])
            ->assertRedirect();

        $user->refresh();
        $this->assertTrue($user->is_member);
        $this->assertEquals(5000, $user->loyalty_points);

        // 3. Direct top-up of ₹20 -> +2000 points (total 7000)
        $topupSig = hash_hmac('sha256', 'order_top_1|pay_top_1', 'rzp_test_secret');
        $this->actingAs($user)
            ->post(route('loyalty.topup.verify'), [
                'amount' => 20,
                'razorpay_order_id' => 'order_top_1',
                'razorpay_payment_id' => 'pay_top_1',
                'razorpay_signature' => $topupSig,
            ])
            ->assertRedirect();

        $this->assertEquals(7000, $user->fresh()->loyalty_points);
    }

    public function test_redeeming_loyalty_points_at_checkout_and_refunding_on_cancel(): void
    {
        [$user, $address, $cart] = $this->createNewCustomer();
        $user->update(['is_member' => true, 'loyalty_points' => 5000]);

        // Order total: (50*2) + 15 delivery = 115. Redeem 3000 pts = ₹30 discount -> payable ₹85
        $this->actingAs($user)
            ->withSession(['cart' => $cart])
            ->post(route('checkout.place-order'), [
                'address_id' => $address->id,
                'payment_method' => 'COD',
                'points_to_use' => 3000,
            ])
            ->assertRedirect();

        $order = Order::where('user_id', $user->id)->latest('id')->first();
        $this->assertEquals(3000, $order->points_used);
        $this->assertEquals(30.00, (float) $order->discount);
        $this->assertEquals(85.00, (float) $order->total_amount);
        $this->assertEquals(2000, $user->fresh()->loyalty_points);

        // Admin cancels order -> 3000 points refunded back to user (total 5000)
        $this->actingAs($this->admin)->post(route('admin.orders.status', $order), [
            'status' => OrderStatus::CANCELLED->value,
        ]);

        $this->assertEquals(5000, $user->fresh()->loyalty_points);
    }
}


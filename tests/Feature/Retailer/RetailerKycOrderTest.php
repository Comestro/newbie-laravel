<?php

namespace Tests\Feature\Retailer;

use App\Enums\UserRole;
use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\RetailerProfile;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RetailerKycOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_retailer_registration_creates_account_with_pending_kyc(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test Retailer',
            'email' => 'newretailer@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'RETAILER',
        ]);

        $response->assertRedirect('/dashboard');

        $user = User::where('email', 'newretailer@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(UserRole::RETAILER, $user->role);
        $this->assertTrue($user->isRetailer());
        $this->assertFalse($user->isKycApproved());
        $this->assertFalse($user->canPlaceOrder());

        $profile = RetailerProfile::where('user_id', $user->id)->first();
        $this->assertNotNull($profile);
        $this->assertEquals('PENDING', $profile->status);
    }

    public function test_retailer_gets_bulk_price_in_cart(): void
    {
        $retailer = User::create([
            'name' => 'Shop Owner',
            'email' => 'shopowner@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
        ]);
        RetailerProfile::create([
            'user_id' => $retailer->id,
            'status' => 'PENDING',
        ]);

        $customer = User::where('email', 'user@newbie.com')->first();

        $variant = ProductVariant::whereNotNull('bulk_price')->first();
        $this->assertNotNull($variant);
        $this->assertNotEquals($variant->retail_price, $variant->bulk_price);

        // Retailer adds to cart
        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 5,
        ]);
        $this->assertEquals($variant->bulk_price, session('cart')[$variant->id]['price']);

        // Clear cart session
        session()->forget('cart');

        // Normal customer adds to cart
        $this->actingAs($customer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 5,
        ]);
        $this->assertEquals($variant->retail_price, session('cart')[$variant->id]['price']);
    }

    public function test_retailer_cannot_place_order_when_kyc_is_pending(): void
    {
        $retailer = User::create([
            'name' => 'Shop Owner',
            'email' => 'pendingkyc@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
        ]);
        RetailerProfile::create([
            'user_id' => $retailer->id,
            'status' => 'PENDING',
        ]);

        $address = Address::create([
            'user_id' => $retailer->id,
            'label' => 'Shop',
            'line1' => 'Main Market, Shop 42',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'pincode' => '302001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        $variant = ProductVariant::first();

        // Add to cart
        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        // Attempt order placement
        $response = $this->actingAs($retailer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHas('error', 'Retailer KYC approval is required before you can place orders.');

        // Verify order was NOT created
        $this->assertEquals(0, Order::where('user_id', $retailer->id)->count());
    }

    public function test_retailer_cannot_place_order_when_kyc_is_rejected(): void
    {
        $retailer = User::create([
            'name' => 'Rejected Shop',
            'email' => 'rejected@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
        ]);
        RetailerProfile::create([
            'user_id' => $retailer->id,
            'status' => 'REJECTED',
            'rejection_reason' => 'Aadhaar card image is blur and unreadable.',
        ]);

        $address = Address::create([
            'user_id' => $retailer->id,
            'label' => 'Shop',
            'line1' => 'Market Square',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'pincode' => '302001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        $variant = ProductVariant::first();

        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($retailer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHas('error', 'Retailer KYC approval is required before you can place orders.');
        $this->assertEquals(0, Order::where('user_id', $retailer->id)->count());
    }

    public function test_retailer_cannot_place_order_when_kyc_is_unsubmitted(): void
    {
        $retailer = User::create([
            'name' => 'Unsubmitted KYC Shop',
            'email' => 'unsubmitted@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
        ]);
        // Note: No RetailerProfile record created

        $address = Address::create([
            'user_id' => $retailer->id,
            'label' => 'Shop',
            'line1' => 'Market Square',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'pincode' => '302001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        $variant = ProductVariant::first();

        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($retailer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHas('error', 'Retailer KYC approval is required before you can place orders.');
        $this->assertEquals(0, Order::where('user_id', $retailer->id)->count());
    }

    public function test_admin_can_approve_retailer_and_retailer_can_place_order(): void
    {
        $admin = User::where('email', 'admin@newbie.com')->first();

        $retailer = User::create([
            'name' => 'Approved Retailer',
            'email' => 'approved@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
        ]);
        $profile = RetailerProfile::create([
            'user_id' => $retailer->id,
            'status' => 'PENDING',
            'aadhaar_card' => '123456789012',
        ]);

        $address = Address::create([
            'user_id' => $retailer->id,
            'label' => 'Shop',
            'line1' => 'Market Square',
            'city' => 'Delhi',
            'state' => 'Delhi',
            'pincode' => '110001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        // 1. Admin approves KYC
        $approveResponse = $this->actingAs($admin)->post("/admin/review-retailer/{$retailer->id}/approve");
        $approveResponse->assertSessionHas('success');

        $profile->refresh();
        $this->assertEquals('VERIFIED', $profile->status);
        $this->assertNotNull($profile->approved_at);

        $retailer->refresh();
        $this->assertTrue($retailer->isKycApproved());
        $this->assertTrue($retailer->canPlaceOrder());

        // 2. Retailer adds item to cart & places order successfully
        $variant = ProductVariant::first();
        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $orderResponse = $this->actingAs($retailer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $orderResponse->assertSessionMissing('error');
        $this->assertEquals(1, Order::where('user_id', $retailer->id)->count());

        $order = Order::where('user_id', $retailer->id)->first();
        $this->assertNotNull($order);
        $orderResponse->assertRedirect(route('ordersuccess', ['order' => $order->order_number]));
    }

    public function test_regular_customer_can_place_order_without_kyc(): void
    {
        $customer = User::where('email', 'user@newbie.com')->first();
        $this->assertTrue($customer->canPlaceOrder());

        $address = Address::where('user_id', $customer->id)->first() ?? Address::create([
            'user_id' => $customer->id,
            'label' => 'Home',
            'line1' => '123 Main St',
            'city' => 'Bengaluru',
            'state' => 'Karnataka',
            'pincode' => '560001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        $variant = ProductVariant::first();
        $this->actingAs($customer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($customer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $response->assertSessionMissing('error');
        $this->assertDatabaseHas('orders', [
            'user_id' => $customer->id,
        ]);
    }
}
